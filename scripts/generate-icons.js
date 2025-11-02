const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function generateIcon(size, outputPath) {
  // Create SVG with AniSphere branding
  const svg = Buffer.from(`<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2563eb;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.2}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">AS</text>
</svg>`);

  // Convert SVG to PNG using sharp
  await sharp(svg)
    .resize(size, size)
    .png()
    .toFile(outputPath);
  
  console.log(`✓ Created ${path.basename(outputPath)} (${size}x${size})`);
}

async function main() {
  const publicDir = path.join(__dirname, '..', 'public');
  
  console.log('Generating PWA icons...\n');
  
  await generateIcon(192, path.join(publicDir, 'icon-192x192.png'));
  await generateIcon(512, path.join(publicDir, 'icon-512x512.png'));
  
  console.log('\n✓ All icons generated successfully!');
}

main().catch(console.error);

