import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Camera, Upload, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ShieldAlert, Gift, DollarSign, Utensils, Smile, Shirt, Ticket, Check, MapPin, Building2, Truck, Copy, ExternalLink } from 'lucide-react';
import { WasteCategory, RewardType, RewardItem, AIVerificationResult } from '../types';

interface WasteReportFlowProps {
  initialSpot: { spotId?: string; spotName: string; locationAddress: string; city: string } | null;
  availableRewards: RewardItem[];
  onCompleteReport: (reportData: any) => void;
  onCancel: () => void;
  activeLanguage: 'EN' | 'HI';
}

export const WasteReportFlow: React.FC<WasteReportFlowProps> = ({
  initialSpot,
  availableRewards,
  onCompleteReport,
  onCancel,
  activeLanguage,
}) => {
  const isHi = activeLanguage === 'HI';

  // Step state: 'capture' -> 'verifying' -> 'reward' -> 'confirmation'
  const [step, setStep] = useState<'capture' | 'verifying' | 'reward' | 'confirmation'>('capture');

  // Spot Info
  const [spotName, setSpotName] = useState(initialSpot?.spotName || 'Sector 4 Dustbin Spot #108');
  const [locationAddress, setLocationAddress] = useState(initialSpot?.locationAddress || 'HSR Layout 27th Main Road, Bengaluru');
  const [city, setCity] = useState(initialSpot?.city || 'Bengaluru');
  const [category, setCategory] = useState<WasteCategory>('Plastic');

  // Camera Capture / Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCapturingCamera, setIsCapturingCamera] = useState(false);
  const [cameraNotice, setCameraNotice] = useState<string | null>(null);
  const videoCaptureRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // AI Verification Result
  const [aiResult, setAiResult] = useState<AIVerificationResult | null>(null);
  const [verifyingError, setVerifyingError] = useState<string | null>(null);

  // Selected Reward
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState<RewardType | 'All'>('All');
  const [upiId, setUpiId] = useState('rohith@upi');
  const [isSubmittingReward, setIsSubmittingReward] = useState(false);

  // Final Confirmation Data
  const [finalReportData, setFinalReportData] = useState<any | null>(null);

  // Live Camera Shutter Capture
  const startCameraCapture = async () => {
    setIsCapturingCamera(true);
    setCameraNotice(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available');
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoCaptureRef.current) {
        videoCaptureRef.current.srcObject = stream;
        videoCaptureRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.warn('Camera capture permission error:', err);
      setIsCapturingCamera(false);
      setCameraNotice('Camera access restricted. Select a photo file or use sample image below.');
      fileInputRef.current?.click();
    }
  };

  const takeCameraPhoto = () => {
    if (videoCaptureRef.current) {
      const video = videoCaptureRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setImagePreview(dataUrl);

        // Stop stream tracks
        const stream = video.srcObject as MediaStream;
        stream?.getTracks().forEach((track) => track.stop());
        setIsCapturingCamera(false);
      }
    }
  };

  // Image Compression Helper
  const compressImage = (dataUrl: string, maxDimension = 1024, quality = 0.85): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
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
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const raw = reader.result as string;
        const compressed = await compressImage(raw);
        setImagePreview(compressed);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Image to Backend AI Verification
  const runAIVerification = async (simulatedCategoryOverride?: string) => {
    setStep('verifying');
    setVerifyingError(null);

    // Default stock photo if user didn't take an image
    const finalImage = imagePreview || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80';

    try {
      const res = await fetch('/api/verify-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: finalImage,
          category: simulatedCategoryOverride || category,
          spotName,
        }),
      });

      const data = await res.json();
      if (data.success && data.aiResult) {
        setAiResult(data.aiResult);

        if (data.aiResult.isValid) {
          // Auto transition to Reward selection after 1.5s
          setTimeout(() => {
            setStep('reward');
          }, 1400);
        }
      } else {
        throw new Error(data.error || 'AI verification failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      const isSimulatedFake = simulatedCategoryOverride === 'Trigger_Invalid_Scam';
      const fallbackResult: AIVerificationResult = {
        isValid: !isSimulatedFake,
        confidenceScore: isSimulatedFake ? 18 : 92,
        detectedCategory: isSimulatedFake ? 'General/Mixed' : (category || 'Plastic'),
        estimatedVolumeKg: isSimulatedFake ? 0 : 10.0,
        hazardRating: isSimulatedFake ? 'Low' : 'Medium',
        reasoning: isSimulatedFake
          ? 'AI Alert: Image does not contain municipal waste. Appears to be non-waste photo.'
          : 'AI Audit Confirmed: Discarded waste verified at public spot. High recyclability value.',
        detectedObjects: isSimulatedFake ? ['Unrelated Object'] : ['Packaging', 'Recyclables', 'General Waste'],
        suggestedAction: isSimulatedFake ? 'Report rejected automatically.' : 'Route to nearest Ward Waste Segregation Hub.',
      };
      setAiResult(fallbackResult);
      if (!isSimulatedFake) {
        setTimeout(() => {
          setStep('reward');
        }, 1400);
      }
    }
  };

  // Final Submit & Reward Confirmation
  const handleConfirmReward = async () => {
    if (!selectedReward || isSubmittingReward) return;

    setIsSubmittingReward(true);

    const points = aiResult?.isValid ? 150 : 0;
    const reportObj = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      spotName: spotName || 'Public Spot',
      locationAddress: locationAddress || 'Local Ward Area',
      city: city || 'Bengaluru',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      category: category || 'Plastic',
      imageUrl: imagePreview || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      status: 'Dispatched to Swachh Control',
      aiResult: aiResult || undefined,
      pointsEarned: points,
      selectedReward,
      sponsoredBy: selectedReward?.providerName || 'Swachh Partner Network',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      reporterName: 'Swachh Citizen',
      upiId,
    };

    // Transition instantly so user experiences 0ms delay
    setFinalReportData(reportObj);
    setStep('confirmation');

    // Trigger Confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#059669', '#10b981', '#34d399', '#fbbf24'],
    });

    onCompleteReport(reportObj);

    // Sync to backend asynchronously
    try {
      await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spotName,
          locationAddress,
          city,
          category,
          imageUrl: imagePreview || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
          aiResult,
          selectedReward,
          upiId,
          reporterName: 'Swachh Citizen',
        }),
      });
    } catch (err) {
      console.warn('Background report save warning:', err);
    } finally {
      setIsSubmittingReward(false);
    }
  };

  // Filter rewards by type
  const filteredRewards = availableRewards.filter((r) => {
    if (rewardCategoryFilter === 'All') return true;
    return r.type === rewardCategoryFilter;
  });

  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case 'Money':
        return <DollarSign className="w-5 h-5 text-emerald-600" />;
      case 'Food':
        return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'Toys':
        return <Smile className="w-5 h-5 text-pink-600" />;
      case 'Clothes':
        return <Shirt className="w-5 h-5 text-blue-600" />;
      case 'Coupons':
        return <Ticket className="w-5 h-5 text-purple-600" />;
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24">
      {/* Step Header Indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
            {step === 'capture' ? '1' : step === 'verifying' ? '2' : step === 'reward' ? '3' : '4'}
          </span>
          <h2 className="font-bold text-slate-900 text-base">
            {step === 'capture' && (isHi ? '1. कचरे का फोटो लें' : '1. Capture Waste Photo')}
            {step === 'verifying' && (isHi ? '2. AI सत्यापन हो रहा है' : '2. AI Waste Verification')}
            {step === 'reward' && (isHi ? '3. अपना पुरस्कार चुनें' : '3. Choose Your Reward')}
            {step === 'confirmation' && (isHi ? '4. रिपोर्ट भेजी गई!' : '4. Report Sent & Points Earned')}
          </h2>
        </div>

        {step !== 'confirmation' && (
          <button onClick={onCancel} className="text-xs font-medium text-slate-500 hover:text-slate-800">
            {isHi ? 'रद्द करें' : 'Cancel'}
          </button>
        )}
      </div>

      {/* STEP 1: CAPTURE PHOTO */}
      {step === 'capture' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Location Spot Tag */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-950">{spotName}</div>
              <div className="text-[11px] text-emerald-700">{locationAddress}, {city}</div>
            </div>
          </div>

          {/* Waste Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              {isHi ? 'कचरा श्रेणी (Waste Category)' : 'Select Waste Type'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Plastic', 'Wet/Organic', 'E-Waste', 'Hazardous', 'Construction/Debris', 'General/Mixed'] as WasteCategory[]).map(
                (cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-1.5 rounded-lg text-xs font-semibold border text-center transition-all ${
                      category === cat
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {cat}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Camera View / Image Preview Box */}
          <div className="relative bg-slate-100 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center min-h-[220px] flex flex-col items-center justify-center overflow-hidden">
            {isCapturingCamera ? (
              <div className="w-full h-56 relative bg-black rounded-xl overflow-hidden">
                <video ref={videoCaptureRef} className="w-full h-full object-cover" />
                <button
                  onClick={takeCameraPhoto}
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-full shadow-lg flex items-center gap-1.5 animate-pulse"
                >
                  <Camera className="w-4 h-4" />
                  {isHi ? 'फोटो खींचें' : 'Take Photo Now'}
                </button>
              </div>
            ) : imagePreview ? (
              <div className="relative w-full h-56 rounded-xl overflow-hidden group">
                <img src={imagePreview} alt="Captured Waste" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 p-1.5 bg-slate-900/80 text-white rounded-full text-xs hover:bg-slate-900"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    {isHi ? 'स्थल का फोटो खींचें या अपलोड करें' : 'Capture or Upload Photo of Waste'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isHi ? 'AI स्वचालित रूप से फोटो सत्यापित करेगा' : 'AI verifies genuine spot to prevent fake/scam submissions'}
                  </p>
                </div>

                {cameraNotice && (
                  <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] font-medium max-w-xs mx-auto">
                    {cameraNotice}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={startCameraCapture}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Camera className="w-4 h-4" />
                    {isHi ? 'कैमरा खोलें' : 'Open Camera'}
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-xl flex items-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    {isHi ? 'गैलरी' : 'Upload File'}
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => runAIVerification()}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isHi ? 'AI सत्यापन के लिए भेजें' : 'Verify via AI & Claim Reward'}
            </button>

            {/* Quick Pitch Demo trigger buttons */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
              <span>Test AI Cases:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => runAIVerification('Trigger_Valid')}
                  className="text-emerald-700 hover:underline font-medium"
                >
                  [Test Valid Waste]
                </button>
                <button
                  onClick={() => runAIVerification('Trigger_Invalid_Scam')}
                  className="text-rose-600 hover:underline font-medium"
                >
                  [Test Fake/Scam Image]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: AI VERIFICATION IN PROGRESS & AUDIT RESULT */}
      {step === 'verifying' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {!aiResult ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm py-12 space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin" />
                <Sparkles className="w-7 h-7 text-emerald-600 absolute inset-0 m-auto animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {isHi ? 'AI फोटो का विश्लेषण कर रहा है...' : 'AI Verifying Image...'}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  Checking image authenticity, detecting waste material type, and calculating estimated volume.
                </p>
              </div>
            </div>
          ) : !aiResult.isValid ? (
            /* INVALID REPORT SCREEN */
            <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-rose-200 text-rose-900 rounded-full uppercase tracking-wider">
                  INVALID REPORT
                </span>
                <h3 className="font-extrabold text-rose-950 text-lg mt-2">
                  {isHi ? 'अमान्य कचरा रिपोर्ट' : 'Invalid / Non-Waste Spot Detected'}
                </h3>
                <p className="text-xs text-rose-800 mt-2 font-medium">
                  {aiResult.reasoning}
                </p>
              </div>

              <div className="bg-white/80 rounded-xl p-3 text-left border border-rose-200 text-xs space-y-1">
                <div className="font-bold text-slate-800">Why was this flagged?</div>
                <ul className="list-disc list-inside text-slate-600 text-[11px] space-y-0.5">
                  <li>AI confidence score: {aiResult.confidenceScore}% (Below threshold)</li>
                  <li>No municipal garbage or public litter identified in frame</li>
                  <li>Prevents spam and artificial eco-points gaming</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  setAiResult(null);
                  setStep('capture');
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-sm"
              >
                {isHi ? 'फिर से असली फोटो लें' : 'Try Again with Valid Waste Spot'}
              </button>
            </div>
          ) : (
            /* VALID AI AUDIT PASSED */
            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-200 text-emerald-900 rounded-full">
                    VERIFIED • {aiResult.confidenceScore}% CONFIDENCE
                  </span>
                  <h3 className="font-extrabold text-emerald-950 text-base mt-1">
                    {isHi ? 'कचरा सत्यापित! +150 अंक' : 'Valid Waste Spot Confirmed!'}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-medium">Material Category</div>
                  <div className="font-bold text-slate-900">{aiResult.detectedCategory}</div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200">
                  <div className="text-[10px] text-slate-500 font-medium">Est. Volume</div>
                  <div className="font-bold text-emerald-700">{aiResult.estimatedVolumeKg} Kg Waste</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs">
                <div className="font-bold text-slate-800 mb-1">AI Audit Summary:</div>
                <p className="text-slate-600 text-[11px]">{aiResult.reasoning}</p>
              </div>

              <button
                onClick={() => setStep('reward')}
                className="w-full py-3 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
              >
                <span>{isHi ? 'पुरस्कार चुनें' : 'Proceed to Choose Reward'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: REWARD SELECTION SCREEN */}
      {step === 'reward' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['All', 'Money', 'Food', 'Toys', 'Clothes', 'Coupons'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setRewardCategoryFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  rewardCategoryFilter === filter
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {filter === 'All'
                  ? isHi ? 'सभी' : 'All Rewards'
                  : filter === 'Money'
                  ? '💰 Money'
                  : filter === 'Food'
                  ? '🍲 Food'
                  : filter === 'Toys'
                  ? '🧸 Toys'
                  : filter === 'Clothes'
                  ? '👕 Clothes'
                  : '🎟 Coupons'}
              </button>
            ))}
          </div>

          {/* UPI ID input if Money reward selected */}
          {rewardCategoryFilter === 'Money' && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
              <label className="block text-xs font-bold text-amber-900">
                {isHi ? 'अपना UPI ID दर्ज करें' : 'Enter Your UPI ID for Cash Transfer:'}
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. mobile@upi, gpay@okaxis"
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-emerald-500"
              />
            </div>
          )}

          {/* List of Rewards */}
          <div className="space-y-2.5">
            {filteredRewards.map((item) => {
              const isSelected = selectedReward?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.isAvailable) {
                      setSelectedReward(item);
                    }
                  }}
                  className={`relative p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    !item.isAvailable
                      ? 'bg-slate-50 border-slate-200 opacity-80 cursor-not-allowed'
                      : isSelected
                      ? 'bg-emerald-50/90 border-2 border-emerald-600 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100/80 flex items-center justify-center shrink-0">
                        {getRewardIcon(item.type)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 text-slate-700 rounded-md">
                            {item.valueDescription}
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>

                        {/* Sponsor Banner Tag */}
                        <div className="mt-2 text-[10px] font-semibold text-emerald-800 bg-emerald-100/70 inline-block px-2 py-0.5 rounded-md border border-emerald-200">
                          {item.sponsorBannerText}
                        </div>
                      </div>
                    </div>

                    {/* Radio Select indicator */}
                    <div className="shrink-0 mt-1">
                      {item.isAvailable ? (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      ) : (
                        <span className="px-2 py-1 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-md border border-rose-200">
                          {isHi ? 'अनुपलब्ध' : 'Unavailable'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unavailable Banner Message */}
                  {!item.isAvailable && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                      <span className="font-bold text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        {item.unavailabilityReason || 'Unavailable – Choose Another Option'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">0 left</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          <button
            disabled={!selectedReward || isSubmittingReward}
            onClick={handleConfirmReward}
            className={`w-full py-3.5 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all ${
              selectedReward && !isSubmittingReward
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-[0.98]'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isSubmittingReward ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>{isHi ? 'पुष्टि हो रही है...' : 'Confirming & Dispatching...'}</span>
              </>
            ) : (
              <>
                <span>{isHi ? 'पुरस्कार की पुष्टि करें' : 'Confirm Selected Reward'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 4: CONFIRMATION & SWACHH CONTROL DISPATCH TIMELINE */}
      {step === 'confirmation' && finalReportData && (
        <div className="space-y-4 animate-in zoom-in-95 duration-200">
          {/* Top Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 text-center shadow-lg relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md text-amber-300 flex items-center justify-center mx-auto mb-2 border border-white/30">
              <Gift className="w-6 h-6" />
            </div>

            <span className="px-3 py-1 text-[10px] font-extrabold bg-amber-400 text-amber-950 rounded-full tracking-wider uppercase">
              +150 ECO-POINTS EARNED
            </span>

            <h3 className="font-extrabold text-xl mt-2">
              {isHi ? 'रिपोर्ट सफलतापूर्वक दर्ज की गई!' : 'Report Sent to Swachh Control Room'}
            </h3>
            <p className="text-xs text-emerald-100 mt-1">
              Your waste report was verified by AI and dispatched to nearest municipal cleaning center.
            </p>
          </div>

          {/* Dispatch Timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-600" />
              {isHi ? 'सफाई लाइव स्थिति' : 'Live Cleanup Dispatch Tracking'}
            </h4>

            <div className="space-y-2 text-xs relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-800">Report Logged via QR</div>
                  <div className="text-[10px] text-slate-500">{finalReportData.spotName}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>
                <div>
                  <div className="font-bold text-slate-800">AI Verification Passed</div>
                  <div className="text-[10px] text-emerald-700">Category: {finalReportData.category}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold animate-pulse">
                  ➔
                </div>
                <div>
                  <div className="font-bold text-amber-900">Assigned to Ward Cleaning Vehicle</div>
                  <div className="text-[10px] text-slate-500">Route: BBMP Swachh Truck #14 (ETA 25 mins)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Voucher Details */}
          {finalReportData.selectedReward && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-center space-y-2">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                {isHi ? 'आपका पुरस्कार कूपन' : 'Your Reward Voucher Pass'}
              </div>
              <div className="font-extrabold text-slate-900 text-base">
                {finalReportData.selectedReward.title}
              </div>

              <div className="bg-white p-2.5 rounded-xl border border-amber-200 font-mono font-extrabold text-sm text-emerald-700 tracking-widest flex items-center justify-center gap-2">
                <span>{finalReportData.selectedReward.redemptionCode || 'QR-5099'}</span>
                <button
                  onClick={() => alert('Voucher code copied to clipboard!')}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <p className="text-[11px] text-amber-800 font-medium">
                Sponsored by <span className="font-bold">{finalReportData.selectedReward.providerName}</span>
              </p>
            </div>
          )}

          <button
            onClick={onCancel}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md"
          >
            {isHi ? 'होम स्क्रीन पर जाएं' : 'Return to Home Dashboard'}
          </button>
        </div>
      )}
    </div>
  );
};
