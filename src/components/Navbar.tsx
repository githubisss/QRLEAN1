import React from 'react';
import { QrCode, Sparkles, Award, Store, UserCheck, Languages, Flame, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  userRole: 'citizen' | 'provider';
  setUserRole: (role: 'citizen' | 'provider') => void;
  userPoints: number;
  activeLanguage: 'EN' | 'TA';
  setActiveLanguage: (lang: 'EN' | 'TA') => void;
  onOpenQRGenerator: () => void;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  setUserRole,
  userPoints,
  activeLanguage,
  setActiveLanguage,
  onOpenQRGenerator,
  onNavigateHome,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={onNavigateHome}
          className="flex items-center gap-2 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <QrCode className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                QR<span className="text-emerald-600">LEAN</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                INDIA
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              {activeLanguage === 'TA' ? 'தூய்மை பாரதம் AI வெகுமதிகள்' : 'Scan • AI Verify • Earn Rewards'}
            </p>
          </div>
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Eco-Points Badge */}
          {userRole === 'citizen' && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full shadow-2xs">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-900">{userPoints}</span>
              <span className="text-[10px] text-amber-700 font-medium hidden sm:inline">Pts</span>
            </div>
          )}

          {/* Role Switcher */}
          <button
            onClick={() => setUserRole(userRole === 'citizen' ? 'provider' : 'citizen')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              userRole === 'provider'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
            }`}
            title="Switch between Citizen and Provider Mode"
          >
            {userRole === 'provider' ? (
              <>
                <Store className="w-3.5 h-3.5" />
                <span>Provider</span>
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xs:inline">Citizen</span>
              </>
            )}
          </button>

          {/* QR Generator Tool button */}
          <button
            onClick={onOpenQRGenerator}
            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
            title="Generate & Print Custom Spot QR Code"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setActiveLanguage(activeLanguage === 'EN' ? 'TA' : 'EN')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200 rounded-md transition-colors"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-600" />
            <span>{activeLanguage}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
