ubuntu@ip-172-31-4-18:~/FinFlow$ ls
README.md  client  docker-compose.yml  package-lock.json  server
ubuntu@ip-172-31-4-18:~/FinFlow$ vim docker-compose.yml
ubuntu@ip-172-31-4-18:~/FinFlow$ cd client
ubuntu@ip-172-31-4-18:~/FinFlow/client$ ls
Dockerfile  SCREENSHOT  index.html  nginx.conf  node_modules  package-lock.json  package.json  src  vite.config.js
ubuntu@ip-172-31-4-18:~/FinFlow/client$ vim Dockerfile







































# ----------------------------
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
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
~                                                                                                                                                 
"Dockerfile" 35L, 595B                                                                                                          20,0-1        All
