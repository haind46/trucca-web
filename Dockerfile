# Dockerfile cho Frontend + Nginx reverse proxy
# Build stage: Build React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (không cần proxy vì build local)
RUN npm install --no-audit --no-fund

# Copy source code
COPY . .

# Build frontend only (vite build)
RUN npm run build

# Production stage: Nginx
FROM nginx:alpine

# Copy built frontend static files
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 3000
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
