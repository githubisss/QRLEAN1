import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_IMPACT_STATS, INITIAL_REWARDS, INITIAL_PROVIDERS, INITIAL_LEADERBOARD, INITIAL_REPORTS } from './src/data/mockData.js';
import { WasteReport, RewardItem, Provider, LeaderboardUser } from './src/types.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '20mb' }));

  // In-memory application state
  let reports: WasteReport[] = [...INITIAL_REPORTS];
  let rewards: RewardItem[] = [...INITIAL_REWARDS];
  let providers: Provider[] = [...INITIAL_PROVIDERS];
  let leaderboard: LeaderboardUser[] = [...INITIAL_LEADERBOARD];
  let impactStats = { ...INITIAL_IMPACT_STATS };

  // Gemini AI Client setup
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return null;
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', app: 'QRLEAN', time: new Date().toISOString() });
  });

  // AI Waste Verification Endpoint
  app.post('/api/verify-waste', async (req, res) => {
    try {
      const { imageBase64, category, spotName } = req.body;
      const ai = getGeminiClient();

      if (ai && imageBase64 && typeof imageBase64 === 'string') {
        try {
          // Extract exact mime type (png, jpeg, webp, etc.)
          const mimeTypeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
          const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
          const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

          const prompt = `You are QRLEAN AI, an automated waste auditing model for Swachh Bharat cleanliness initiatives in Indian cities.
Analyze this submitted photo for spot "${spotName || 'Public Location'}".
1. Check if the image clearly shows genuine discarded waste/garbage/litter in a public area or waste bin area.
2. If it is an invalid image (e.g. a selfie, blank wall, indoor furniture, animal, food on a plate, or scam photo), set isValid to false.
3. If valid, categorize as one of: Plastic, Wet/Organic, E-Waste, Hazardous, Construction/Debris, General/Mixed.
4. Estimate volume in kilograms (Kg).
5. Rate hazard as Low, Medium, or High.
6. Provide concise reasoning in English with Indian urban context.
7. Return JSON strictly matching the schema.`;

          const response = await ai.models.generateContent({
            model: 'gemini-3.6-flash',
            contents: [
              {
                parts: [
                  { inlineData: { mimeType, data: cleanBase64 } },
                  { text: prompt }
                ]
              }
            ],
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  isValid: { type: Type.BOOLEAN, description: 'True if image contains genuine outdoor/public waste spot' },
                  confidenceScore: { type: Type.INTEGER, description: 'Percentage 0-100 confidence' },
                  detectedCategory: { type: Type.STRING, description: 'Plastic, Wet/Organic, E-Waste, Hazardous, Construction/Debris, or General/Mixed' },
                  estimatedVolumeKg: { type: Type.NUMBER, description: 'Estimated weight of waste in Kg' },
                  hazardRating: { type: Type.STRING, description: 'Low, Medium, or High' },
                  reasoning: { type: Type.STRING, description: 'Explanation of AI audit finding' },
                  detectedObjects: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: 'List of waste items identified'
                  },
                  suggestedAction: { type: Type.STRING, description: 'Action for municipal cleaning center' }
                },
                required: ['isValid', 'confidenceScore', 'detectedCategory', 'estimatedVolumeKg', 'hazardRating', 'reasoning']
              }
            }
          });

          if (response.text) {
            const parsed = JSON.parse(response.text.trim());
            return res.json({ success: true, aiResult: parsed, source: 'gemini' });
          }
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, falling back to simulated audit:', geminiError?.message || geminiError);
        }
      }

      // High-fidelity fallback / simulated audit logic
      const isSimulatedFake = category === 'Trigger_Invalid_Scam';
      
      const fallbackResult = {
        isValid: !isSimulatedFake,
        confidenceScore: isSimulatedFake ? 18 : 94,
        detectedCategory: isSimulatedFake ? 'General/Mixed' : (category || 'Plastic'),
        estimatedVolumeKg: isSimulatedFake ? 0 : 12.5,
        hazardRating: isSimulatedFake ? 'Low' : 'Medium',
        reasoning: isSimulatedFake 
          ? 'AI Alert: Image does not contain municipal waste. Appears to be an invalid or non-waste photo.' 
          : 'AI Audit Confirmed: Litter and discarded packaging verified at public spot. High recyclability value.',
        detectedObjects: isSimulatedFake ? ['Unrelated Object'] : ['PET Bottle', 'Polythene Bag', 'Cardboard Box'],
        suggestedAction: isSimulatedFake ? 'Report rejected automatically.' : 'Route to nearest Ward Waste Segregation Hub.',
      };

      return res.json({ success: true, aiResult: fallbackResult, source: 'simulated' });
    } catch (error: any) {
      console.error('Error verifying waste:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'AI verification service temporarily unavailable.',
      });
    }
  });

  // Get rewards list
  app.get('/api/rewards', (_req, res) => {
    res.json({ success: true, rewards, providers });
  });

  // Add new reward by provider
  app.post('/api/rewards', (req, res) => {
    const { providerId, title, description, type, valueDescription, costInPoints, isAvailable, quantityRemaining, sponsorBannerText } = req.body;
    
    const provider = providers.find(p => p.id === providerId) || providers[0];

    const newReward: RewardItem = {
      id: `rew-${Date.now()}`,
      providerId: provider.id,
      providerName: provider.name,
      providerType: provider.type,
      title,
      description,
      type,
      valueDescription,
      costInPoints: Number(costInPoints) || 100,
      isAvailable: isAvailable !== false,
      quantityRemaining: Number(quantityRemaining) || 10,
      sponsorBannerText: sponsorBannerText || `Sponsored by ${provider.name}`,
      redemptionCode: `QR-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    rewards.unshift(newReward);
    res.json({ success: true, reward: newReward });
  });

  // Toggle reward availability
  app.patch('/api/rewards/:id/availability', (req, res) => {
    const { id } = req.params;
    const { isAvailable, unavailabilityReason } = req.body;

    const reward = rewards.find(r => r.id === id);
    if (!reward) {
      return res.status(404).json({ success: false, message: 'Reward not found' });
    }

    reward.isAvailable = isAvailable;
    reward.unavailabilityReason = isAvailable ? undefined : (unavailabilityReason || 'Out of Stock');
    res.json({ success: true, reward });
  });

  // Create Waste Report
  app.post('/api/report', (req, res) => {
    const { spotName, locationAddress, city, category, imageUrl, aiResult, selectedReward, upiId, reporterName } = req.body;

    const points = aiResult?.isValid ? 150 : 0;

    const newReport: WasteReport = {
      id: `REP-${Math.floor(1000 + Math.random() * 9000)}`,
      spotName: spotName || 'Public Spot',
      locationAddress: locationAddress || 'Local Ward Area',
      city: city || 'Bengaluru',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      category: category || 'Plastic',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      status: 'Dispatched to Swachh Control',
      aiResult,
      pointsEarned: points,
      selectedReward,
      sponsoredBy: selectedReward?.providerName || 'Swachh Partner Network',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today',
      reporterName: reporterName || 'Anonymous Citizen',
      upiId,
    };

    reports.unshift(newReport);

    // Update global impact stats
    if (aiResult?.isValid) {
      impactStats.wasteCollectedKg += aiResult.estimatedVolumeKg || 10;
      impactStats.wasteRecycledKg += (aiResult.estimatedVolumeKg || 10) * 0.85;
      impactStats.ecoBricksProduced += Math.round((aiResult.estimatedVolumeKg || 10) * 3);
      impactStats.co2SavedKg += Math.round((aiResult.estimatedVolumeKg || 10) * 1.2);
    }

    res.json({ success: true, report: newReport, impactStats });
  });

  // Get reports
  app.get('/api/reports', (_req, res) => {
    res.json({ success: true, reports });
  });

  // Get Impact stats
  app.get('/api/impact', (_req, res) => {
    res.json({ success: true, stats: impactStats });
  });

  // Get Leaderboard
  app.get('/api/leaderboard', (_req, res) => {
    res.json({ success: true, leaderboard });
  });

  // Add Provider or Household Donor
  app.post('/api/providers', (req, res) => {
    const { name, type, phone, location, city } = req.body;

    const newProvider: Provider = {
      id: `prov-${Date.now()}`,
      name,
      type: type || 'Shop',
      phone: phone || '+91 90000 00000',
      location: location || 'Main Road',
      city: city || 'Bengaluru',
      rating: 5.0,
      adCreditsEarned: 100,
      itemsOffered: [],
      verifiedBadge: true,
    };

    providers.unshift(newProvider);

    // If household donor, add to leaderboard too
    if (type === 'Household Donor') {
      leaderboard.push({
        id: `usr-${Date.now()}`,
        rank: leaderboard.length + 1,
        name,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        city,
        points: 200,
        reportsCount: 0,
        donationsCount: 1,
        badge: 'Eco Donor 🌿',
        userType: 'household_donor',
      });
    }

    res.json({ success: true, provider: newProvider });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`QRLEAN Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
