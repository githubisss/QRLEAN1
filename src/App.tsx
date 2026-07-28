import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { LiveQRScanner } from './components/LiveQRScanner';
import { WasteReportFlow } from './components/WasteReportFlow';
import { ProviderPortal } from './components/ProviderPortal';
import { LeaderboardView } from './components/LeaderboardView';
import { ImpactView } from './components/ImpactView';
import { QRGeneratorModal } from './components/QRGeneratorModal';
import { INITIAL_IMPACT_STATS, INITIAL_LEADERBOARD, INITIAL_PROVIDERS, INITIAL_REPORTS, INITIAL_REWARDS, SAMPLE_QR_SPOTS } from './data/mockData';
import { WasteReport, RewardItem, Provider, LeaderboardUser, ImpactStats } from './types';

export default function App() {
  const [userRole, setUserRole] = useState<'citizen' | 'provider'>('citizen');
  const [activeTab, setActiveTab] = useState<'home' | 'scan' | 'rewards' | 'leaderboard' | 'impact'>('home');
  const [activeLanguage, setActiveLanguage] = useState<'EN' | 'HI'>('EN');
  const [userPoints, setUserPoints] = useState<number>(280);

  // Data states
  const [reports, setReports] = useState<WasteReport[]>(INITIAL_REPORTS);
  const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
  const [providers, setProviders] = useState<Provider[]>(INITIAL_PROVIDERS);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>(INITIAL_LEADERBOARD);
  const [impactStats, setImpactStats] = useState<ImpactStats>(INITIAL_IMPACT_STATS);

  // Modals & Flow States
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isQRGeneratorOpen, setIsQRGeneratorOpen] = useState(false);
  const [activeReportSpot, setActiveReportSpot] = useState<any | null>(null);
  const [isReportingFlowActive, setIsReportingFlowActive] = useState(false);

  // Fetch initial data from server API
  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.reports) setReports(data.reports);
      })
      .catch(() => {});

    fetch('/api/rewards')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.rewards) setRewards(data.rewards);
          if (data.providers) setProviders(data.providers);
        }
      })
      .catch(() => {});

    fetch('/api/impact')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.stats) setImpactStats(data.stats);
      })
      .catch(() => {});
  }, []);

  // Handlers
  const handleOpenScanner = () => {
    setIsScannerOpen(true);
  };

  const handleQRScanned = (spotData: any) => {
    setIsScannerOpen(false);
    setActiveReportSpot(spotData);
    setIsReportingFlowActive(true);
  };

  const handleReportViaWebsite = () => {
    setActiveReportSpot(SAMPLE_QR_SPOTS[0]);
    setIsReportingFlowActive(true);
  };

  const handleCompleteReport = (newReport: WasteReport) => {
    setReports((prev) => [newReport, ...prev]);
    setUserPoints((prev) => prev + (newReport.pointsEarned || 150));

    // Update impact stats
    setImpactStats((prev) => ({
      ...prev,
      wasteCollectedKg: prev.wasteCollectedKg + 12,
      wasteRecycledKg: prev.wasteRecycledKg + 10,
      ecoBricksProduced: prev.ecoBricksProduced + 36,
      co2SavedKg: prev.co2SavedKg + 15,
    }));
  };

  const handleAddRewardByProvider = async (rewardData: any) => {
    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rewardData),
      });
      const data = await res.json();
      if (data.success && data.reward) {
        setRewards((prev) => [data.reward, ...prev]);
      }
    } catch {
      // Fallback local update
      const fallbackReward: RewardItem = {
        id: `rew-${Date.now()}`,
        providerId: rewardData.providerId,
        providerName: 'Gupta Kirana',
        providerType: 'Shop',
        title: rewardData.title,
        description: rewardData.description,
        type: rewardData.type,
        valueDescription: rewardData.valueDescription,
        costInPoints: rewardData.costInPoints,
        isAvailable: rewardData.isAvailable,
        quantityRemaining: rewardData.quantityRemaining,
        sponsorBannerText: rewardData.sponsorBannerText,
        redemptionCode: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      setRewards((prev) => [fallbackReward, ...prev]);
    }
  };

  const handleToggleRewardAvailability = async (rewardId: string, isAvailable: boolean) => {
    setRewards((prev) =>
      prev.map((r) =>
        r.id === rewardId
          ? {
              ...r,
              isAvailable,
              unavailabilityReason: isAvailable ? undefined : 'Out of Stock – Replenishing Soon',
            }
          : r
      )
    );

    fetch(`/api/rewards/${rewardId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable, unavailabilityReason: 'Out of Stock' }),
    }).catch(() => {});
  };

  const handleRegisterProvider = (providerData: any) => {
    const newProvider: Provider = {
      id: `prov-${Date.now()}`,
      name: providerData.name,
      type: providerData.type,
      phone: providerData.phone,
      location: providerData.location,
      city: providerData.city,
      rating: 5.0,
      adCreditsEarned: 100,
      itemsOffered: [],
      verifiedBadge: true,
    };
    setProviders((prev) => [newProvider, ...prev]);

    if (providerData.type === 'Household Donor') {
      setLeaderboard((prev) => [
        {
          id: `usr-${Date.now()}`,
          rank: prev.length + 1,
          name: providerData.name,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          city: providerData.city,
          points: 300,
          reportsCount: 0,
          donationsCount: 1,
          badge: 'Green Donor 🎁',
          userType: 'household_donor',
        },
        ...prev,
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 selection:bg-emerald-500 selection:text-white antialiased">
      {/* Mobile Canvas Frame Container */}
      <div className="max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl relative border-x border-slate-200">
        {/* Navigation Bar */}
        <Navbar
          userRole={userRole}
          setUserRole={setUserRole}
          userPoints={userPoints}
          activeLanguage={activeLanguage}
          setActiveLanguage={setActiveLanguage}
          onOpenQRGenerator={() => setIsQRGeneratorOpen(true)}
          onNavigateHome={() => {
            setIsReportingFlowActive(false);
            setActiveTab('home');
          }}
        />

        {/* Main Body View Switching */}
        <main>
          {userRole === 'provider' ? (
            /* PROVIDER PORTAL VIEW */
            <ProviderPortal
              providers={providers}
              rewards={rewards}
              onAddReward={handleAddRewardByProvider}
              onToggleAvailability={handleToggleRewardAvailability}
              onRegisterProvider={handleRegisterProvider}
              activeLanguage={activeLanguage}
            />
          ) : isReportingFlowActive ? (
            /* WASTE REPORTING FLOW (WIZARD) */
            <WasteReportFlow
              initialSpot={activeReportSpot}
              availableRewards={rewards}
              onCompleteReport={handleCompleteReport}
              onCancel={() => setIsReportingFlowActive(false)}
              activeLanguage={activeLanguage}
            />
          ) : (
            /* CITIZEN VIEWS */
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  onScanQR={handleOpenScanner}
                  onReportWebsite={handleReportViaWebsite}
                  onOpenLeaderboard={() => setActiveTab('leaderboard')}
                  onOpenRewards={() => setActiveTab('rewards')}
                  onOpenImpact={() => setActiveTab('impact')}
                  recentReports={reports}
                  userPoints={userPoints}
                  activeLanguage={activeLanguage}
                />
              )}

              {activeTab === 'rewards' && (
                <div className="p-4 pb-24 max-w-md mx-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-extrabold text-lg text-slate-900 font-sans">
                        {activeLanguage === 'HI' ? 'उपलब्ध पुरस्कार' : 'Rewards Marketplace'}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {activeLanguage === 'HI' ? 'इको-अंकों से पुरस्कार भुनाएं' : 'Redeem your points for cash, meals, or store coupons'}
                      </p>
                    </div>
                    <button
                      onClick={handleReportViaWebsite}
                      className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                    >
                      + Earn Points
                    </button>
                  </div>

                  <WasteReportFlow
                    initialSpot={SAMPLE_QR_SPOTS[0]}
                    availableRewards={rewards}
                    onCompleteReport={handleCompleteReport}
                    onCancel={() => setActiveTab('home')}
                    activeLanguage={activeLanguage}
                  />
                </div>
              )}

              {activeTab === 'leaderboard' && (
                <LeaderboardView users={leaderboard} activeLanguage={activeLanguage} />
              )}

              {activeTab === 'impact' && (
                <ImpactView stats={impactStats} activeLanguage={activeLanguage} />
              )}
            </>
          )}
        </main>

        {/* Floating Bottom Navigation Bar for Mobile */}
        {userRole === 'citizen' && !isReportingFlowActive && (
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenScan={handleOpenScanner}
            activeLanguage={activeLanguage}
          />
        )}

        {/* Live Camera QR Code Scanner Overlay */}
        <LiveQRScanner
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          onQRScanned={handleQRScanned}
          activeLanguage={activeLanguage}
        />

        {/* QR Code Generator Modal for Pitch/Print */}
        <QRGeneratorModal
          isOpen={isQRGeneratorOpen}
          onClose={() => setIsQRGeneratorOpen(false)}
          activeLanguage={activeLanguage}
        />
      </div>
    </div>
  );
}
