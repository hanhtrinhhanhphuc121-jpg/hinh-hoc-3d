import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. High-fidelity SVG Icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="50%" stop-color="#1e1b4b" />
      <stop offset="100%" stop-color="#31104b" />
    </linearGradient>
    <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#6366f1" />
    </linearGradient>
    <linearGradient id="leftFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#3730a3" />
    </linearGradient>
    <linearGradient id="rightFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a855f7" />
      <stop offset="100%" stop-color="#7e22ce" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="16" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded rect -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer circular grid accent -->
  <circle cx="256" cy="256" r="210" fill="none" stroke="#4338ca" stroke-width="2" stroke-opacity="0.3" stroke-dasharray="8 8" />
  <circle cx="256" cy="256" r="170" fill="none" stroke="#6366f1" stroke-width="1.5" stroke-opacity="0.4" />

  <!-- 3D Polyhedron / Isometric Cube in Center -->
  <g filter="url(#glow)">
    <!-- Top Face (Rhombus) -->
    <polygon points="256,120 380,185 256,250 132,185" fill="url(#topFace)" opacity="0.95" stroke="#c7d2fe" stroke-width="3" stroke-linejoin="round" />
    
    <!-- Left Face -->
    <polygon points="132,185 256,250 256,380 132,315" fill="url(#leftFace)" opacity="0.9" stroke="#c7d2fe" stroke-width="3" stroke-linejoin="round" />
    
    <!-- Right Face -->
    <polygon points="256,250 380,185 380,315 256,380" fill="url(#rightFace)" opacity="0.9" stroke="#c7d2fe" stroke-width="3" stroke-linejoin="round" />
  </g>

  <!-- Internal Hidden Dashed Lines (Pedagogical Geometry Highlight) -->
  <line x1="132" y1="185" x2="256" y2="315" stroke="#f43f5e" stroke-width="3" stroke-dasharray="6 6" opacity="0.8" />
  <line x1="380" y1="185" x2="256" y2="315" stroke="#f43f5e" stroke-width="3" stroke-dasharray="6 6" opacity="0.8" />
  <line x1="256" y1="120" x2="256" y2="380" stroke="#fbbf24" stroke-width="3" stroke-dasharray="6 6" opacity="0.8" />

  <!-- Vertex Dots with Glowing Accents -->
  <circle cx="256" cy="120" r="7" fill="#ffffff" stroke="#6366f1" stroke-width="2" />
  <circle cx="380" cy="185" r="7" fill="#ffffff" stroke="#6366f1" stroke-width="2" />
  <circle cx="256" cy="250" r="8" fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
  <circle cx="132" cy="185" r="7" fill="#ffffff" stroke="#6366f1" stroke-width="2" />
  <circle cx="256" cy="380" r="7" fill="#ffffff" stroke="#6366f1" stroke-width="2" />
  <circle cx="132" cy="315" r="7" fill="#ffffff" stroke="#6366f1" stroke-width="2" />
  <circle cx="380" cy="315" r="7" fill="#ffffff" stroke="#6366f1" stroke-width="2" />

  <!-- Modern Math Badge Text "3D" at Bottom -->
  <g transform="translate(256, 435)">
    <rect x="-65" y="-18" width="130" height="36" rx="18" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
    <text x="0" y="7" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#38bdf8" text-anchor="middle" letter-spacing="2">HÌNH HỌC 3D</text>
  </g>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent, 'utf8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent, 'utf8');

// Function to generate raw PNG with proper CRC and chunks
function createPng(width, height, isMaskable = false) {
  // Simple uncompressed or deflate PNG generator
  // RGBA buffer: width * height * 4
  const stride = width * 4;
  const rawData = Buffer.alloc(height * (stride + 1)); // +1 for filter type byte per scanline

  // Draw gradient and shape programmatically
  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.45 : width * 0.4;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (stride + 1);
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: Deep midnight blue #0f172a to purple #2e1065
      const t = y / height;
      let r = Math.round(15 * (1 - t) + 46 * t);
      let g = Math.round(23 * (1 - t) + 16 * t);
      let b = Math.round(42 * (1 - t) + 101 * t);
      let a = 255;

      // Draw central 3D cube illustration
      // Top face
      if (dist < radius) {
        const nx = dx / radius;
        const ny = dy / radius;

        // Isometric projection check
        if (ny < 0 && Math.abs(nx) < 0.7 - Math.abs(ny) * 0.5) {
          // Top face (indigo-400: 129, 140, 248)
          r = 129; g = 140; b = 248;
        } else if (nx < 0 && Math.abs(ny) < 0.6) {
          // Left face (indigo-600: 79, 70, 229)
          r = 79; g = 70; b = 229;
        } else if (nx >= 0 && Math.abs(ny) < 0.6) {
          // Right face (purple-600: 147, 51, 234)
          r = 147; g = 51; b = 234;
        }

        // Highlight center border lines
        if (Math.abs(dx) < 2 || Math.abs(dy) < 2 || Math.abs(Math.abs(dx) - Math.abs(dy)) < 2) {
          r = 224; g = 231; b = 255;
        }
      }

      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  // Deflate
  const compressed = zlib.deflateSync(rawData);

  // Helper to build chunk: length (4B) + type (4B) + data + crc (4B)
  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);

    // Calculate CRC32 of type + data
    const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
    const crc = crc32(crcBuf);
    buf.writeUInt32BE(crc, 8 + len);
    return buf;
  }

  // CRC32 implementation
  function crc32(buf) {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xedb88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    return (crc ^ (-1)) >>> 0;
  }

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk: width (4), height (4), bit depth (1), color type (1 = 6 RGBA), compression (1 = 0), filter (1 = 0), interlace (1 = 0)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per sample
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate PWA icons
console.log('Generating PWA icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

console.log('Icons generated successfully in public/');
