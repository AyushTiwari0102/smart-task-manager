/**
 * api-gateway/server.js
 * Express BFF + Socket.io server for Smart Task Manager
 *
 * Responsibilities:
 *  1. Proxy all /api/* requests to Spring Boot backend
 *  2. Broadcast real-time events via Socket.io (task CRUD)
 *  3. AI priority scoring endpoint (/ai/score)
 *  4. Gamification XP tracking (/api/xp)
 */

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:8080';
const PORT = process.env.PORT || 3001;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// ── Health ────────────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'UP', service: 'api-gateway' }));

// ── Socket.io ─────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: '*' },
  path: '/socket.io',
});

io.on('connection', (socket) => {
  console.log(`[WS] Client connected: ${socket.id}`);
  socket.on('disconnect', () => console.log(`[WS] Client gone: ${socket.id}`));
});

// Expose emit globally so proxy hooks can broadcast
global.io = io;

// ── AI Priority Scoring ───────────────────────────────────────────────────────
/**
 * POST /ai/score
 * Body: { title, description, dueDate }
 * Returns: { priority, score, urgencyLabel, suggestion }
 */
const URGENT_WORDS = ['urgent', 'asap', 'critical', 'emergency', 'immediately', 'deadline', 'important', 'blocker', 'fix', 'bug', 'crash', 'production'];
const HIGH_WORDS   = ['review', 'meeting', 'submit', 'deploy', 'release', 'exam', 'assignment', 'presentation', 'interview'];
const LOW_WORDS    = ['read', 'explore', 'research', 'learn', 'watch', 'maybe', 'someday', 'idea'];

app.post('/ai/score', (req, res) => {
  const { title = '', description = '', dueDate } = req.body;
  const text = `${title} ${description}`.toLowerCase();

  let score = 50;
  let reasons = [];

  // Keyword scoring
  const urgentHits = URGENT_WORDS.filter(w => text.includes(w));
  const highHits   = HIGH_WORDS.filter(w => text.includes(w));
  const lowHits    = LOW_WORDS.filter(w => text.includes(w));

  score += urgentHits.length * 18;
  score += highHits.length * 8;
  score -= lowHits.length * 12;

  if (urgentHits.length) reasons.push(`Contains urgency keywords: ${urgentHits.join(', ')}`);
  if (lowHits.length)    reasons.push(`Low-urgency language detected`);

  // Due date proximity scoring
  if (dueDate) {
    const hoursUntilDue = (new Date(dueDate) - Date.now()) / 36e5;
    if (hoursUntilDue < 0)   { score += 40; reasons.push('Overdue!'); }
    else if (hoursUntilDue < 12)  { score += 35; reasons.push('Due in < 12 hours'); }
    else if (hoursUntilDue < 24)  { score += 25; reasons.push('Due today'); }
    else if (hoursUntilDue < 72)  { score += 12; reasons.push('Due this week'); }
  }

  // Title length heuristic — very short titles are usually vague = low priority
  if (title.length < 6) { score -= 8; reasons.push('Vague title'); }

  // Clamp
  score = Math.min(100, Math.max(0, Math.round(score)));

  let priority, urgencyLabel, suggestion;
  if (score >= 75) {
    priority = 'HIGH';
    urgencyLabel = score >= 90 ? '🔥 Critical' : '🔴 High';
    suggestion = 'Do this first. Block time on your calendar.';
  } else if (score >= 40) {
    priority = 'MEDIUM';
    urgencyLabel = '⚡ Medium';
    suggestion = 'Schedule for today or tomorrow.';
  } else {
    priority = 'LOW';
    urgencyLabel = '🟢 Low';
    suggestion = 'Add to backlog. Do when free.';
  }

  res.json({ priority, score, urgencyLabel, suggestion, reasons });
});

// ── Gamification: XP store (in-memory, keyed by userId) ──────────────────────
const xpStore = {};

