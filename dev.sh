#!/bin/bash

echo "🚀 Starting Long Hai Ticket in Development Mode..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.dev.yml down

# Build and start all services
echo "🔨 Building and starting services in development mode..."
docker-compose -f docker-compose.dev.yml up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run Laravel migrations
echo "🗄️ Running Laravel migrations..."
docker-compose -f docker-compose.dev.yml exec -T backend php artisan migrate --force

# Generate Laravel key if not exists
echo "🔑 Generating Laravel application key..."
docker-compose -f docker-compose.dev.yml exec -T backend php artisan key:generate --force

echo "✅ Long Hai Ticket Development Environment is ready!"
echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://localhost:8000"
echo "   CMS Admin:   http://localhost:3000"
echo "   User Frontend: http://localhost:3001"
echo ""
echo "📊 Database: localhost:3306"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.dev.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.dev.yml down"
echo ""
echo "🔄 Hot reload is enabled for Next.js applications" 