/*
  Photo handling for the prototype. Uploaded photos are re-encoded through a
  canvas, which downscales them and inherently strips all embedded metadata
  (EXIF, GPS, identity). We never read or surface a photo's embedded location.
  The result is a small data URL that fits in localStorage and previews cleanly.
*/

const MAX_DIM = 420;
const QUALITY = 0.6;

export function isImageSrc(photo?: string): boolean {
  return !!photo && photo.startsWith('data:');
}

export function fileToStrippedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas not available'));
        return;
      }
      // Drawing to a fresh canvas drops all source metadata.
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', QUALITY));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}
