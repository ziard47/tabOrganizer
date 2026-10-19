/**
 * Extracts dominant color from a favicon URL and maps to Chrome Tab Group native colors.
 */

const chromeColors = {
  grey: [100, 116, 139],
  blue: [59, 130, 246],
  red: [239, 68, 68],
  yellow: [234, 179, 8],
  green: [16, 185, 129],
  pink: [236, 72, 153],
  purple: [139, 92, 246],
  cyan: [6, 182, 212],
  orange: [249, 115, 22]
};

export function getClosestChromeColor(r, g, b) {
  let minDistance = Infinity;
  let closestColor = 'grey';

  for (const [colorName, rgb] of Object.entries(chromeColors)) {
    const distance = Math.sqrt(
      Math.pow(r - rgb[0], 2) +
      Math.pow(g - rgb[1], 2) +
      Math.pow(b - rgb[2], 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestColor = colorName;
    }
  }

  return closestColor;
}

export function extractDominantColor(favIconUrl) {
  return new Promise(async (resolve) => {
    if (!favIconUrl || favIconUrl.startsWith('chrome://')) {
      resolve('grey');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);

      const response = await fetch(favIconUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        resolve('grey');
        return;
      }

      const blob = await response.blob();
      const objectURL = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 16;
          canvas.height = 16;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, 16, 16);

          const imgData = ctx.getImageData(0, 0, 16, 16).data;
          URL.revokeObjectURL(objectURL);

          let totalR = 0, totalG = 0, totalB = 0, count = 0;

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i];
            const g = imgData[i + 1];
            const b = imgData[i + 2];
            const a = imgData[i + 3];

            if (a < 150) continue;

            const brightness = (r + g + b) / 3;
            if (brightness > 230 || brightness < 25) continue;

            totalR += r;
            totalG += g;
            totalB += b;
            count++;
          }

          if (count > 0) {
            const avgR = Math.round(totalR / count);
            const avgG = Math.round(totalG / count);
            const avgB = Math.round(totalB / count);
            resolve(getClosestChromeColor(avgR, avgG, avgB));
          } else {
            resolve('grey');
          }
        } catch {
          URL.revokeObjectURL(objectURL);
          resolve('grey');
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectURL);
        resolve('grey');
      };

      img.src = objectURL;
    } catch {
      resolve('grey');
    }
  });
}
