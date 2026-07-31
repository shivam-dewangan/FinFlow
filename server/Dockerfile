FROM node:22-alpine

# Create app directory
WORKDIR /app

# Environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copy source code
COPY . .

# Use non-root user
USER node

EXPOSE 5000

CMD ["node", "server.js"]
