FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json .
RUN npm install --omit=dev

# Copy source
COPY . .

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
