#!/bin/bash

echo "🚀 Setting up Long Hai Ticket Project..."

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

# Setup Laravel Backend
echo "🔧 Setting up Laravel Backend..."

# Copy .env file if not exists
docker-compose exec -T backend cp .env.example .env

# Generate Laravel key
echo "🔑 Generating Laravel application key..."
docker-compose exec -T backend php artisan key:generate --force

# Clear all caches
echo "🧹 Clearing Laravel caches..."
docker-compose exec -T backend php artisan config:clear
docker-compose exec -T backend php artisan cache:clear
docker-compose exec -T backend php artisan route:clear
docker-compose exec -T backend php artisan view:clear

# Regenerate autoload
echo "🔄 Regenerating autoload..."
docker-compose exec -T backend composer dump-autoload

# Run migrations
echo "🗄️ Running Laravel migrations..."
docker-compose exec -T backend php artisan migrate --force

# Run seeders
echo "🌱 Running Laravel seeders..."
docker-compose exec -T backend php artisan db:seed --force

# Install dependencies for Next.js apps
echo "📦 Installing Next.js dependencies..."
docker-compose exec -T cms npm install
docker-compose exec -T user-frontend npm install

# Create storage link for file uploads
echo "📁 Creating storage link..."
docker-compose exec -T backend php artisan storage:link

# Set proper permissions
echo "🔐 Setting proper permissions..."
docker-compose exec -T backend chmod -R 775 storage bootstrap/cache

# Restart services to apply CORS changes
echo "🔄 Restarting services to apply CORS changes..."
docker-compose restart backend nginx

echo "✅ Long Hai Ticket is ready!"
echo ""
echo "🌐 Access URLs:"
echo "   Backend API: http://localhost:8000"
echo "   CMS Admin:   http://localhost:3000"
echo "   User Frontend: http://localhost:3001"
echo "   Test Auth:   file://$(pwd)/test-auth.html"
echo ""
echo "📊 Database: localhost:3306"
echo "🔴 Redis: localhost:6379"
echo ""
echo "👤 Default Admin Account:"
echo "   Email: admin@longhai.com"
echo "   Password: password"
echo ""
echo "👤 Default User Account:"
echo "   Email: user@longhai.com"
echo "   Password: password"
echo ""
echo "🔧 Debug Steps:"
echo "   1. Open test-auth.html in browser to test API"
echo "   2. Check browser console for auth logs"
echo "   3. Check Laravel logs: docker-compose logs backend"
echo ""
echo "📝 To view logs: docker-compose logs -f"
echo "🛑 To stop: docker-compose down" 