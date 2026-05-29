import { useEffect, useRef, useState } from 'react';

/**
 * Scanner de QR code via l'API navigateur BarcodeDetector (sans dépendance).
 * Repli sur saisie manuelle du code si l'API n'est pas supportée (ex. Safari).
 */
export default function QrScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manual, setManual] = useState('');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const hasApi = 'BarcodeDetector' in window;
    setSupported(hasApi);
    if (!hasApi) return;

    const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0) {
              onDetected(codes[0].rawValue);
              return;
            }
          } catch {
            /* frame non analysable */
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setSupported(false);
      }
    })();

    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  return (
    <div className="fixed inset-0 z-[2000] bg-ink/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="card p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg mb-3">Scanner le QR du conteneur</h3>
        {supported ? (
          <div className="rounded-xl overflow-hidden bg-black aspect-square mb-3">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
          </div>
        ) : (
          <p className="text-sm text-ink/50 mb-3">
            Caméra/scan non disponible sur ce navigateur. Saisissez le code du conteneur.
          </p>
        )}
        <div className="flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            placeholder="CT-0001"
            className="input flex-1"
          />
          <button onClick={() => manual && onDetected(manual)} className="btn-primary">
            Valider
          </button>
        </div>
        <button onClick={onClose} className="btn-ghost w-full mt-3">
          Fermer
        </button>
      </div>
    </div>
  );
}
