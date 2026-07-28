import React from 'react';
import { Home, QrCode, Trophy, Gift, Leaf, PlusCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'scan' | 'rewards' | 'leaderboard' | 'impact';
  setActiveTab: (tab: 'home' | 'scan' | 'rewards' | 'leaderboard' | 'impact') => void;
  onOpenScan: () => void;
  activeLanguage: 'EN' | 'HI';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenScan,
  activeLanguage,
}) => {
  const isHi = activeLanguage === 'HI';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg">
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around relative">
        {/* Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'home' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isHi ? 'होम' : 'Home'}</span>
        </button>

        {/* Rewards */}
        <button
          onClick={() => setActiveTab('rewards')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'rewards' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Gift className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isHi ? 'पुरस्कार' : 'Rewards'}</span>
        </button>

        {/* Middle Floating QR Camera Scanner FAB */}
        <div className="relative -top-5">
          <button
            onClick={onOpenScan}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex flex-col items-center justify-center shadow-lg shadow-emerald-600/30 ring-4 ring-white active:scale-95 transition-transform"
            title="Scan Spot QR Code with Camera"
          >
            <QrCode className="w-6 h-6 stroke-[2.5]" />
            <span className="text-[9px] font-extrabold tracking-tight mt-0.5">SCAN</span>
          </button>
        </div>

        {/* Leaderboard */}
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'leaderboard' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isHi ? 'रैंकिंग' : 'Leaderboard'}</span>
        </button>

        {/* Impact */}
        <button
          onClick={() => setActiveTab('impact')}
          className={`flex flex-col items-center py-1 px-2 rounded-xl transition-all ${
            activeTab === 'impact' ? 'text-emerald-600 font-bold scale-105' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Leaf className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{isHi ? 'प्रभाव' : 'Impact'}</span>
        </button>
      </div>
    </div>
  );
};
