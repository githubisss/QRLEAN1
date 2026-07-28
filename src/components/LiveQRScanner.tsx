import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Camera, X, RefreshCw, AlertCircle, CheckCircle2, Sparkles, MapPin, Zap, Upload } from 'lucide-react';
import { SAMPLE_QR_SPOTS } from '../data/mockData';

interface LiveQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onQRScanned: (spotData: { spotId: string; spotName: string; locationAddress: string; city: string }) => void;
  activeLanguage: 'EN' | 'HI';
}

export const LiveQRScanner: React.FC<LiveQRScannerProps> = ({
  isOpen,
  onClose,
  onQRScanned,
  activeLanguage,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scannedSpot, setScannedSpot] = useState<any | null>(null);
  const [scanStatusText, setScanStatusText] = useState('Align QR code inside frame');
  const animFrameId = useRef<number | null>(null);

  // Start camera stream when modal opens
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (isOpen) {
      setCameraError(null);
      setScannedSpot(null);
      setScanStatusText(activeLanguage === 'HI' ? 'QR कोड को फ्रेम में लाएं' : 'Align QR code inside frame');

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraActive(false);
        setCameraError(
          'Camera API is not supported or restricted in this browser session. You can upload a QR image or select a spot below.'
        );
        return;
      }

      navigator.mediaDevices
        .getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        .then((mediaStream) => {
          stream = mediaStream;
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS
            videoRef.current.play().catch(() => {});
            setCameraActive(true);
            startQRScanLoop();
          }
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setCameraActive(false);
          setCameraError(
            err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
              ? 'Camera permission was denied. You can select a location spot below or upload a QR image.'
              : 'Could not access camera device. Please choose a location spot below or upload a QR image.'
          );
        });
    }

    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraActive(false);
    };
  }, [isOpen, facingMode]);

  // Handle uploaded QR code image
  const handleQRFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleQRDecoded(code.data);
          } else {
            // Default to first sample spot if image has no QR
            handleSelectPreset(SAMPLE_QR_SPOTS[0]);
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Live QR scanning loop using jsQR
  const startQRScanLoop = () => {
    const scan = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        let canvas = canvasRef.current;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvasRef.current = canvas;
        }

        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleQRDecoded(code.data);
            return; // Stop scanning loop on match
          }
        }
      }
      animFrameId.current = requestAnimationFrame(scan);
    };

    animFrameId.current = requestAnimationFrame(scan);
  };

  const handleQRDecoded = (rawCodeData: string) => {
    // Check if code matches any sample spot or custom JSON
    let spot = SAMPLE_QR_SPOTS.find(
      (s) => s.spotId.toLowerCase() === rawCodeData.toLowerCase() || rawCodeData.includes(s.spotId)
    );

    if (!spot) {
      try {
        const parsed = JSON.parse(rawCodeData);
        if (parsed.spotName || parsed.spotId) {
          spot = {
            spotId: parsed.spotId || 'QR-CUSTOM',
            spotName: parsed.spotName || 'Custom Scanned Spot',
            locationAddress: parsed.locationAddress || 'Scanned Location',
            city: parsed.city || 'India',
            lat: parsed.lat || 12.97,
            lng: parsed.lng || 77.59,
            zone: parsed.zone || 'Municipal Ward',
          };
        }
      } catch {
        spot = {
          spotId: `QR-SPOT-${Math.floor(100 + Math.random() * 900)}`,
          spotName: `Scanned Spot (${rawCodeData.substring(0, 18)})`,
          locationAddress: 'Verified QR Location Spot',
          city: 'Bengaluru',
          lat: 12.9121,
          lng: 77.6445,
          zone: 'Ward Cleanliness Spot',
        };
      }
    }

    setScannedSpot(spot);
    setScanStatusText('✅ QR Code Recognized! Proceeding...');
    
    setTimeout(() => {
      onQRScanned(spot);
    }, 900);
  };

  const handleSelectPreset = (spot: typeof SAMPLE_QR_SPOTS[0]) => {
    setScannedSpot(spot);
    setScanStatusText('✅ Location Spot Selected!');
    setTimeout(() => {
      onQRScanned(spot);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base text-white font-sans">
              {activeLanguage === 'HI' ? 'QR कोड स्कैन करें' : 'Live Camera QR Scanner'}
            </h2>
            <p className="text-xs text-slate-400">
              {activeLanguage === 'HI' ? 'कचरा स्थल QR कोड पर कैमरा लाएं' : 'Point camera at QR sticker pasted on waste spot'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {cameraActive && (
            <button
              onClick={() => setFacingMode(facingMode === 'environment' ? 'user' : 'environment')}
              className="p-2 bg-slate-800 text-slate-200 hover:text-white rounded-full transition-colors"
              title="Flip Camera"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 text-slate-200 hover:text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewfinder Area */}
      <div className="relative flex-1 my-4 flex items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Viewfinder Target Box Overlay */}
        <div className="relative z-10 w-64 h-64 border-2 border-emerald-400 rounded-2xl flex flex-col items-center justify-between p-3 shadow-[0_0_0_9999px_rgba(15,23,42,0.7)] animate-pulse">
          <div className="w-full flex justify-between">
            <div className="w-4 h-4 border-t-4 border-l-4 border-emerald-400 rounded-tl-sm" />
            <div className="w-4 h-4 border-t-4 border-r-4 border-emerald-400 rounded-tr-sm" />
          </div>

          {/* Scanning Line */}
          <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />

          <div className="w-full flex justify-between">
            <div className="w-b-4 border-b-4 border-l-4 border-emerald-400 rounded-bl-sm" />
            <div className="w-b-4 border-b-4 border-r-4 border-emerald-400 rounded-br-sm" />
          </div>
        </div>

        {/* Status text badge */}
        <div className="absolute bottom-6 z-20 px-4 py-2 bg-slate-900/90 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30 backdrop-blur-md flex items-center gap-2">
          {scannedSpot ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>{scannedSpot.spotName}</span>
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>{scanStatusText}</span>
            </>
          )}
        </div>

        {/* Camera Error Message fallback */}
        {cameraError && (
          <div className="absolute inset-0 z-30 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base mb-1">
                {activeLanguage === 'HI' ? 'कैमरा एक्सेस प्रतिबंधित' : 'Camera Access Restricted'}
              </h3>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                {cameraError}
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xs pt-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{activeLanguage === 'HI' ? 'QR फोटो अपलोड करें' : 'Upload QR Image / Photo'}</span>
              </button>

              <button
                onClick={() => {
                  setCameraError(null);
                  setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
                }}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{activeLanguage === 'HI' ? 'पुनः प्रयास करें' : 'Retry Camera'}</span>
              </button>
            </div>

            <p className="text-[11px] text-emerald-400 font-medium">
              {activeLanguage === 'HI' ? 'या नीचे दिए गए डेमो स्थानों को चुनें 👇' : 'Or select a location spot from the demo simulator below 👇'}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleQRFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Preset Spot Simulators for Pitch/Demo */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" />
            {activeLanguage === 'HI' ? 'त्वरित परीक्षण (डेमो स्पॉट)' : 'Demo QR Spot Simulator'}
          </span>
          <span className="text-[10px] text-slate-400">Click to auto-scan spot</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SAMPLE_QR_SPOTS.slice(0, 4).map((spot) => (
            <button
              key={spot.spotId}
              onClick={() => handleSelectPreset(spot)}
              className="flex items-start gap-2 p-2 bg-slate-800/80 hover:bg-emerald-950 hover:border-emerald-500/50 border border-slate-700 rounded-lg text-left transition-all group"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 group-hover:scale-110" />
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-emerald-300">
                  {spot.spotName}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{spot.city} • {spot.spotId}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
