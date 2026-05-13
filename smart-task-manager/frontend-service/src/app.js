/**
 * Smart Task Manager - Frontend JavaScript
 *
 * Handles all client-side logic:
 * - Authentication (register / login / logout)
 * - Task CRUD operations via REST API
 * - Dynamic UI rendering
 * - State management (token, current user, active filter)
 */

'use strict';

// ============================================================
// CONFIGURATION
// ============================================================

/**
 * API base URL — uses /api which nginx proxies to the backend container.
 * In development, override to http://localhost:8080/api
 */
const API_BASE = '/api';

// ============================================================
// STATE
// ============================================================

const state = {
    token: localStorage.getItem('stm_token') || null,
    user: JSON.parse(localStorage.getItem('stm_user') || 'null'),
    tasks: [],          // all tasks for current user
    filteredTasks: [],  // currently displayed tasks
    activeFilter: null, // null = all
    pendingDeleteId: null
};

// ============================================================
// UTILS
// ============================================================

/**
 * Fetch wrapper that auto-attaches the JWT Authorization header.
 * @param {string} endpoint - relative path e.g. '/tasks'
 * @param {object} options  - fetch options (method, body, etc.)
 */
async function apiFetch(endpoint, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
    if (res.status === 401) { logout(); throw new Error('Session expired'); }
    return res;
}

/** Show a toast notification */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

/** Show/hide loading state on a button */
function setLoading(btnId, loading) {
    const btn = document.getElementById(btnId);
    const text = btn.querySelector('.btn-text');
    const spinner = btn.querySelector('.btn-spinner');
    if (!text || !spinner) return;
    text.classList.toggle('hidden', loading);
    spinner.classList.toggle('hidden', !loading);
    btn.disabled = loading;
}

/** Format a date for display */
function formatDate(dateStr) {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Switch between login and register tabs */
function switchTab(tab) {
    const isLogin = tab === 'login';
    document.getElementById('login-form').classList.toggle('hidden', !isLogin);
    document.getElementById('register-form').classList.toggle('hidden', isLogin);
    document.getElementById('tab-login').classList.toggle('active', isLogin);
    document.getElementById('tab-register').classList.toggle('active', !isLogin);
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('reg-error').classList.add('hidden');
}

/** Show/hide screens */
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active');
        s.classList.add('hidden');
    });
    const target = document.getElementById(screenId);
    target.classList.remove('hidden');
    target.classList.add('active');
}

// ============================================================
// AUTH
// ============================================================

async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    errorEl.classList.add('hidden');
    setLoading('login-btn', true);

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Login failed');

        persistSession(data);
        initDashboard();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    } finally {
        setLoading('login-btn', false);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const errorEl = document.getElementById('reg-error');

    errorEl.classList.add('hidden');
    setLoading('reg-btn', true);

    try {
        const res = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Registration failed');

        persistSession(data);
        initDashboard();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    } finally {
        setLoading('reg-btn', false);
    }
}

function persistSession(data) {
    state.token = data.token;
    state.user = { id: data.userId, name: data.name, email: data.email };
    localStorage.setItem('stm_token', data.token);
    localStorage.setItem('stm_user', JSON.stringify(state.user));
}

function logout() {
    state.token = null;
    state.user = null;
    state.tasks = [];
    localStorage.removeItem('stm_token');
    localStorage.removeItem('stm_user');
    showScreen('auth-screen');
    switchTab('login');
}

// ============================================================
// DASHBOARD INIT
// ============================================================

function initDashboard() {
    if (!state.token || !state.user) { showScreen('auth-screen'); return; }

    // Populate user info in sidebar
    document.getElementById('sidebar-username').textContent = state.user.name;
    document.getElementById('sidebar-email').textContent = state.user.email;
    document.getElementById('user-avatar-text').textContent =
        state.user.name.charAt(0).toUpperCase();

    showScreen('dashboard-screen');
    loadTasks();
    loadStats();
}

// ============================================================
// TASKS - Load & Render
// ============================================================

async function loadTasks() {
    const listEl = document.getElementById('task-list');
    listEl.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Loading tasks...</p></div>`;

    try {
        const url = state.activeFilter ? `/tasks?status=${state.activeFilter}` : '/tasks';
        const res = await apiFetch(url);
        if (!res.ok) throw new Error('Failed to load tasks');

        state.tasks = await res.json();
        renderTaskList(state.tasks);
    } catch (err) {
        listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">⚠️</div><p>${err.message}</p></div>`;
    }
}

async function loadStats() {
    try {
        const res = await apiFetch('/tasks/stats');
        if (!res.ok) return;
        const stats = await res.json();

        document.getElementById('stat-total').querySelector('.stat-value').textContent = stats.total ?? 0;
        document.getElementById('stat-todo').querySelector('.stat-value').textContent = stats.byStatus?.TODO ?? 0;
        document.getElementById('stat-progress').querySelector('.stat-value').textContent = stats.byStatus?.IN_PROGRESS ?? 0;
        document.getElementById('stat-done').querySelector('.stat-value').textContent = stats.byStatus?.DONE ?? 0;
    } catch (e) { /* non-critical */ }
}

