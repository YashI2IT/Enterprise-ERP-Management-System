FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Install serve to run the application
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "5173"]
