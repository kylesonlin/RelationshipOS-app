import sharp from 'sharp';
import fs from 'fs';

// Read the SVG content
const svgContent = fs.readFileSync('./public/favicon.svg', 'utf8');

// Convert SVG to PNG (32x32)
sharp(Buffer.from(svgContent))
  .png()
  .resize(32, 32)
  .toFile('./public/favicon.png')
  .then(() => {
    console.log('✅ Favicon PNG (32x32) generated successfully!');
  })
  .catch((err) => {
    console.error('❌ Error generating favicon:', err);
  });

// Also create a 192x192 version for better quality
sharp(Buffer.from(svgContent))
  .png()
  .resize(192, 192)
  .toFile('./public/favicon-192.png')
  .then(() => {
    console.log('✅ Favicon PNG (192x192) generated successfully!');
  })
  .catch((err) => {
    console.error('❌ Error generating large favicon:', err);
  });