function renderTaskList(tasks) {
    const listEl = document.getElementById('task-list');
    const countEl = document.getElementById('task-count-label');

    countEl.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

    if (!tasks.length) {
        listEl.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✦</div>
                <p>No tasks here yet.</p>
                <button class="btn-primary" onclick="openModal()" style="margin-top:8px">＋ Add your first task</button>
            </div>`;
        return;
    }

    listEl.innerHTML = tasks.map((task, i) => buildTaskCard(task, i)).join('');
}

function buildTaskCard(task, index) {
    const statusLabel = { TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[task.status] || task.status;
    const statusBadge = { TODO: 'badge-todo', IN_PROGRESS: 'badge-progress', DONE: 'badge-done' }[task.status] || '';
    const priorityBadge = { LOW: 'badge-low', MEDIUM: 'badge-medium', HIGH: 'badge-high' }[task.priority] || '';
    const priorityIcon = { LOW: '🟢', MEDIUM: '🟡', HIGH: '🔴' }[task.priority] || '';
    const doneClass = task.status === 'DONE' ? 'done' : '';
    const dueDateHtml = task.dueDate
        ? `<span class="badge" style="color:var(--text-muted);background:rgba(255,255,255,0.05)">📅 ${formatDate(task.dueDate)}</span>`
        : '';

    return `
        <div class="task-card glass" style="animation-delay:${index * 0.04}s" onclick="openEditModal(${task.id})">
            <div class="task-status-indicator ${task.status}"></div>
            <div class="task-body">
                <div class="task-title ${doneClass}">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    ${task.description ? `<span class="task-desc">${escapeHtml(task.description)}</span>` : ''}
                    <span class="badge ${statusBadge}">${statusLabel}</span>
                    <span class="badge ${priorityBadge}">${priorityIcon} ${task.priority}</span>
                    ${dueDateHtml}
                </div>
            </div>
            <div class="task-actions" onclick="event.stopPropagation()">
                <button class="task-action-btn" onclick="openEditModal(${task.id})" title="Edit">✏️</button>
                <button class="task-action-btn delete" onclick="promptDelete(${task.id})" title="Delete">🗑</button>
            </div>
        </div>`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ============================================================
// FILTER
// ============================================================

function filterTasks(status) {
    state.activeFilter = status;

    // Update nav active state
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navMap = { null: 'nav-all', 'TODO': 'nav-todo', 'IN_PROGRESS': 'nav-inprogress', 'DONE': 'nav-done' };
    document.getElementById(navMap[status] ?? 'nav-all')?.classList.add('active');

    // Update title
    const titleMap = { null: 'All Tasks', 'TODO': 'To Do', 'IN_PROGRESS': 'In Progress', 'DONE': 'Done' };
    document.getElementById('view-title').textContent = titleMap[status] ?? 'All Tasks';

    loadTasks();
}

// ============================================================
// MODAL - Create / Edit Task
// ============================================================

function openModal() {
    document.getElementById('modal-title').textContent = 'New Task';
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('modal-error').classList.add('hidden');
    document.getElementById('task-modal').classList.remove('hidden');
}

function openEditModal(taskId) {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('modal-title').textContent = 'Edit Task';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.description || '';
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-status').value = task.status;
    if (task.dueDate) {
        document.getElementById('task-due').value = task.dueDate.slice(0, 16);
    }
    document.getElementById('modal-error').classList.add('hidden');
    document.getElementById('task-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('task-modal').classList.add('hidden');
}

function closeModalOnOverlay(event) {
    if (event.target === document.getElementById('task-modal')) closeModal();
}

async function handleSaveTask(event) {
    event.preventDefault();
    const taskId = document.getElementById('task-id').value;
    const isEdit = !!taskId;
    const errorEl = document.getElementById('modal-error');

    const payload = {
        title: document.getElementById('task-title').value.trim(),
        description: document.getElementById('task-desc').value.trim() || null,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        dueDate: document.getElementById('task-due').value || null
    };

    errorEl.classList.add('hidden');
    const btn = document.getElementById('save-task-btn');
    btn.disabled = true;
    btn.textContent = 'Saving...';

    try {
        const url = isEdit ? `/tasks/${taskId}` : '/tasks';
        const method = isEdit ? 'PUT' : 'POST';
        const res = await apiFetch(url, { method, body: JSON.stringify(payload) });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || 'Failed to save task');

        closeModal();
        showToast(isEdit ? '✓ Task updated' : '✓ Task created');
        loadTasks();
        loadStats();
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove('hidden');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Save Task';
    }
}

// ============================================================
// DELETE
// ============================================================

function promptDelete(taskId) {
    state.pendingDeleteId = taskId;
    document.getElementById('confirm-overlay').classList.remove('hidden');
}

function closeConfirm() {
    state.pendingDeleteId = null;
    document.getElementById('confirm-overlay').classList.add('hidden');
}

async function confirmDelete() {
    const taskId = state.pendingDeleteId;
    if (!taskId) return;

    const btn = document.getElementById('confirm-delete-btn');
    btn.disabled = true;
    btn.textContent = 'Deleting...';

    try {
        const res = await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');

        closeConfirm();
        showToast('🗑 Task deleted');
        loadTasks();
        loadStats();
    } catch (err) {
        showToast(err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Delete';
    }
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        closeConfirm();
    }
    // Ctrl+N = New task (when on dashboard)
    if (e.ctrlKey && e.key === 'n' && state.token) {
        e.preventDefault();
        openModal();
    }
});

// ============================================================
// BOOTSTRAP
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    if (state.token && state.user) {
        initDashboard();
    } else {
        showScreen('auth-screen');
    }
});
