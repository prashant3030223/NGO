const admin = require('firebase-admin');
require('dotenv').config();

// Ensure you have valid credentials in .env or this will fail
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        project_id: process.env.FIREBASE_PROJECT_ID,
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      })
    });
  }
  const db = admin.firestore();

  const volunteers = [
    {
      name: 'Rahul Sharma',
      skills: ['medical', 'food'],
      location: { lat: 28.6139, lng: 77.2090 },
      status: 'active'
    },
    {
      name: 'Anita Desai',
      skills: ['shelter', 'logistics'],
      location: { lat: 28.6339, lng: 77.2290 },
      status: 'active'
    },
    {
      name: 'Vikram Singh',
      skills: ['medical'],
      location: { lat: 28.5939, lng: 77.1890 },
      status: 'active'
    },
    {
      name: 'Sonia Khan',
      skills: ['food', 'logistics'],
      location: { lat: 28.6539, lng: 77.2490 },
      status: 'active'
    }
  ];

  const seed = async () => {
    console.log('🌱 Seeding Volunteers...');
    for (const vol of volunteers) {
      const docRef = db.collection('volunteers').doc();
      await docRef.set({ ...vol, id: docRef.id });
    }
    console.log('✅ Seeding Complete');
    process.exit(0);
  };

  seed();
} catch (e) {
  console.error('Seed failed:', e.message);
  process.exit(1);
}
