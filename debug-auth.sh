#!/bin/bash

echo "🔧 Debug Authentication Issues"
echo "=============================="

# Check if services are running
echo "1. Checking if services are running..."
docker-compose ps

echo ""
echo "2. Testing API connectivity..."
curl -s http://localhost:8000/api/events/statuses || echo "❌ API not accessible"

echo ""
echo "3. Testing login API..."
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"admin@longhai.com","password":"password"}' \
  -s | jq . || echo "❌ Login API failed"

echo ""
echo "4. Checking Laravel logs..."
docker-compose logs --tail=20 backend

echo ""
echo "5. Checking CORS configuration..."
docker-compose exec -T backend cat config/cors.php

echo ""
echo "6. Checking .env file..."
docker-compose exec -T backend cat .env | grep -E "(APP_KEY|DB_|CORS)" || echo "❌ .env file not found"

echo ""
echo "7. Testing database connection..."
docker-compose exec -T backend php artisan tinker --execute="echo 'Database connected: ' . (DB::connection()->getPdo() ? 'YES' : 'NO');"

echo ""
echo "8. Checking users in database..."
docker-compose exec -T backend php artisan tinker --execute="echo 'Users count: ' . App\Models\User::count();"

echo ""
echo "🔧 Debug completed!"
echo "To test authentication manually:"
echo "1. Open test-auth.html in browser"
echo "2. Try logging in with admin@longhai.com / password"
echo "3. Check browser console for errors" 