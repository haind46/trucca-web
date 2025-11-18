# Dockerfile KHÔNG dùng proxy - dùng để build local
# Multi-stage Dockerfile cho cả frontend và backend
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (không dùng proxy)
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build cả frontend và backend
RUN npm run build:full

# Production stage
FROM node:20-alpine AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Copy built files từ builder stage
COPY --from=builder /app/dist ./dist

# Copy TẤT CẢ node_modules từ builder (bao gồm dev dependencies)
# Cần thiết vì server code import vite (dù chỉ dùng trong dev mode)
COPY --from=builder /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
