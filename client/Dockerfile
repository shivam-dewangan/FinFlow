
# Stage 1: Build React App
# ----------------------------
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build


# ----------------------------
# Stage 2: Production
# ----------------------------
FROM nginx:1.27-alpine

# Remove default nginx files
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose nginx port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
