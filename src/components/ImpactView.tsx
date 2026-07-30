import React, { useState } from 'react';
import { Leaf, Building2, Recycle, Trees, ArrowUpRight, Calculator, Sparkles, CheckCircle2, Factory } from 'lucide-react';
import { ImpactStats } from '../types';

interface ImpactViewProps {
  stats: ImpactStats;
  activeLanguage: 'EN' | 'TA';
}

export const ImpactView: React.FC<ImpactViewProps> = ({ stats, activeLanguage }) => {
  const isTa = activeLanguage === 'TA';

  // Calculator state
  const [inputKg, setInputKg] = useState<number>(10);
  const calculatedBricks = Math.round(inputKg * 3);
  const calculatedCo2 = (inputKg * 1.25).toFixed(1);
  const housingFraction = (calculatedBricks / 1240 * 100).toFixed(2);

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-teal-800 via-emerald-800 to-green-900 text-white p-5 rounded-2xl shadow-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md text-emerald-300 flex items-center justify-center mx-auto mb-2 border border-white/20">
          <Leaf className="w-7 h-7" />
        </div>
        <span className="px-2.5 py-0.5 text-[10px] font-extrabold bg-emerald-400 text-emerald-950 rounded-full uppercase tracking-wider">
          RECYCLING & CIRCULAR IMPACT
        </span>
        <h2 className="font-extrabold text-xl mt-1.5 font-sans">
          {isTa ? 'சுற்றுச்சூழல் மற்றும் மறுசுழற்சி தாக்கம்' : 'Clean India Impact Tracker'}
        </h2>
        <p className="text-xs text-emerald-200 mt-1">
          {isTa ? 'குப்பையிலிருந்து வீடு கட்டும் இந்திய முயற்சி' : 'Turning municipal waste into eco-bricks for affordable Indian housing'}
        </p>
      </div>

      {/* Key Metric Grid Cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Metric 1: Waste Collected */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Recycle className="w-4 h-4" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Waste Collected</div>
          <div className="text-xl font-extrabold text-slate-900">
            {(stats.wasteCollectedKg / 1000).toFixed(1)} <span className="text-xs font-semibold text-slate-500">Tonnes</span>
          </div>
          <p className="text-[10px] text-emerald-700 font-medium">85% segregated & recycled</p>
        </div>

        {/* Metric 2: Eco Bricks Manufactured */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Factory className="w-4 h-4" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Eco-Bricks Produced</div>
          <div className="text-xl font-extrabold text-amber-900">
            {stats.ecoBricksProduced.toLocaleString()}
          </div>
          <p className="text-[10px] text-amber-700 font-medium">From non-biodegradable plastics</p>
        </div>

        {/* Metric 3: Affordable Housing Units */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">Affordable Shelters</div>
          <div className="text-xl font-extrabold text-blue-900">
            {stats.housingUnitsBuilt} <span className="text-xs font-semibold text-slate-500">Homes</span>
          </div>
          <p className="text-[10px] text-blue-700 font-medium">Built using compressed eco-bricks</p>
        </div>

        {/* Metric 4: CO2 Saved */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3.5 space-y-1 shadow-2xs">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Trees className="w-4 h-4" />
          </div>
          <div className="text-[10px] text-slate-500 font-bold uppercase mt-1">CO₂ Emissions Offset</div>
          <div className="text-xl font-extrabold text-teal-900">
            {(stats.co2SavedKg / 1000).toFixed(1)} <span className="text-xs font-semibold text-slate-500">Tonnes</span>
          </div>
          <p className="text-[10px] text-teal-700 font-medium">Equivalent to 2,400 trees planted</p>
        </div>
      </div>

      {/* Interactive Eco-Brick Calculator */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
          <Calculator className="w-5 h-5 text-emerald-600" />
          <h3>{isTa ? 'குப்பை முதல் செங்கல் கணக்கிடுவான்' : 'Personal Waste Impact Calculator'}</h3>
        </div>

        <p className="text-xs text-slate-600">
          Enter the weight of waste plastic you report to see how many eco-bricks you generate:
        </p>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={inputKg}
            onChange={(e) => setInputKg(Math.max(1, Number(e.target.value)))}
            className="w-24 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 text-center"
          />
          <span className="text-xs font-bold text-slate-600">Kg Plastic Reported</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <div className="text-[10px] text-emerald-800 font-medium">Eco-Bricks</div>
            <div className="font-extrabold text-emerald-950 text-base">🧱 {calculatedBricks}</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-800 font-medium">CO₂ Saved</div>
            <div className="font-extrabold text-emerald-950 text-base">🌳 {calculatedCo2} Kg</div>
          </div>
          <div>
            <div className="text-[10px] text-emerald-800 font-medium">Housing %</div>
            <div className="font-extrabold text-emerald-950 text-base">🏠 {housingFraction}%</div>
          </div>
        </div>
      </div>

      {/* QRLEAN Circular Economy Lifecycle Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>The QRLEAN Circular Lifecycle</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              1
            </span>
            <p className="text-slate-300 text-[11px]">
              <strong className="text-white">QR Code Scan:</strong> Citizens spot waste & scan location QR code.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              2
            </span>
            <p className="text-slate-300 text-[11px]">
              <strong className="text-white">AI Waste Audit:</strong> Gemini AI verifies image validity & classifies category.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              3
            </span>
            <p className="text-slate-300 text-[11px]">
              <strong className="text-white">Reward & Dispatch:</strong> Citizen earns cash/food/vouchers; Municipal trucks clean the spot.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
              4
            </span>
            <p className="text-slate-300 text-[11px]">
              <strong className="text-white">Eco-Brick Housing:</strong> Collected plastic waste is compacted into durable bricks for low-cost Indian shelters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
