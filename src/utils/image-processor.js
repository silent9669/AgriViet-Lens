/**
 * Client-side image compression and canvas scaling utility.
 */
export class ImageProcessor {
  /**
   * Compresses and resizes an image to its maximum dimension.
   *
   * @param {File|Blob} file Image file to compress
   * @param {number} maxDimension Maximum width or height in pixels
   * @param {number} quality JPEG compression quality from 0 to 1
   * @returns {Promise<{base64Uri: string, width: number, height: number, originalSize: number}>}
   */
  static async compressImage(file, maxDimension = 1024, quality = 0.82) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      if (typeof FileReader === 'undefined' || typeof Image === 'undefined' || typeof document === 'undefined') {
        reject(new Error('Image compression requires browser APIs'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          let width = img.naturalWidth || img.width;
          let height = img.naturalHeight || img.height;

          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const context = canvas.getContext('2d');
          context.drawImage(img, 0, 0, width, height);

          resolve({
            base64Uri: canvas.toDataURL('image/jpeg', quality),
            width,
            height,
            originalSize: file.size
          });
        };
        img.onerror = () => reject(new Error('Failed to load image into canvas'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Resizes an image to its maximum dimension and encodes it as JPEG.
   *
   * @param {File|string} source File object or base64 data URI
   * @param {number} maxDim Maximum width or height in pixels
   * @param {number} quality JPEG compression quality from 0 to 1
   * @returns {Promise<{base64: string, mimeType: string, width: number, height: number}>}
   */
  static async optimizeImage(source, maxDim = 1600, quality = 0.85) {
    if (typeof window === 'undefined' || typeof Image === 'undefined') {
      return {
        base64: typeof source === 'string' ? source : '',
        mimeType: 'image/jpeg',
        width: 800,
        height: 600
      };
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        context.drawImage(img, 0, 0, width, height);

        const mimeType = 'image/jpeg';
        const base64 = canvas.toDataURL(mimeType, quality);
        resolve({ base64, mimeType, width, height });
      };

      img.onerror = (error) => {
        reject(new Error(`Failed to load image for optimization: ${error}`));
      };

      if (typeof source === 'string') {
        img.src = source;
        return;
      }

      const isFile = typeof File !== 'undefined' && source instanceof File;
      const isBlob = typeof Blob !== 'undefined' && source instanceof Blob;
      if (isFile || isBlob) {
        const reader = new FileReader();
        reader.onload = (event) => {
          img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(source);
        return;
      }

      reject(new Error('Invalid image source type'));
    });
  }
}
