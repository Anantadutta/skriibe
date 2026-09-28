const sharp = require('sharp');

async function getColor() {
  const image = sharp('C:/Users/dutta/.gemini/antigravity/brain/a7db6c51-5e18-415f-aa1c-a11effb602ef/.user_uploaded/media_1790612406362.png');
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  // Get color of pixel at 10,10
  const width = info.width;
  const channels = info.channels;
  const idx = (10 * width + 10) * channels;
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];
  
  const toHex = (n) => n.toString(16).padStart(2, '0');
  console.log(`#${toHex(r)}${toHex(g)}${toHex(b)}`);
}

getColor().catch(console.error);
