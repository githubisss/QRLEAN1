export type WasteCategory = 'Plastic' | 'Wet/Organic' | 'E-Waste' | 'Hazardous' | 'Construction/Debris' | 'General/Mixed';

export type RewardType = 'Money' | 'Food' | 'Toys' | 'Clothes' | 'Coupons';

export type ProviderType = 'Shop' | 'Restaurant' | 'Organization' | 'Household Donor';

export interface AIVerificationResult {
  isValid: boolean;
  confidenceScore: number; // 0-100
  detectedCategory: WasteCategory;
  estimatedVolumeKg: number;
  hazardRating: 'Low' | 'Medium' | 'High';
  reasoning: string;
  detectedObjects: string[];
  suggestedAction: string;
}

export interface WasteReport {
  id: string;
  qrCodeSpotId?: string;
  spotName: string;
  locationAddress: string;
  city: string;
  coordinates: { lat: number; lng: number };
  category: WasteCategory;
  imageUrl: string;
  status: 'Pending Verification' | 'AI Verified' | 'Dispatched to Swachh Control' | 'Cleanup In Progress' | 'Cleaned & Recycled' | 'Invalid / Scam Report';
  aiResult?: AIVerificationResult;
  pointsEarned: number;
  selectedReward?: RewardItem;
  sponsoredBy?: string;
  createdAt: string;
  reporterName: string;
  upiId?: string;
}

export interface RewardItem {
  id: string;
  providerId: string;
  providerName: string;
  providerType: ProviderType;
  providerLogo?: string;
  title: string;
  description: string;
  type: RewardType;
  valueDescription: string; // e.g. "₹50 UPI Cash", "1 Free Meal Thali", "Brand New Soft Toy"
  costInPoints: number;
  isAvailable: boolean;
  unavailabilityReason?: string;
  quantityRemaining: number;
  sponsorBannerText?: string;
  redemptionCode?: string;
}

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  phone: string;
  location: string;
  city: string;
  rating: number;
  adCreditsEarned: number;
  itemsOffered: RewardItem[];
  verifiedBadge: boolean;
  donorAvatar?: string;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatar: string;
  city: string;
  points: number;
  reportsCount: number;
  badge: string;
  userType: 'citizen' | 'household_donor';
  donationsCount?: number;
}

export interface ImpactStats {
  wasteCollectedKg: number;
  wasteRecycledKg: number;
  ecoBricksProduced: number;
  housingUnitsBuilt: number;
  co2SavedKg: number;
  activeQRSpots: number;
}
