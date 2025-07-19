#!/bin/bash

echo "☁️ Cloudinary Complete Setup"
echo "============================"

# Get Cloud Name from user
echo -n "Nhập Cloudinary Cloud Name: "
read CLOUD_NAME

echo -n "Nhập Cloudinary API Key (optional): "
read API_KEY

echo -n "Nhập Cloudinary API Secret (optional): "
read API_SECRET

if [ -z "$CLOUD_NAME" ]; then
    echo "❌ Cloud Name không được để trống!"
    exit 1
fi

echo ""
echo "📝 Tạo .env files..."

# CMS Frontend
cat > longhai-cms/.env.local << EOF
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$CLOUD_NAME
EOF

# User Frontend  
cat > longhai-user/.env.local << EOF
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$CLOUD_NAME
EOF

# Laravel Backend
if [ ! -f longhai-backend/.env ]; then
    cp longhai-backend/.env.example longhai-backend/.env
fi

# Add Cloudinary config to Laravel .env
if ! grep -q "CLOUDINARY_CLOUD_NAME" longhai-backend/.env; then
    echo "" >> longhai-backend/.env
    echo "# Cloudinary Configuration" >> longhai-backend/.env
    echo "CLOUDINARY_CLOUD_NAME=$CLOUD_NAME" >> longhai-backend/.env
    if [ ! -z "$API_KEY" ]; then
        echo "CLOUDINARY_API_KEY=$API_KEY" >> longhai-backend/.env
    fi
    if [ ! -z "$API_SECRET" ]; then
        echo "CLOUDINARY_API_SECRET=$API_SECRET" >> longhai-backend/.env
    fi
fi

echo "✅ Đã tạo/cập nhật .env files"
echo ""
echo "📋 Configuration:"
echo "   Cloud Name: $CLOUD_NAME"
echo "   API Key: ${API_KEY:-'Not provided'}"
echo "   API Secret: ${API_SECRET:-'Not provided'}"
echo ""
echo "📁 Files updated:"
echo "   - longhai-cms/.env.local"
echo "   - longhai-user/.env.local"
echo "   - longhai-backend/.env"
echo ""
echo "🚀 Next steps:"
echo "1. Create Upload Preset 'longhai_upload' in Cloudinary Dashboard"
echo "2. Restart all servers"
echo "3. Test upload at: http://localhost:3000/cloudinary-test" 
