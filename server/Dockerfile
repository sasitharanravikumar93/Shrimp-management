# Use Node.js 16 as the base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY server/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the server code
COPY server/ .

# Expose port 5001
EXPOSE 5001

# Start the server
CMD ["node", "server.js"]