# Stage 1 — Build React app with Vite
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (layer cache)
COPY package.json ./
RUN npm install

# Install zustand (Pomodoro state management)
RUN npm install zustand

# Copy source
COPY . .

# Build
RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:1.25-alpine

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/health || wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
