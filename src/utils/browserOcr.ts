interface DetectedText {
  rawValue?: string;
}

interface TextDetectorConstructor {
  new (): {
    detect: (source: ImageBitmap) => Promise<DetectedText[]>;
  };
}

declare global {
  interface Window {
    TextDetector?: TextDetectorConstructor;
  }
}

export async function extractTextFromImageFile(file: File): Promise<string> {
  if (typeof window === 'undefined' || !window.TextDetector || typeof createImageBitmap === 'undefined') {
    return '';
  }

  try {
    const bitmap = await createImageBitmap(file);
    const detector = new window.TextDetector();
    const results = await detector.detect(bitmap);
    bitmap.close();
    return results.map((item) => item.rawValue).filter(Boolean).join('\n');
  } catch {
    return '';
  }
}
