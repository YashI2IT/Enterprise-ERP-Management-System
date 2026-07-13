FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# We'll install dev dependencies just for building
RUN npm install -D typescript @types/node

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Expose port
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]
