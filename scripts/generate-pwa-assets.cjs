const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Ensure public directory exists
const publicDir = path.resolve(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

function makePng(width, height, drawFn) {
  function crc32(buf) {
    let table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      table[i] = c;
    }
    let c = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xFF];
    return (c ^ (-1)) >>> 0;
  }
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'binary');
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const offset = y * (width * 4 + 1);
    raw[offset] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const px = offset + 1 + x * 4;
      raw[px] = r; raw[px + 1] = g; raw[px + 2] = b; raw[px + 3] = a;
    }
  }
  const idat = zlib.deflateSync(raw, { level: 6 });
  const iend = Buffer.alloc(0);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', iend)]);
}

// Draw brand icon: Beautiful Sky Blue background with medical cross + heart/pulse
function drawBrandIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const rNorm = Math.hypot(x - cx, y - cy) / (w / 2);

  // Background color: Gradient from Sky 500 (#0ea5e9) to Indigo/Sky (#0369a1)
  const grad = y / h;
  const bgR = Math.round(14 + (3 - 14) * grad);
  const bgG = Math.round(165 + (105 - 165) * grad);
  const bgB = Math.round(233 + (161 - 233) * grad);

  // For non-maskable icons, draw rounded squircle corner mask
  if (!isMaskable) {
    const cornerRadius = w * 0.22;
    const dx = Math.max(0, Math.abs(x - cx) - (w / 2 - cornerRadius));
    const dy = Math.max(0, Math.abs(y - cy) - (h / 2 - cornerRadius));
    const distCorner = Math.hypot(dx, dy);
    if (distCorner > cornerRadius) {
      return [0, 0, 0, 0]; // Transparent outside squircle
    }
  }

  // Scale of foreground emblem: maskable has safe zone margin (0.65 scale), standard has 0.75 scale
  const scale = isMaskable ? (w * 0.28) : (w * 0.35);

  // 1. Draw central circular glow / white emblem
  // Medical Cross dimensions
  const barThick = scale * 0.44;
  const barLen = scale * 1.25;

  const inVertBar = Math.abs(x - cx) <= barThick / 2 && Math.abs(y - cy) <= barLen / 2;
  const inHorizBar = Math.abs(y - cy) <= barThick / 2 && Math.abs(x - cx) <= barLen / 2;

  // Subtle rounded ends on cross
  const isCross = inVertBar || inHorizBar;

  if (isCross) {
    // Pure clean white with subtle gradient
    return [255, 255, 255, 255];
  }

  // Draw Stethoscope / ECG Pulse line cutting through center
  const pulseY = cy;
  const pulseHeight = scale * 0.15;
  const inCenterRedHeartDot = Math.hypot(x - cx, y - cy) <= scale * 0.18;
  if (inCenterRedHeartDot) {
    return [14, 165, 233, 255]; // Blue center accent dot
  }

  // Base background
  return [bgR, bgG, bgB, 255];
}

console.log('Generating PWA icons and assets for PWABuilder...');

// 1. Generate 192x192
const icon192 = makePng(192, 192, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), icon192);

// 2. Generate 512x512
const icon512 = makePng(512, 512, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), icon512);

// 3. Generate 512x512 Maskable (Android Adaptive Safe Zone)
const iconMaskable = makePng(512, 512, (x, y, w, h) => drawBrandIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), iconMaskable);

// 4. Generate Apple Touch Icon (180x180)
const iconApple = makePng(180, 180, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), iconApple);

// 5. Generate Favicon PNG (64x64)
const favicon = makePng(64, 64, (x, y, w, h) => drawBrandIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);

// 6. Generate SVG Icon for desktop browsers
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0ea5e9"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.18"/>
    </filter>
  </defs>
  <rect width="512" height="512" rx="112" fill="url(#skyGrad)"/>
  <g filter="url(#softShadow)" fill="#ffffff">
    <rect x="216" y="116" width="80" height="280" rx="24"/>
    <rect x="116" y="216" width="280" height="80" rx="24"/>
  </g>
  <circle cx="256" cy="256" r="32" fill="#0ea5e9"/>
  <path d="M220 256h16l10-18 20 36 10-18h16" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

// 7. Generate Mock Screenshots for PWABuilder store readiness
// Mobile Screenshot (540x960)
const screenshotMobile = makePng(540, 960, (x, y, w, h) => {
  // Top header area (first 100px)
  if (y < 90) return [15, 23, 42, 255]; // Slate 900
  // Hero banner (90-280px)
  if (y < 280) return [14, 165, 233, 255]; // Sky 500
  // Background
  const isCard = (x > 30 && x < w - 30) && ((y > 310 && y < 450) || (y > 470 && y < 610) || (y > 630 && y < 770));
  if (isCard) return [255, 255, 255, 255]; // White card
  return [248, 250, 252, 255]; // Slate 50
});
fs.writeFileSync(path.join(publicDir, 'screenshot-mobile.png'), screenshotMobile);

// Desktop Screenshot (1280x720)
const screenshotDesktop = makePng(1280, 720, (x, y, w, h) => {
  if (y < 70) return [15, 23, 42, 255]; // Header
  if (y < 260) return [14, 165, 233, 255]; // Hero banner
  const isCard = (y > 300 && y < 580) && ((x > 80 && x < 400) || (x > 440 && x < 760) || (x > 800 && x < 1120));
  if (isCard) return [255, 255, 255, 255];
  return [248, 250, 252, 255];
});
fs.writeFileSync(path.join(publicDir, 'screenshot-desktop.png'), screenshotDesktop);

console.log('PWA assets generated successfully in /public!');
