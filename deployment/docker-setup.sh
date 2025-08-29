#!/bin/bash

echo "🚀 Starting Docker-based Shrimp Farm Management System Setup"

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down -v

# Start only MongoDB first
echo "🗄️  Starting MongoDB container..."
docker-compose up -d mongodb

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Check if MongoDB is responding
echo "🔍 Checking MongoDB connection..."
docker exec shrimp_farm_mongodb mongosh --host localhost --port 27017 --authenticationDatabase admin -u admin -p password --eval "db.runCommand('ping')" --quiet

# Run seed script in a temporary container
echo "🌱 Seeding database with initial data..."
docker run --rm \
  --network operation_shrimp_farm_network \
  -v /Users/sasi/operation/server:/app \
  -w /app \
  -e MONGODB_URI="mongodb://admin:password@mongodb:27017/shrimpfarm?authSource=admin" \
  -e JWT_SECRET="your-super-secret-jwt-key-change-this-in-production" \
  node:18-alpine \
  sh -c "npm install && node seed.js"

echo "🚀 Starting all services..."
docker-compose up -d

echo "⏳ Waiting for all services to be ready..."
sleep 15

echo "✅ Setup complete!"
echo ""
echo "📋 Services running:"
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:5001"  
echo "• MongoDB: localhost:27017"
echo ""
echo "🔑 User Credentials:"
echo "• admin / password (admin role)"
echo "• manager / password (manager role)"
echo "• operator / password (operator role)"
echo ""
echo "🎉 Your Shrimp Farm Management System is ready!"