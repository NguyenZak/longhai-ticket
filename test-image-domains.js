#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Testing Next.js Image Domains Configuration...\n');

// Test user frontend config
const userConfigPath = path.join(__dirname, 'longhai-user/next.config.js');
const cmsConfigPath = path.join(__dirname, 'longhai-cms/next.config.js');

console.log('📁 User Frontend Config:');
if (fs.existsSync(userConfigPath)) {
    const userConfig = fs.readFileSync(userConfigPath, 'utf8');
    console.log('✅ Config file exists');
    
    const requiredDomains = ['via.placeholder.com', 'res.cloudinary.com'];
    requiredDomains.forEach(domain => {
        if (userConfig.includes(domain)) {
            console.log(`✅ ${domain} configured`);
        } else {
            console.log(`❌ ${domain} missing`);
        }
    });
} else {
    console.log('❌ Config file not found');
}

console.log('\n📁 CMS Config:');
if (fs.existsSync(cmsConfigPath)) {
    const cmsConfig = fs.readFileSync(cmsConfigPath, 'utf8');
    console.log('✅ Config file exists');
    
    const requiredDomains = ['via.placeholder.com', 'res.cloudinary.com'];
    requiredDomains.forEach(domain => {
        if (cmsConfig.includes(domain)) {
            console.log(`✅ ${domain} configured`);
        } else {
            console.log(`❌ ${domain} missing`);
        }
    });
} else {
    console.log('❌ Config file not found');
}

console.log('\n📋 Next Steps:');
console.log('1. Restart Next.js servers to apply config changes');
console.log('2. Test image loading in both user frontend and CMS');
console.log('3. Upload images should now display placeholder images');
console.log('4. Configure Cloudinary for real image uploads');

console.log('\n🚀 To restart servers:');
console.log('cd longhai-user && npm run dev');
console.log('cd longhai-cms && npm run dev'); 