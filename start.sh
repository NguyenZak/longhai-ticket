#!/bin/bash

echo "🚀 Starting Long Hai Ticket Project..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Build and start all services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 30

# Run Laravel migrations
echo "🗄️ Running Laravel migrations..."
docker-compose exec -T backend php artisan migrate --force

# Generate Laravel key if not exists
echo "🔑 Generating Laravel application key..."
docker-compose exec -T backend php artisan key:generate --force

# Install dependencies for Next.js apps
echo "📦 Installing Next.js dependencies..."
docker-compose exec -T cms npm install
docker-compose exec -T user-frontend npm install

echo "✅ Long Hai Ticket is ready!"
echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://localhost:8000"
echo "   CMS Admin:   http://localhost:3000"
echo "   User Frontend: http://localhost:3001"
echo ""
echo "📊 Database: localhost:3306"
echo "🔴 Redis: localhost:6379"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down" 