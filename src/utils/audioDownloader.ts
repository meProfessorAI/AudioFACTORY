/**
 * AudioFACTORY Universal Audio File Downloader & Exporter
 * 
 * Seamlessly handles audio exports across:
 * 1. Mobile Android / iOS WebViews and browsers via Web Share API (File System access with 0 permission hurdles)
 * 2. Android Capacitor / TWA wrappers with Blob and Data URI fallbacks
 * 3. Desktop Chrome, Safari, Firefox, Edge via standard ObjectURL anchor downloads
 */

export interface DownloadAudioResult {
  success: boolean;
  method: 'bridge' | 'share' | 'anchor' | 'data-uri' | 'cancelled';
  error?: string;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => reject(new Error('Failed to convert blob to base64'));
    reader.readAsDataURL(blob);
  });
}

export async function downloadAudioBlob(
  blob: Blob, 
  filename: string, 
  title: string = 'AudioFACTORY Production Audio'
): Promise<DownloadAudioResult> {
  // 1. Check for Native Android Bridge (Zero storage permission issues via MediaStore Scoped Storage)
  const win = typeof window !== 'undefined' ? (window as any) : null;
  const bridge = win?.AudioFactoryBridge || win?.AndroidBridge;
  
  if (bridge && typeof bridge.saveAudio === 'function') {
    try {
      const base64Data = await blobToBase64(blob);
      const ok = bridge.saveAudio(base64Data, filename, blob.type || 'audio/wav');
      if (ok) {
        return { success: true, method: 'bridge' };
      }
    } catch (bridgeErr) {
      console.warn('[AudioDownloader] Native bridge save failed, proceeding to Web Share:', bridgeErr);
    }
  }

  const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // 1. On mobile devices, check if navigator.canShare supports files.
  // Using navigator.share({ files }) invokes the native Android/iOS system share sheet,
  // allowing immediate 1-tap "Save to device" / "Downloads" / "Drive" without requiring
  // dangerous WRITE_EXTERNAL_STORAGE runtime permissions!
  if (isMobile && typeof navigator !== 'undefined' && navigator.canShare) {
    try {
      const file = new File([blob], filename, { 
        type: blob.type || 'audio/wav',
        lastModified: Date.now()
      });

      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: `Audio track generated in AudioFACTORY: ${filename}`
        });
        return { success: true, method: 'share' };
      }
    } catch (shareErr: any) {
      // If user simply closed/cancelled the share sheet, return clean status
      if (shareErr.name === 'AbortError') {
        return { success: true, method: 'cancelled' };
      }
      console.warn('[AudioDownloader] Web Share API failed, falling back to direct download:', shareErr);
    }
  }

  // 2. Standard Blob ObjectURL anchor trigger
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      try {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      } catch (cleanupErr) {
        // Ignored
      }
    }, 2000);

    return { success: true, method: 'anchor' };
  } catch (objectUrlErr: any) {
    console.warn('[AudioDownloader] ObjectURL download failed, falling back to Data URI:', objectUrlErr);

    // 3. Last-resort fallback for restricted webviews: Base64 Data URI
    return new Promise((resolve) => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          try {
            const dataUrl = reader.result as string;
            const fallbackAnchor = document.createElement('a');
            fallbackAnchor.style.display = 'none';
            fallbackAnchor.href = dataUrl;
            fallbackAnchor.download = filename;
            document.body.appendChild(fallbackAnchor);
            fallbackAnchor.click();

            setTimeout(() => {
              try {
                document.body.removeChild(fallbackAnchor);
              } catch (e) {
                // Ignored
              }
            }, 2000);

            resolve({ success: true, method: 'data-uri' });
          } catch (dataUrlClickErr: any) {
            resolve({ success: false, method: 'data-uri', error: dataUrlClickErr.message });
          }
        };
        reader.onerror = () => {
          resolve({ success: false, method: 'data-uri', error: 'Failed to read audio blob' });
        };
        reader.readAsDataURL(blob);
      } catch (readerErr: any) {
        resolve({ success: false, method: 'data-uri', error: readerErr.message });
      }
    });
  }
}
