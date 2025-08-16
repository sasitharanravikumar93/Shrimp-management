#!/bin/bash

# Shrimp Farm Management System Deployment Script

set -e  # Exit immediately if a command exits with a non-zero status

echo "🚀 Starting Shrimp Farm Management System Deployment"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

echo "📦 Installing dependencies..."
npm run install:all

echo "🧹 Cleaning previous builds..."
npm run clean

echo "🏗️ Building client application..."
cd client
npm run build
cd ..

echo "🐳 Starting Docker containers..."
docker-compose down
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Deployment completed successfully!"

echo "🌐 Application URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:5001/api"
echo "   MongoDB: mongodb://localhost:27017"

echo "📝 Next steps:"
echo "   1. Visit http://localhost:3000 to access the application"
echo "   2. Check logs with: docker-compose logs -f"
echo "   3. Stop services with: docker-compose down"