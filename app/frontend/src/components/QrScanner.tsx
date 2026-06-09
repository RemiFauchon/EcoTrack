import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export default function QrScanner({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [manual, setManual] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;

    const hasBarcodeDetector = 'BarcodeDetector' in window;
    const detector = hasBarcodeDetector
      ? new (window as any).BarcodeDetector({ formats: ['qr_code'] })
      : null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);

        const tick = async () => {
          if (stopped || !videoRef.current) return;
          const video = videoRef.current;

          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            try {
              if (detector) {
                const codes = await detector.detect(video);
                if (codes.length > 0) {
                  onDetected(codes[0].rawValue);
                  return;
                }
              } else if (canvasRef.current) {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (ctx) {
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                  const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                  });
                  if (code) {
                    onDetected(code.data);
                    return;
                  }
                }
              }
            } catch {
              /* frame non analysable */
            }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch (e: any) {
        setError(e?.message ?? 'Caméra indisponible — utilisez la saisie manuelle.');
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
        {error ? (
          <p className="text-sm text-status-warn mb-3">{error}</p>
        ) : (
          <div className="rounded-xl overflow-hidden bg-black aspect-square mb-3 relative">
            <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {!cameraReady && (
              <div className="absolute inset-0 grid place-items-center text-white/70 text-sm">
                Activation de la caméra…
              </div>
            )}
          </div>
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
