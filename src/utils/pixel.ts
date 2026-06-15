export const applyCRTScanlines = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  intensity: number = 0.3
): void => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x++) {
      const index = (y * width + x) * 4;
      data[index] = Math.floor(data[index] * (1 - intensity));
      data[index + 1] = Math.floor(data[index + 1] * (1 - intensity));
      data[index + 2] = Math.floor(data[index + 2] * (1 - intensity));
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export const applyPixelation = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pixelSize: number = 4
): void => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4;
          r += data[index];
          g += data[index + 1];
          b += data[index + 2];
          count++;
        }
      }
      
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
          const index = ((y + dy) * width + (x + dx)) * 4;
          data[index] = r;
          data[index + 1] = g;
          data[index + 2] = b;
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const limitPalette = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  palette: string[]
): void => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const rgbPalette = palette.map(hex => {
    const rgb = hexToRgb(hex);
    return rgb || { r: 0, g: 0, b: 0 };
  });
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    let minDistance = Infinity;
    let closestColor = rgbPalette[0];
    
    for (const color of rgbPalette) {
      const distance = Math.sqrt(
        Math.pow(r - color.r, 2) +
        Math.pow(g - color.g, 2) +
        Math.pow(b - color.b, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color;
      }
    }
    
    data[i] = closestColor.r;
    data[i + 1] = closestColor.g;
    data[i + 2] = closestColor.b;
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export const adjustBrightness = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  factor: number
): void => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, Math.floor(data[i] * factor)));
    data[i + 1] = Math.min(255, Math.max(0, Math.floor(data[i + 1] * factor)));
    data[i + 2] = Math.min(255, Math.max(0, Math.floor(data[i + 2] * factor)));
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export const adjustContrast = (
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  factor: number
): void => {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  const intercept = 128 * (1 - factor);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, Math.max(0, Math.floor(data[i] * factor + intercept)));
    data[i + 1] = Math.min(255, Math.max(0, Math.floor(data[i + 1] * factor + intercept)));
    data[i + 2] = Math.min(255, Math.max(0, Math.floor(data[i + 2] * factor + intercept)));
  }
  
  ctx.putImageData(imageData, 0, 0);
};

export const createPixelArtCanvas = (
  width: number,
  height: number,
  scale: number = 1
): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = `${width * scale}px`;
  canvas.style.height = `${height * scale}px`;
  canvas.style.imageRendering = 'pixelated';
  canvas.style.imageRendering = 'crisp-edges';
  
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = false;
  }
  
  return canvas;
};

export const PIXEL_PALETTES = {
  NES: [
    '#000000', '#fcfcfc', '#f8f8f8', '#bcbcbc',
    '#7c7c7c', '#a4e4fc', '#3cbcfc', '#0078f8',
    '#0000fc', '#b8b8f8', '#6888fc', '#0058f8',
    '#0000bc', '#d8b8f8', '#9878f8', '#6844fc',
    '#4428bc', '#f8b8f8', '#f878f8', '#d800cc',
    '#940084', '#f8a4c0', '#f85898', '#e40058',
    '#a80020', '#f0d0b0', '#f87858', '#f83800',
    '#a81000', '#fce0a8', '#fca044', '#e45c10',
    '#881400', '#f8d878', '#f8b800', '#ac7c00',
    '#503000', '#d8f878', '#b8f818', '#00b800',
    '#007800', '#b8f8b8', '#58d854', '#00a800',
    '#006800', '#b8f8d8', '#58f898', '#00a844',
    '#005800', '#00fcfc', '#00e8d8', '#008888',
    '#004058', '#f8d8f8', '#787878'
  ],
  GAMEBOY: [
    '#0f380f', '#306230', '#8bac0f', '#9bbc0f'
  ],
  MONOCHROME: [
    '#000000', '#555555', '#aaaaaa', '#ffffff'
  ]
} as const;
