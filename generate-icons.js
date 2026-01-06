// Script untuk membuat placeholder icons (simpan sebagai generate-icons.js)
const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(0, 0, size, size);
    
    // Egg shape
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(size/2, size/2, size/3, size/2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Egg details
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/10, 0, Math.PI * 2);
    ctx.fill();
    
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(`icon-${size}.png`, buffer);
    console.log(`✅ Created icon-${size}.png`);
});

console.log('🎉 All icons generated!');