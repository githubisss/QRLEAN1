import React, { useState } from 'react';
import { QrCode, X, Printer, Download, Sparkles, MapPin } from 'lucide-react';
import { SAMPLE_QR_SPOTS } from '../data/mockData';

interface QRGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: 'EN' | 'HI';
}

export const QRGeneratorModal: React.FC<QRGeneratorModalProps> = ({
  isOpen,
  onClose,
  activeLanguage,
}) => {
  const [spotId, setSpotId] = useState('QR-BLR-401');
  const [spotName, setSpotName] = useState('Sector 4 Dustbin Spot #108');
  const [locationAddress, setLocationAddress] = useState('HSR Layout 27th Main Road');
  const [city, setCity] = useState('Bengaluru');

  if (!isOpen) return null;

  // Use Google Charts API or quick SVG QR generator for crisp QR image
  const qrDataPayload = JSON.stringify({ spotId, spotName, locationAddress, city });
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    spotId
  )}`;

  const handleSelectPreset = (spot: typeof SAMPLE_QR_SPOTS[0]) => {
    setSpotId(spot.spotId);
    setSpotName(spot.spotName);
    setLocationAddress(spot.locationAddress);
    setCity(spot.city);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full p-5 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                {activeLanguage === 'HI' ? 'क्यूआर कोड जनरेटर' : 'Printable QR Code Generator'}
              </h3>
              <p className="text-[11px] text-slate-500">For municipal spots or pitch demo testing</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Display Card */}
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-4 text-center space-y-3">
          <div className="bg-white p-3 rounded-xl inline-block shadow-md border border-slate-200">
            <img src={qrImageUrl} alt="QR Code" className="w-40 h-40 mx-auto" />
          </div>

          <div>
            <div className="font-extrabold text-emerald-950 text-sm">{spotName}</div>
            <div className="text-[11px] text-emerald-700 font-medium">{locationAddress}, {city}</div>
            <div className="text-[10px] font-mono text-slate-500 font-bold mt-1">ID: {spotId}</div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Quick Location Preset</span>
          <div className="grid grid-cols-2 gap-1.5">
            {SAMPLE_QR_SPOTS.map((s) => (
              <button
                key={s.spotId}
                onClick={() => handleSelectPreset(s)}
                className={`p-1.5 rounded-lg text-left border text-[11px] font-semibold transition-all ${
                  spotId === s.spotId
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="truncate">{s.spotName}</div>
                <div className="text-[9px] opacity-80">{s.city}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Print / Close buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print QR Sticker</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
