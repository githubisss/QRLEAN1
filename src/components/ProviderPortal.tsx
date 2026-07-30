import React, { useState } from 'react';
import { Store, Utensils, HeartHandshake, Building2, Plus, ToggleLeft, ToggleRight, Tag, Award, CheckCircle2, Sparkles, Megaphone, UserPlus, Heart, Eye } from 'lucide-react';
import { Provider, RewardItem, ProviderType, RewardType } from '../types';

interface ProviderPortalProps {
  providers: Provider[];
  rewards: RewardItem[];
  onAddReward: (rewardData: any) => void;
  onToggleAvailability: (rewardId: string, isAvailable: boolean) => void;
  onRegisterProvider: (providerData: any) => void;
  activeLanguage: 'EN' | 'TA';
}

export const ProviderPortal: React.FC<ProviderPortalProps> = ({
  providers,
  rewards,
  onAddReward,
  onToggleAvailability,
  onRegisterProvider,
  activeLanguage,
}) => {
  const isTa = activeLanguage === 'TA';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'inventory' | 'ad_exchange' | 'register'>('dashboard');
  const [selectedProviderId, setSelectedProviderId] = useState<string>(providers[0]?.id || '');

  // Form states for adding new reward item
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<RewardType>('Food');
  const [newValueDesc, setNewValueDesc] = useState('1 Free Pack');
  const [newPoints, setNewPoints] = useState(100);
  const [newQty, setNewQty] = useState(10);
  const [newBanner, setNewBanner] = useState('');

  // Form states for provider signup
  const [regName, setRegName] = useState('');
  const [regType, setRegType] = useState<ProviderType>('Shop');
  const [regPhone, setRegPhone] = useState('');
  const [regCity, setRegCity] = useState('Bengaluru');
  const [regLocation, setRegLocation] = useState('');

  const currentProvider = providers.find((p) => p.id === selectedProviderId) || providers[0];
  const providerRewards = rewards.filter((r) => r.providerId === currentProvider?.id || r.providerName === currentProvider?.name);

  const handleCreateRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    onAddReward({
      providerId: currentProvider.id,
      title: newTitle,
      description: newDesc || 'Community eco reward sponsored by local partner.',
      type: newType,
      valueDescription: newValueDesc,
      costInPoints: newPoints,
      quantityRemaining: newQty,
      isAvailable: newQty > 0,
      sponsorBannerText: newBanner || `Sponsored by ${currentProvider.name}`,
    });

    setNewTitle('');
    setNewDesc('');
    alert(isTa ? 'பரிசு வெற்றிகரமாக சேர்க்கப்பட்டது!' : 'New Reward Item Published Successfully!');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName) return;

    onRegisterProvider({
      name: regName,
      type: regType,
      phone: regPhone,
      city: regCity,
      location: regLocation || 'Main Road',
    });

    setRegName('');
    setActiveTab('dashboard');
    alert(isTa ? 'வழங்குநர் பதிவு வெற்றி!' : 'Provider Registered Successfully!');
  };

  return (
    <div className="max-w-md mx-auto p-4 pb-24 space-y-4">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 rounded-2xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-300">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/30 text-emerald-200 rounded-full">
                PARTNER PORTAL
              </span>
              <h2 className="font-extrabold text-lg leading-tight">
                {isTa ? 'கடைக்காரர் & நன்கொடையாளர் தளம்' : 'Provider & Donor Exchange'}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('register')}
            className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{isTa ? '+ சேரவும்' : '+ Register'}</span>
          </button>
        </div>

        {/* Selected Provider Selector Switcher */}
        {providers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-emerald-700/60 flex items-center gap-2 text-xs">
            <span className="text-emerald-200 text-[11px] font-medium shrink-0">Active Partner:</span>
            <select
              value={selectedProviderId}
              onChange={(e) => setSelectedProviderId(e.target.value)}
              className="bg-emerald-900/80 border border-emerald-600 text-white rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none w-full"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabs Switcher */}
      <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 rounded-lg transition-all text-center ${
            activeTab === 'dashboard' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          {isTa ? 'தகவல் பலகை' : 'Dashboard'}
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex-1 py-2 rounded-lg transition-all text-center ${
            activeTab === 'inventory' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          {isTa ? '+ பொருளைச் சேர்' : '+ Add Item'}
        </button>
        <button
          onClick={() => setActiveTab('ad_exchange')}
          className={`flex-1 py-2 rounded-lg transition-all text-center ${
            activeTab === 'ad_exchange' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
          }`}
        >
          {isTa ? 'விளம்பர கடன்' : 'Ad Exchange'}
        </button>
      </div>

      {/* TAB 1: PROVIDER DASHBOARD */}
      {activeTab === 'dashboard' && currentProvider && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Items Offered</div>
              <div className="text-lg font-extrabold text-slate-900">{providerRewards.length}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Promo Credits</div>
              <div className="text-lg font-extrabold text-emerald-600">{currentProvider.adCreditsEarned}</div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Store Rating</div>
              <div className="text-lg font-extrabold text-amber-500 flex items-center justify-center gap-1">
                ★ {currentProvider.rating}
              </div>
            </div>
          </div>

          {/* Special Household Donor Badge */}
          {currentProvider.type === 'Household Donor' && (
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-3.5 flex items-center gap-3">
              <Heart className="w-8 h-8 text-pink-600 shrink-0 fill-pink-500" />
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-pink-200 text-pink-900 rounded-full">
                  HOUSEHOLD ECO-DONOR MODE
                </span>
                <h3 className="font-bold text-slate-900 text-xs mt-1">
                  Donating unused items earns Eco-Points & Leaderboard Badges!
                </h3>
              </div>
            </div>
          )}

          {/* Manage Inventory Status (Available vs Out of Stock) */}
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              {isTa ? 'இருப்பு நிலை' : 'Manage Item Availability'}
            </h3>

            {providerRewards.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center text-xs text-slate-500">
                No active reward items listed yet. Click "+ Add Item" tab to list food, toys, or coupons!
              </div>
            ) : (
              providerRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white border border-slate-200 rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{reward.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Cost: {reward.costInPoints} Pts • Stock: {reward.quantityRemaining}
                    </div>
                  </div>

                  {/* Toggle availability button */}
                  <button
                    onClick={() => onToggleAvailability(reward.id, !reward.isAvailable)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      reward.isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {reward.isAvailable ? (
                      <>
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                        <span>Available</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-4 h-4 text-rose-600" />
                        <span>Out of Stock</span>
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ADD NEW REWARD ITEM */}
      {activeTab === 'inventory' && (
        <form onSubmit={handleCreateRewardSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2">
            {isTa ? 'புதிய பரிசுப் பொருளைச் சேர்' : 'Add Item to Provide (Sponsor Reward)'}
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reward Category</label>
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as RewardType)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
            >
              <option value="Food">🍲 Food (Safe surplus meal/thali/snack)</option>
              <option value="Toys">🧸 Toys (Kids toys/puzzles)</option>
              <option value="Clothes">👕 Clothes (Unused apparel)</option>
              <option value="Coupons">🎟 Coupons (Store discounts/vouchers)</option>
              <option value="Money">💰 Money (Direct cashback voucher)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reward Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Free South Indian Thali Meal"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Describe what citizen gets when redeeming"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Eco-Points Cost</label>
              <input
                type="number"
                value={newPoints}
                onChange={(e) => setNewPoints(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Available Quantity</label>
              <input
                type="number"
                value={newQty}
                onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Sponsor Banner Text</label>
            <input
              type="text"
              placeholder={`Sponsored by ${currentProvider.name}`}
              value={newBanner}
              onChange={(e) => setNewBanner(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{isTa ? 'பரிசை வெளியிடு' : 'Publish Reward Item'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: ADVERTISEMENT EXCHANGE & PROMOTION CREDITS */}
      {activeTab === 'ad_exchange' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-800">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm">
              {isTa ? 'விளம்பரம் மற்றும் பிராண்ட் விளம்பரம்' : 'QRLEAN Sponsor Ad Exchange'}
            </h3>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs space-y-2">
            <div className="font-bold text-emerald-950">How Ad Exchange Works:</div>
            <ul className="list-disc list-inside text-emerald-800 space-y-1 text-[11px]">
              <li>Your shop logo & banner is displayed inside the citizen app when users scan QR codes.</li>
              <li>Every reward provided earns you **+100 Promotion Credits**.</li>
              <li>Citizens visit your local store to redeem vouchers, driving foot traffic!</li>
            </ul>
          </div>

          {/* Ad Preview Card */}
          <div className="border border-slate-300 rounded-xl p-3 bg-slate-50 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Live Citizen App Banner Preview</span>
            <div className="p-3 bg-white rounded-lg border border-emerald-300 shadow-2xs text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Sponsored by {currentProvider.name}</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                "Keep India clean! Get 15% discount or free snacks at our store after reporting waste!"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REGISTER NEW PROVIDER OR HOUSEHOLD DONOR */}
      {activeTab === 'register' && (
        <form onSubmit={handleRegisterSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm border-b pb-2">
            {isTa ? 'புதிய கணக்கை உருவாக்கவும்' : 'Register as Provider or Household Donor'}
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Provider Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['Shop', 'Restaurant', 'Organization', 'Household Donor'] as ProviderType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setRegType(t)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border text-center transition-all ${
                    regType === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Name / Business Name</label>
            <input
              type="text"
              required
              placeholder={regType === 'Household Donor' ? 'e.g. Ramesh Sharma (Donor)' : 'e.g. Sharma General Store'}
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">City & Ward Location</label>
            <input
              type="text"
              placeholder="e.g. Sector 4, HSR Layout, Bengaluru"
              value={regLocation}
              onChange={(e) => setRegLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            {isTa ? 'பதிவு செய்' : 'Complete Registration'}
          </button>
        </form>
      )}
    </div>
  );
};
