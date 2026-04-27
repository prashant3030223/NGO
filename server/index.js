const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const http = require('http');
const admin = require('firebase-admin');
require('dotenv').config();

const aiService = require('./services/aiService');
const ocrService = require('./services/ocrService');

// Firebase Admin Setup with Graceful Error Handling
let db = null;
try {
  if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== 'your_service_account_private_key') {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');
  } else {
    console.warn('⚠️ Firebase credentials missing or default. Firestore write disabled.');
  }
} catch (error) {
  console.error('❌ Firebase Admin init failed:', error.message);
}

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Routes
app.post('/api/ingest', upload.single('file'), async (req, res) => {
  console.log('🚀 Ingest Request Received');
  try {
    const { textInput } = req.body;
    let extractedText = textInput || '';

    if (req.file) {
      console.log('📂 Processing file:', req.file.originalname);
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(fileExtension)) {
        extractedText = await ocrService.processImage(req.file.path);
      } else if (fileExtension === '.pdf') {
        extractedText = await ocrService.processPDF(req.file.path);
      }
    }

    if (!extractedText || extractedText.trim() === '') {
      console.warn('⚠️ No text extracted from input');
      return res.status(400).json({ error: 'No readable text found' });
    }

    console.log('🧠 Analyzing with AI...');
    const analysis = await aiService.analyzeNeed(extractedText);
    
    // Save to Firestore if available
    if (db) {
      try {
        const needRef = db.collection('needs').doc();
        await needRef.set({
          ...analysis,
          id: needRef.id,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log('💾 Saved to Firestore');
      } catch (dbErr) {
        console.error('❌ Firestore Save Failed:', dbErr.message);
      }
    } else {
      console.log('💡 Mock Save (No DB):', analysis);
    }
    
    console.log('✅ Sending Response');
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('🔴 Ingestion Route Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

app.post('/api/match', async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: 'Database not connected' });

    const needsSnapshot = await db.collection('needs').get();
    const volunteersSnapshot = await db.collection('volunteers').get();
    
    const needs = needsSnapshot.docs.map(doc => doc.data());
    const volunteers = volunteersSnapshot.docs.map(doc => doc.data());
    
    const assignments = runMatching(needs, volunteers);
    
    await db.collection('meta').doc('assignments').set({ 
      data: assignments,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    res.json({ success: true, assignments });
  } catch (error) {
    console.error('Matching error:', error);
    res.status(500).json({ error: 'Failed to match' });
  }
});

const runMatching = (needs, volunteers) => {
  const assignments = [];
  const sortedNeeds = [...needs].sort((a, b) => b.urgencyScore - a.urgencyScore);
  
  sortedNeeds.forEach(need => {
    let bestMatch = null;
    let highestScore = -1;

    volunteers.forEach(vol => {
      const skillMatch = vol.skills?.includes(need.type) ? 50 : 0;
      const dist = Math.sqrt(Math.pow(vol.location?.lat - need.location?.lat, 2) + Math.pow(vol.location?.lng - need.location?.lng, 2));
      const distanceScore = Math.max(0, 50 - (dist * 100));
      const total = skillMatch + distanceScore;

      if (total > highestScore) {
        highestScore = total;
        bestMatch = vol;
      }
    });

    if (bestMatch) {
      assignments.push({
        needId: need.id,
        volunteerId: bestMatch.id,
        volunteerName: bestMatch.name,
        matchScore: highestScore
      });
    }
  });
  return assignments;
};

// Simulation Engine
setInterval(async () => {
  if (!db) return;
  try {
    const types = ['food', 'medical', 'shelter', 'logistics'];
    const type = types[Math.floor(Math.random() * types.length)];
    const needRef = db.collection('needs').doc();
    await needRef.set({
      type,
      location: {
        name: 'Simulated Area',
        lat: 28.6 + (Math.random() - 0.5) * 0.2,
        lng: 77.2 + (Math.random() - 0.5) * 0.2
      },
      urgencyScore: Math.floor(Math.random() * 40) + 60,
      summary: `Auto-generated ${type} requirement.`,
      id: needRef.id,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (e) { console.error('Sim error:', e); }
}, 60000);

server.listen(port, () => console.log(`🚀 AI Backend running at http://localhost:${port}`));
