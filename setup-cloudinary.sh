#!/bin/bash

echo "☁️ Cloudinary Setup Script"
echo "=========================="
echo ""

# Check if .env file exists
if [ ! -f "longhai-backend/.env" ]; then
    echo "❌ .env file not found in longhai-backend directory"
    echo "Please create .env file first:"
    echo "cp longhai-backend/.env.example longhai-backend/.env"
    exit 1
fi

echo "📋 Current Cloudinary configuration:"
echo "------------------------------------"
grep -i cloudinary longhai-backend/.env || echo "No Cloudinary config found"

echo ""
echo "🔧 To fix upload issues, you need to:"
echo ""
echo "1. 🌐 Create Cloudinary account:"
echo "   - Go to https://cloudinary.com"
echo "   - Sign up for free account"
echo "   - Get your credentials from Dashboard"
echo ""
echo "2. 📝 Add to longhai-backend/.env:"
echo "   CLOUDINARY_CLOUD_NAME=your_cloud_name"
echo "   CLOUDINARY_API_KEY=your_api_key"
echo "   CLOUDINARY_API_SECRET=your_api_secret"
echo "   CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name"
echo ""
echo "3. 🔄 Restart Laravel:"
echo "   cd longhai-backend"
echo "   php artisan config:clear"
echo "   php artisan serve"
echo ""
echo "4. 🧪 Test upload in CMS"
echo ""

# Ask if user wants to add placeholder config
read -p "Do you want to add placeholder Cloudinary config to .env? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "" >> longhai-backend/.env
    echo "# Cloudinary Configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS" >> longhai-backend/.env
    echo "CLOUDINARY_CLOUD_NAME=your_cloud_name" >> longhai-backend/.env
    echo "CLOUDINARY_API_KEY=your_api_key" >> longhai-backend/.env
    echo "CLOUDINARY_API_SECRET=your_api_secret" >> longhai-backend/.env
    echo "CLOUDINARY_URL=cloudinary://your_api_key:your_api_secret@your_cloud_name" >> longhai-backend/.env
    echo ""
    echo "✅ Added placeholder config to .env"
    echo "⚠️ Remember to replace with your actual Cloudinary credentials!"
fi

echo ""
echo "📖 For detailed instructions, see:"
