import React from 'react';
import { QrCode, Globe, Trophy, Gift, Leaf, Flame, Sparkles, MapPin, CheckCircle2, ChevronRight, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';
import { WasteReport, RewardItem } from '../types';

interface HomeScreenProps {
  onScanQR: () => void;
  onReportWebsite: () => void;
  onOpenLeaderboard: () => void;
  onOpenRewards: () => void;
  onOpenImpact: () => void;
  recentReports: WasteReport[];
  userPoints: number;
  activeLanguage: 'EN' | 'HI';
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onScanQR,
  onReportWebsite,
  onOpenLeaderboard,
  onOpenRewards,
  onOpenImpact,
  recentReports,
  userPoints,
  activeLanguage,
}) => {
  const isHi = activeLanguage === 'HI';

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4">
      {/* Hero Card Banner */}
      <div className="relative bg-gradient-to-br from-emerald-800 via-teal-800 to-emerald-900 text-white rounded-3xl p-5 shadow-lg overflow-hidden border border-emerald-700/50">
        {/* Background Decorative Pattern */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute top-0 right-0 p-3 opacity-20">
          <QrCode className="w-28 h-28 text-white" />
        </div>

        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-400 text-emerald-950 rounded-full tracking-wider uppercase">
              AI SWACHH BHARAT PLATFORM
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300">
              <Flame className="w-3.5 h-3.5 fill-amber-300" />
              <span>{userPoints} Pts</span>
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-white leading-tight font-sans">
              {isHi ? 'कचरा रिपोर्ट करें, ' : 'Clean Your Neighborhood. '}
              <br />
              <span className="text-amber-300">
                {isHi ? 'पाएं नगद और कूपन!' : 'Earn Money & Rewards!'}
              </span>
            </h1>
            <p className="text-xs text-emerald-100 mt-1 max-w-xs font-medium">
              {isHi
                ? 'QR स्कैन करें -> AI सत्यापन -> निकटतम सफाई केंद्र को सूचना -> पाएँ मुफ्त भोजन या UPI कैश!'
                : 'Scan spot QR stickers, get instant AI waste verification, and redeem food, UPI cash, or grocery coupons.'}
            </p>
          </div>

          {/* Primary Call to Action Button */}
          <button
            onClick={onScanQR}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
          >
            <QrCode className="w-5 h-5 stroke-[2.5]" />
            <span>{isHi ? 'कैमरे से QR कोड स्कैन करें' : 'Scan Spot QR Code Now'}</span>
          </button>
        </div>
      </div>

      {/* 5 MAIN NAVIGATION BUTTONS REQUIRED BY SPEC */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
          {isHi ? 'मुख्य सेवाएं' : 'Quick Actions & Flow'}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Button 1: Scan QR Code */}
          <button
            onClick={onScanQR}
            className="p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-sm">{isHi ? '1. Scan QR Code' : '1. Scan QR Code'}</div>
              <div className="text-[10px] text-emerald-100">{isHi ? 'कैमरा खोलें' : 'Open camera scanner'}</div>
            </div>
          </button>

          {/* Button 2: Report via Website */}
          <button
            onClick={onReportWebsite}
            className="p-3.5 bg-white border border-slate-200 hover:border-emerald-400 text-slate-800 rounded-2xl flex flex-col items-start justify-between min-h-[90px] shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5" />
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-sm">{isHi ? '2. Report via Web' : '2. Report via Web'}</div>
              <div className="text-[10px] text-slate-500">{isHi ? 'बिना QR के रिपोर्ट' : 'Manual photo report'}</div>
            </div>
          </button>

          {/* Button 3: Leaderboard */}
          <button
            onClick={onOpenLeaderboard}
            className="p-3.5 bg-white border border-slate-200 hover:border-emerald-400 text-slate-800 rounded-2xl flex flex-col items-start justify-between min-h-[90px] shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Trophy className="w-5 h-5" />
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-sm">{isHi ? '3. Leaderboard' : '3. Leaderboard'}</div>
              <div className="text-[10px] text-slate-500">{isHi ? 'रैंकिंग देखें' : 'Rankings & Badges'}</div>
            </div>
          </button>

          {/* Button 4: My Rewards */}
          <button
            onClick={onOpenRewards}
            className="p-3.5 bg-white border border-slate-200 hover:border-emerald-400 text-slate-800 rounded-2xl flex flex-col items-start justify-between min-h-[90px] shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-left mt-2">
              <div className="font-extrabold text-sm">{isHi ? '4. My Rewards' : '4. My Rewards'}</div>
              <div className="text-[10px] text-slate-500">{isHi ? 'नगद, भोजन, कूपन' : 'UPI, Food, Vouchers'}</div>
            </div>
          </button>
        </div>

        {/* Button 5: Impact Screen Banner */}
        <button
          onClick={onOpenImpact}
          className="w-full p-3.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 hover:border-teal-400 text-teal-950 rounded-2xl flex items-center justify-between shadow-xs transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-extrabold text-xs text-teal-950">5. Recycling & Housing Impact Module</div>
              <div className="text-[11px] text-teal-700">See Eco-Bricks produced & homes built from waste</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-teal-600" />
        </button>
      </div>

      {/* Circular Housing Feature Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
        <Building2 className="w-8 h-8 text-amber-700 shrink-0" />
        <div className="text-xs">
          <span className="font-bold text-amber-950">Waste to Eco-Brick Shelters</span>
          <p className="text-amber-800 text-[11px] mt-0.5">
            Reported plastics are crushed & molded into durable Eco-Bricks to construct affordable housing shelters in Indian towns.
          </p>
        </div>
      </div>

      {/* Recent Community Reports Feed */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="text-xs font-bold text-slate-800">
            {isHi ? 'हाल ही की नागरिक रिपोर्ट' : 'Recent Neighborhood Reports'}
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold">Swachh Control Live</span>
        </div>

        <div className="space-y-2">
          {recentReports.slice(0, 3).map((rep) => (
            <div
              key={rep.id}
              className="bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={rep.imageUrl}
                  alt={rep.spotName}
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                />
                <div className="overflow-hidden">
                  <div className="font-bold text-xs text-slate-900 truncate">{rep.spotName}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{rep.locationAddress}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-700 mt-0.5">
                    Category: {rep.category} • +{rep.pointsEarned} Pts
                  </div>
                </div>
              </div>

              <span
                className={`px-2 py-1 text-[9px] font-bold rounded-lg shrink-0 whitespace-nowrap ${
                  rep.status === 'Cleaned & Recycled'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {rep.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
