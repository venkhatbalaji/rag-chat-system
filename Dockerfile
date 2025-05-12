# Dockerfile
FROM node:latest

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build the app
RUN npm run build

# Expose port (adjust if your app uses a different port)
EXPOSE 3000

# Start the app
CMD ["npm", "run", "start:prod"]
