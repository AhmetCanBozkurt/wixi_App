# Use Node.js 20 Alpine as base image
FROM node:20-alpine

# Install dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application (no env vars - runtime detection)
RUN npm run build

# Expose port 6013
EXPOSE 6013

# Start the application
CMD ["npx", "vite", "preview", "--port", "6013", "--host", "0.0.0.0"]