const XP_REWARDS = { CREATE: 10, COMPLETE: 25, BEFORE_DUE: 50, DELETE: 2, UPDATE: 5 };

app.post('/xp/award', (req, res) => {
  const { userId, action, taskDueDate } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  if (!xpStore[userId]) xpStore[userId] = { xp: 0, streak: 0, lastActive: null, completedToday: 0, badges: [] };
  const user = xpStore[userId];

  let earned = XP_REWARDS[action] || 0;

  // Bonus XP if completing before due
  if (action === 'COMPLETE' && taskDueDate) {
    const hoursLeft = (new Date(taskDueDate) - Date.now()) / 36e5;
    if (hoursLeft > 0) earned += XP_REWARDS.BEFORE_DUE;
  }

  user.xp += earned;
  user.completedToday += (action === 'COMPLETE') ? 1 : 0;

  // Streak logic
  const today = new Date().toDateString();
  if (user.lastActive !== today) {
    const yesterday = new Date(Date.now() - 864e5).toDateString();
    user.streak = (user.lastActive === yesterday) ? user.streak + 1 : 1;
    user.lastActive = today;
    user.completedToday = action === 'COMPLETE' ? 1 : 0;
  }

  // Badge unlocks
  const rank = getRank(user.xp);
  if (!user.badges.includes(rank)) user.badges.push(rank);

  res.json({ earned, xp: user.xp, streak: user.streak, rank, badges: user.badges });
});

app.get('/xp/:userId', (req, res) => {
  const user = xpStore[req.params.userId] || { xp: 0, streak: 0, rank: 'Beginner', badges: [] };
  res.json({ ...user, rank: getRank(user.xp) });
});

function getRank(xp) {
  if (xp >= 2000) return '👑 CTO';
  if (xp >= 1000) return '🚀 Architect';
  if (xp >= 500)  return '🔥 Senior Dev';
  if (xp >= 200)  return '⚡ Developer';
  return '🌱 Beginner';
}

// ── Proxy interceptor to broadcast Socket.io events ───────────────────────────
/**
 * We wrap the proxy to intercept responses from the backend.
 * When a task is created, updated, or deleted — we broadcast a WS event
 * so all connected clients refresh in real time.
 */
function broadcastingProxy(path, method, eventName) {
  return async (req, res, next) => {
    const axios = require('axios');
    try {
      const headers = { ...req.headers, host: undefined };
      const config = {
        method,
        url: `${BACKEND_URL}${req.originalUrl}`,
        headers,
        data: req.body,
        validateStatus: () => true,
      };
      const backendRes = await axios(config);

      // Forward status + headers
      res.status(backendRes.status);
      const ct = backendRes.headers['content-type'];
      if (ct) res.setHeader('content-type', ct);

      // Broadcast WS event on success
      if (backendRes.status >= 200 && backendRes.status < 300) {
        io.emit(eventName, { data: backendRes.data, timestamp: Date.now() });
      }

      res.json(backendRes.data);
    } catch (err) {
      next(err);
    }
  };
}

// Task event broadcasts
app.post('/api/tasks',             broadcastingProxy('/api/tasks', 'POST',   'task:created'));
app.put('/api/tasks/:id',          broadcastingProxy('/api/tasks', 'PUT',    'task:updated'));
app.delete('/api/tasks/:id',       broadcastingProxy('/api/tasks', 'DELETE', 'task:deleted'));

// ── General proxy: everything else → Spring Boot ──────────────────────────────
app.use('/', createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  on: {
    error: (err, req, res) => {
      console.error('[Proxy Error]', err.message);
      res.status(502).json({ error: 'Backend unavailable' });
    },
  },
}));

// ── Start ─────────────────────────────────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║  🟢 API Gateway running on :${PORT}    ║
  ║  Proxying to: ${BACKEND_URL}  ║
  ╚══════════════════════════════════════╝
  `);
});
