import got from 'got';
import * as PImage from 'pureimage';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await PImage.registerFont('Roboto.ttf', 'Roboto').load();

const data = await got.get('https://raw.githubusercontent.com/onderceylan/pwa-asset-generator/master/src/config/apple-fallback-data.json').json();

const res = new Set();

data.forEach(({ portrait, landscape, scaleFactor }) => {
    Object.entries({ portrait, landscape }).forEach(([orientation, { width, height }]) => {
        const deciceWidth = (orientation === 'portrait' ? width : height) / scaleFactor;
        const deciceHeight = (orientation === 'portrait' ? height : width) / scaleFactor;

        generateImage(width, height, scaleFactor, orientation);
        generateImage(width, height, scaleFactor, orientation, true);
        res.add(`<link rel="apple-touch-startup-image" href="./splash-screens/apple-splash-${width}-${height}.png" media="(device-width: ${deciceWidth}px) and (device-height: ${deciceHeight}px) and (-webkit-device-pixel-ratio: ${scaleFactor}) and (orientation: ${orientation})">`)
        res.add(`<link rel="apple-touch-startup-image" href="./splash-screens/apple-splash-dark-${width}-${height}.png" media="(prefers-color-scheme: dark) and (device-width: ${deciceWidth}px) and (device-height: ${deciceHeight}px) and (-webkit-device-pixel-ratio: ${scaleFactor}) and (orientation: ${orientation})">`)
    })
});

console.log([...res].sort().join('\n'));

async function generateImage(width, height, scaleFactor, orientation, isDark) {
    const img = PImage.make(width, height);
    const ctx = img.getContext('2d');
    
    ctx.fillStyle = isDark ? '#0A043C' : '#FFE3D8';
    ctx.fillRect(0, 0, width - 100, 100);
    ctx.fillRect(0, 100, width, height - 100);

    ctx.fillStyle = isDark ? '#FFFFFF' : '#000000';
    ctx.fillRect(0, 0, 100, 100);
    ctx.fillRect(width - 100, height - 100, width, height);

    ctx.font = "48pt Roboto";
    ctx.fillText(`${width} x ${height} x ${scaleFactor}`, 150, 150);
    ctx.fillText(`${orientation} ${isDark ? ' (dark)' : ''}`, 150, 300);

    const file = path.join(__dirname, `docs/splash-screens/apple-splash-${isDark ? 'dark-' : ''}${width}-${height}.png`)
    PImage.encodePNGToStream(img, fs.createWriteStream(file));
}
