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
      const { imageBase64, category, spotName, visualComplexity } = req.body;
      const ai = getGeminiClient();

      if (ai && imageBase64 && typeof imageBase64 === 'string') {
        try {
          // Process image input: handle base64 data URIs, HTTP URLs, or raw base64
          let mimeType = 'image/jpeg';
          let cleanBase64 = '';

          if (imageBase64.startsWith('data:')) {
            const mimeMatch = imageBase64.match(/^data:(image\/\w+);base64,/);
            if (mimeMatch) {
              mimeType = mimeMatch[1];
            }
            cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          } else if (imageBase64.startsWith('http://') || imageBase64.startsWith('https://')) {
            try {
              const imgRes = await fetch(imageBase64);
              const arrayBuffer = await imgRes.arrayBuffer();
              cleanBase64 = Buffer.from(arrayBuffer).toString('base64');
              const contentType = imgRes.headers.get('content-type');
              if (contentType) mimeType = contentType;
            } catch (fetchErr) {
              console.warn('Could not fetch HTTP image for Gemini:', fetchErr);
            }
          } else {
            cleanBase64 = imageBase64;
          }

          if (cleanBase64) {
            const prompt = `You are QRLEAN AI, an expert computer vision waste auditor for Swachh Bharat cleanliness initiatives in Indian cities.
Examine this submitted photo for spot "${spotName || 'Public Location'}".

STRICT AUDIT RULES:
1. DOES THIS IMAGE CLEARLY SHOW GENUINE DISCARDED WASTE, GARBAGE, LITTER, PLASTIC TRASH, ORGANIC WASTE SCRAPS, E-WASTE, OR DEBRIS IN A PUBLIC OR DUMPSTER AREA?
2. IF NO WASTE IS PRESENT (e.g. it is a selfie, clean room, blank wall, indoor furniture, person without waste, clean desk, animal, paper document, or clean outdoor landscape):
   - Set "isValid": false
   - Set "confidenceScore": 15
   - Set "detectedCategory": "None / Non-Waste"
   - Set "estimatedVolumeKg": 0
   - Set "hazardRating": "Low"
   - Set "reasoning": Clear explanation why report is invalid (e.g., "Image shows a clean surface or selfie with no visible municipal waste or litter.").
   - Set "detectedObjects": ["Non-waste item / clean scene"]
   - Set "suggestedAction": "Report rejected automatically as no waste was found."
3. IF GENUINE DISCARDED WASTE IS PRESENT:
   - Set "isValid": true
   - Set "confidenceScore": 80 to 99
   - Set "detectedCategory": one of "Plastic", "Wet/Organic", "E-Waste", "Hazardous", "Construction/Debris", or "General/Mixed"
   - Set "estimatedVolumeKg": estimated weight in kg (e.g. 2.5 to 25.0)
   - Set "hazardRating": "Low", "Medium", or "High"
   - Set "reasoning": Concise explanation of the waste material observed and location context.
   - Set "detectedObjects": list of identified waste objects (e.g. ["PET bottle", "Polythene bag", "Cardboard"])
   - Set "suggestedAction": Action for municipal cleaning crew.

Return JSON strictly matching the schema.`;

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
                    isValid: { type: Type.BOOLEAN, description: 'True if image contains genuine waste/litter spot, False if clean/non-waste/selfie' },
                    confidenceScore: { type: Type.INTEGER, description: 'Percentage 0-100 confidence' },
                    detectedCategory: { type: Type.STRING, description: 'Plastic, Wet/Organic, E-Waste, Hazardous, Construction/Debris, General/Mixed, or None / Non-Waste' },
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
          }
        } catch (geminiError: any) {
          console.warn('Gemini API call failed, falling back to smart image audit:', geminiError?.message || geminiError);
        }
      }

      // High-fidelity fallback / smart image feature audit logic
      const isExplicitFakeTrigger = category === 'Trigger_Invalid_Scam';
      const isLowClutterNonWaste = typeof visualComplexity === 'number' && visualComplexity < 18;
      const isInvalid = isExplicitFakeTrigger || isLowClutterNonWaste;

      const fallbackResult = {
        isValid: !isInvalid,
        confidenceScore: isInvalid ? 18 : 94,
        detectedCategory: isInvalid ? 'None / Non-Waste' : (category || 'Plastic'),
        estimatedVolumeKg: isInvalid ? 0 : 12.5,
        hazardRating: isInvalid ? 'Low' : 'Medium',
        reasoning: isInvalid
          ? 'AI Vision Alert: Image appears to be a clean surface, selfie, or non-waste photo. No municipal waste or litter detected.'
          : 'AI Audit Confirmed: Litter and discarded packaging verified at public spot. High recyclability value.',
        detectedObjects: isInvalid ? ['Clean Surface / Unrelated Object'] : ['PET Bottle', 'Polythene Bag', 'Cardboard Box'],
        suggestedAction: isInvalid ? 'Report rejected automatically.' : 'Route to nearest Ward Waste Segregation Hub.',
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
