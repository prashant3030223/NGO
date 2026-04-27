import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { motion, AnimatePresence } from 'framer-motion';

// Layouts & Components
import Login from './components/auth/Login';
import NGORegistration from './components/auth/NGORegistration';
import NGODashboard from './components/ngo/NGODashboard';
import VolunteerDashboard from './components/volunteer/VolunteerDashboard';
import LoadingScreen from './components/shared/LoadingScreen';

const App = () => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Real-time Profile Listener
        const unsubProfile = onSnapshot(doc(db, 'profiles', currentUser.uid), (docSnap) => {
          if (docSnap.exists()) {
            setProfile({ id: docSnap.id, ...docSnap.data() });
          } else {
            setProfile(null);
          }
          setLoading(false);
        });
        return () => unsubProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <Router>
      <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-primary-500/30">
        <AnimatePresence mode="wait">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route
              path="/login"
              element={!user ? <Login /> : <Navigate to="/" />}
            />

            {/* PROTECTED ROUTES */}
            <Route
              path="/"
              element={
                user ? (
                  profile ? (
                    profile.role === 'NGO_ADMIN' ? (
                      profile.ngo_id ? <NGODashboard profile={profile} /> : <NGORegistration profile={profile} />
                    ) : (
                      <VolunteerDashboard profile={profile} />
                    )
                  ) : (
                    // If user exists but profile doesn't (first time social login)
                    // We can redirect to a profile completion or default to Volunteer
                    <VolunteerDashboard profile={{ id: user.uid, role: 'VOLUNTEER', name: user.displayName }} />
                  )
                ) : (
                  <Navigate to="/login" />
                )
              }
            />

            {/* FALLBACK */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
