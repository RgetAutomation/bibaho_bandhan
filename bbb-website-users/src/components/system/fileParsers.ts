/**
 * Helper utility to detect and extract embedded JPEGs from RAW (DNG, CR2, NEF, etc.) and PSD files.
 */

export function isRawOrPsdFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['dng', 'cr2', 'nef', 'arw', 'pef', 'orf', 'raw', 'psd'].includes(ext || '');
}

export function extractEmbeddedJpeg(buffer: ArrayBuffer): Blob | null {
  const view = new Uint8Array(buffer);
  
  // Find JPEG SOI (Start of Image): FF D8
  let soiIdx = -1;
  for (let i = 0; i < view.length - 1; i++) {
    if (view[i] === 0xFF && view[i + 1] === 0xD8) {
      soiIdx = i;
      break;
    }
  }

  if (soiIdx === -1) return null;

  // Find JPEG EOI (End of Image): FF D9
  // To avoid small thumbnails, we search from the end or look for the largest block
  let eoiIdx = -1;
  for (let i = view.length - 2; i > soiIdx; i--) {
    if (view[i] === 0xFF && view[i + 1] === 0xD9) {
      eoiIdx = i + 2; // Include FF D9
      break;
    }
  }

  if (eoiIdx === -1 || eoiIdx <= soiIdx) return null;

  const jpegSlice = view.subarray(soiIdx, eoiIdx);
  return new Blob([jpegSlice], { type: "image/jpeg" });
}
