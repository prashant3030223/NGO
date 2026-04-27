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
  if (!admin.apps.length && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== 'your_service_account_private_key' && !process.env.FIREBASE_PRIVATE_KEY.includes('...')) {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    db = admin.firestore();
    console.log('✅ Firebase Admin initialized');
    setupRealtimeMatching();
  } else {
    console.warn('⚠️ Firebase credentials missing or invalid. Running in SIMULATION MODE.');
  }
} catch (error) {
  console.error('❌ Firebase Admin init failed:', error.message);
}

// MOCK STORE FOR SIMULATION MODE
let mockNeeds = [];
let mockVolunteers = [
  { id: 'v1', name: 'Rahul Sharma', skills: ['medical', 'food'], location: { lat: 28.6139, lng: 77.2090 } },
  { id: 'v2', name: 'Anita Desai', skills: ['shelter', 'logistics'], location: { lat: 28.6339, lng: 77.2290 } }
];
let mockAssignments = [];

function setupRealtimeMatching() {
  db.collection('needs').onSnapshot(async (snapshot) => {
    const needs = snapshot.docs.map(doc => doc.data());
    const volunteersSnapshot = await db.collection('volunteers').get();
    const volunteers = volunteersSnapshot.docs.map(doc => doc.data());
    const assignments = runMatching(needs, volunteers);
    await db.collection('meta').doc('assignments').set({ data: assignments, updatedAt: new Date() });
  }, err => console.error('Match Listener Error:', err));
}

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const upload = multer({ dest: 'uploads/' });

app.post('/api/ingest', upload.single('file'), async (req, res) => {
  try {
    const { textInput } = req.body;
    let extractedText = textInput || '';

    if (req.file) {
      const ext = path.extname(req.file.originalname).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) extractedText = await ocrService.processImage(req.file.path);
      else if (ext === '.pdf') extractedText = await ocrService.processPDF(req.file.path);
    }

    const analysis = await aiService.analyzeNeed(extractedText);
    
    if (db) {
      const needRef = db.collection('needs').doc();
      await needRef.set({ ...analysis, id: needRef.id, timestamp: admin.firestore.FieldValue.serverTimestamp() });
    } else {
      // SIMULATION MODE: Update mock state
      const newNeed = { ...analysis, id: 'n' + Date.now(), timestamp: new Date() };
      mockNeeds.push(newNeed);
      mockAssignments = runMatching(mockNeeds, mockVolunteers);
      console.log('✨ Simulation: Needs updated and matching recalculated.');
    }
    
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ error: 'Processing failed' });
  }
});

app.post('/api/match', async (req, res) => {
  if (!db) {
    mockAssignments = runMatching(mockNeeds, mockVolunteers);
    return res.json({ success: true, assignments: mockAssignments });
  }
  // Logic for DB already handled by listener
  res.json({ success: true });
});

const runMatching = (needs, volunteers) => {
  const assignments = [];
  const sortedNeeds = [...needs].sort((a, b) => (b.urgencyScore || 0) - (a.urgencyScore || 0));
  sortedNeeds.forEach(need => {
    let bestMatch = null; let highestScore = -1;
    volunteers.forEach(vol => {
      const skillMatch = (vol.skills || []).includes(need.type) ? 50 : 0;
      const dist = Math.sqrt(Math.pow((vol.location?.lat || 0) - (need.location?.lat || 0), 2) + Math.pow((vol.location?.lng || 0) - (need.location?.lng || 0), 2));
      const distanceScore = Math.max(0, 50 - (dist * 100));
      const total = skillMatch + distanceScore;
      if (total > highestScore) { highestScore = total; bestMatch = vol; }
    });
    if (bestMatch) assignments.push({ needId: need.id, volunteerId: bestMatch.id, volunteerName: bestMatch.name, matchScore: highestScore });
  });
  return assignments;
};

server.listen(port, () => console.log(`🚀 Automated AI Backend running at http://localhost:${port}`));
