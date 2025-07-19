#!/bin/bash

echo "🧹 Cleaning up old Laravel storage for Cloudinary migration..."

# Remove old image storage directories
echo "📁 Removing old image storage directories..."
rm -rf longhai-backend/storage/app/public/events
rm -rf longhai-backend/storage/app/public/artists
rm -rf longhai-backend/storage/app/public/maps
rm -rf longhai-backend/storage/app/public/uploads

# Remove storage symlink if exists
echo "🔗 Removing storage symlink..."
rm -f longhai-backend/public/storage

# Clear Laravel cache
echo "🗑️ Clearing Laravel cache..."
cd longhai-backend
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# Recreate necessary storage directories (for logs, cache, etc.)
echo "📂 Recreating necessary storage directories..."
mkdir -p storage/app/public
mkdir -p storage/framework/cache
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs

# Set proper permissions
echo "🔐 Setting proper permissions..."
chmod -R 775 storage
chmod -R 775 bootstrap/cache

echo "✅ Storage cleanup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Configure Cloudinary in .env file"
echo "2. Run: php artisan migrate:fresh --seed"
echo "3. Test image uploads through EventForm"
echo ""
echo "📖 See CLOUDINARY_SETUP.md for detailed configuration guide" 