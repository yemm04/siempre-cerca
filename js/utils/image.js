/**
 * image.js - Procesamiento y optimización de imágenes en el cliente
 * Redimensiona a través de <canvas> a JPEG 0.6 (máx 800px y miniatura 200px).
 */

/**
 * Lee un archivo de imagen o URL de datos y lo redimensiona con <canvas>
 */
export async function resizeImage(source, maxDimension = 800, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          maxDimension = height;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };

    img.onerror = (err) => reject(new Error('No se pudo procesar la imagen'));

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo de imagen'));
      reader.readAsDataURL(source);
    } else if (typeof source === 'string') {
      img.src = source;
    } else {
      reject(new Error('Fuente de imagen inválida'));
    }
  });
}

/**
 * Genera una miniatura cuadrada centrada de 200px
 */
export async function createThumbnail(source, size = 200, quality = 0.6) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const minDim = Math.min(img.width, img.height);
      const startX = (img.width - minDim) / 2;
      const startY = (img.height - minDim) / 2;

      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

      const thumbUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(thumbUrl);
    };

    img.onerror = () => reject(new Error('No se pudo generar la miniatura'));

    if (source instanceof File || source instanceof Blob) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
}
