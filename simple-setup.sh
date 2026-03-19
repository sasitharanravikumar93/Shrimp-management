#!/bin/bash

echo "🚀 Starting Simplified Docker Setup (MongoDB only)"

# Stop any existing containers
echo "📦 Stopping existing containers..."
docker-compose down -v

# Create a simple docker-compose for MongoDB only
cat > docker-compose.simple.yml << EOF
version: '3.8'

services:
  mongodb:
    image: mongo:5.0
    container_name: shrimp_farm_mongodb
    restart: always
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    networks:
      - shrimp_farm_network

networks:
  shrimp_farm_network:
    driver: bridge

volumes:
  mongodb_data:
    driver: local
EOF

# Start MongoDB only
echo "🗄️  Starting MongoDB container..."
docker-compose -f docker-compose.simple.yml up -d

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 10

# Check if MongoDB is responding
echo "🔍 Checking MongoDB connection..."
docker exec shrimp_farm_mongodb mongosh --host localhost --port 27017 --authenticationDatabase admin -u admin -p password --eval "db.runCommand('ping')" --quiet

echo "✅ MongoDB is ready!"
echo ""
echo "📋 Next steps:"
echo "1. Run: cd /Users/sasi/operation/server && MONGODB_URI='mongodb://admin:password@localhost:27017/shrimpfarm?authSource=admin' JWT_SECRET='your-super-secret-jwt-key-change-this-in-production' node seed.js"
echo "2. Run: cd /Users/sasi/operation/server && MONGODB_URI='mongodb://admin:password@localhost:27017/shrimpfarm?authSource=admin' JWT_SECRET='your-super-secret-jwt-key-change-this-in-production' node server.js"
echo "3. Run: cd /Users/sasi/operation/client && npm start"
echo ""
echo "🔑 MongoDB Connection:"
echo "• URI: mongodb://admin:password@localhost:27017/shrimpfarm?authSource=admin"
echo "• Username: admin"
echo "• Password: password"