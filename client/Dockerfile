# Use Node.js 16 as the base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the client code
COPY client/ .

# Build the React app
RUN npm run build

# Install serve to serve the app
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the app
CMD ["serve", "-s", "build", "-l", "3000"]