import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy, doc } from 'firebase/firestore';
import { 
  Layout, Shield, Users, AlertTriangle, Upload, Activity, 
  ChevronRight, Globe, Zap, BarChart3, Bell, Settings, Search,
  Cpu, Database, Radio, Waypoints, Terminal, LogOut, User as UserIcon,
  ShieldCheck, BarChart, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from './components/MapView';
import NeedCard from './components/NeedCard';
import UploadPanel from './components/UploadPanel';
import AssignmentPanel from './components/AssignmentPanel';
import Login from './components/Login';
import ProfilePanel from './components/ProfilePanel';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needs, setNeeds] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setError(null);

    const handleError = (err) => {
      console.error("Firestore Error:", err);
      if (err.code === 'permission-denied') {
        setError("SECURITY ACCESS DENIED: Please update Firestore Rules in Firebase Console.");
      }
    };

    const unsubscribeNeeds = onSnapshot(
      query(collection(db, 'needs'), orderBy('timestamp', 'desc')), 
      (snap) => setNeeds(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      handleError
    );
    
    const unsubscribeVolunteers = onSnapshot(
      collection(db, 'volunteers'), 
      (snap) => setVolunteers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))),
      handleError
    );

    const unsubscribeAssignments = onSnapshot(
      doc(db, 'meta', 'assignments'), 
      (snap) => { if (snap.exists()) setAssignments(snap.data().data || []); },
      handleError
    );

    return () => { unsubscribeNeeds(); unsubscribeVolunteers(); unsubscribeAssignments(); };
  }, [user]);

  const handleLogout = async () => { try { await signOut(auth); } catch (err) { console.error(err); } };
  const handleAutoAssign = async () => {
    setIsProcessing(true);
    try { await axios.post('http://localhost:5002/api/match'); } catch (e) { console.error(e); }
    finally { setIsProcessing(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500 blur-3xl opacity-20 animate-pulse" />
        <Shield className="w-16 h-16 text-primary-500 animate-bounce" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="text-sm font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Initialising Core</div>
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 2 }} className="h-full bg-primary-500" />
        </div>
      </div>
    </div>
  );

  if (!user) return <Login />;

  const filteredNeeds = needs.filter(n => 
    n.location?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const profileImage = user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;

  const NavButton = ({ tab, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(tab)} 
      className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${activeTab === tab ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
      <Icon className="w-4 h-4" /> 
      <span className="text-xs font-black uppercase tracking-[0.1em]">{label}</span>
      {activeTab === tab && <motion.div layoutId="nav-pill" className="absolute inset-0 bg-primary-500 -z-10" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans selection:bg-primary-500/30 overflow-hidden">
      <header className="h-24 border-b border-white/5 bg-[#020617]/40 backdrop-blur-2xl flex items-center justify-between px-12 sticky top-0 z-[1000]">
        <div className="flex items-center gap-6">
          <motion.div whileHover={{ scale: 1.05 }} className="relative group cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="absolute inset-0 bg-primary-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="relative bg-gradient-to-br from-primary-400 to-primary-700 p-3 rounded-2xl border border-white/10">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-2xl font-black tracking-[-0.05em] font-display bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent uppercase leading-none">
              RESCUEMATCH <span className="text-primary-500">AI</span>
            </h1>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Global Node Online</span>
            </div>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-white/5 p-1.5 rounded-3xl border border-white/5">
          <NavButton tab="dashboard" icon={Globe} label="Live Map" />
          <NavButton tab="volunteers" icon={Users} label="Volunteers" />
          <NavButton tab="analytics" icon={BarChart} label="Impact" />
          <NavButton tab="upload" icon={Terminal} label="Ingest" />
          <NavButton tab="profile" icon={Settings} label="Config" />
        </nav>

        <div className="flex items-center gap-6">
          <div className="hidden xl:flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1 text-right">OPERATOR</span>
            <span className="text-sm font-black font-display text-white tracking-tight uppercase">{user.displayName || 'ADMIN'}</span>
          </div>
          <div className="relative group cursor-pointer" onClick={() => setActiveTab('profile')}>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-white/10 p-1 group-hover:scale-110 transition-transform overflow-hidden">
              <img src={profileImage} className="w-full h-full rounded-xl object-cover" alt="User" />
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-rose-500 text-white px-12 py-3 flex items-center justify-between text-xs font-black uppercase tracking-widest z-[2000]"
          >
            <div className="flex items-center gap-4">
              <ShieldAlert className="w-4 h-4" />
              {error}
            </div>
            <button onClick={() => setError(null)} className="opacity-60 hover:opacity-100">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex overflow-hidden p-8 gap-8 relative">
        <aside className="w-[440px] flex flex-col gap-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-6 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20"><AlertTriangle className="w-5 h-5 text-rose-500" /></div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">CRITICAL</div>
              </div>
              <div className="text-4xl font-black font-display text-white leading-none mb-1">{needs.filter(n => n.urgencyScore > 80).length}</div>
              <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Incident Reports</div>
            </div>
            <div className="glass-card p-6 relative group overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20"><ShieldCheck className="w-5 h-5 text-emerald-500" /></div>
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ACTIVE</div>
              </div>
              <div className="text-4xl font-black font-display text-white leading-none mb-1">{volunteers.length}</div>
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Field Responders</div>
            </div>
          </div>

          <div className="flex-1 flex flex-col glass-card overflow-hidden relative border-white/5 shadow-2xl">
            <div className="p-6 border-b border-white/5 space-y-6 bg-white/[0.02]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary-500" />
                  <h2 className="text-lg font-black font-display text-white uppercase tracking-tight">Signal Feed</h2>
                </div>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input type="text" placeholder="FILTER FEED..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold text-white outline-none focus:border-primary-500 transition-all" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
              <AnimatePresence mode="popLayout">
                {filteredNeeds.map((need, idx) => (
                  <motion.div key={need.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}><NeedCard need={need} /></motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="p-6 border-t border-white/5">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
                <LogOut className="w-4 h-4" /> Terminate Session
              </button>
            </div>
          </div>
        </aside>

        <section className="flex-1 flex flex-col gap-8 overflow-hidden">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col gap-8 h-full">
                <div className="flex-1 glass-card overflow-hidden relative border-white/5 group shadow-2xl">
                  <MapView needs={needs} volunteers={volunteers} />
                  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-[400]">
                    <button onClick={handleAutoAssign} disabled={isProcessing} className="bg-white text-black font-black py-5 px-12 rounded-3xl shadow-2xl flex items-center gap-5 hover:bg-primary-500 hover:text-white transition-all uppercase tracking-widest text-xs">
                      {isProcessing ? <Activity className="w-5 h-5 animate-spin" /> : <Waypoints className="w-5 h-5" />} Execute Sync
                    </button>
                  </div>
                </div>
                <div className="h-80 glass-card overflow-hidden flex flex-col border-white/5"><div className="flex-1 p-8 overflow-hidden"><AssignmentPanel assignments={assignments} needs={needs} /></div></div>
              </motion.div>
            )}

            {activeTab === 'volunteers' && (
              <motion.div key="vol" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 glass-card p-12 overflow-y-auto">
                <h2 className="text-3xl font-black font-display text-white mb-8 uppercase">Active Responder Matrix</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {volunteers.map(vol => (
                    <div key={vol.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-8 hover:bg-white/5 transition-all group overflow-hidden relative">
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="w-16 h-16 rounded-2xl border border-primary-500/20 overflow-hidden bg-[#020617]">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${vol.id}`} className="w-full h-full object-cover" alt="Vol" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-white">{vol.name}</p>
                          <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Tactical Responder</p>
                        </div>
                      </div>
                      <div className="space-y-4 relative z-10">
                        <div className="flex gap-2">
                          {(vol.skills || []).map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black uppercase text-slate-400 border border-white/5">{s}</span>
                          ))}
                        </div>
                        <div className="flex justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest"><span>Sync Probability</span><span>98%</span></div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-[98%]" /></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div key="ana" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 glass-card p-12 flex flex-col items-center justify-center text-center">
                <BarChart3 className="w-24 h-24 text-primary-500 mb-8 opacity-20" />
                <h2 className="text-3xl font-black font-display text-white mb-4 uppercase">Impact Analytics Matrix</h2>
                <p className="text-slate-500 max-w-md font-medium">Aggregating historical data points for predictive crisis forecasting. Visualization module initializing...</p>
              </motion.div>
            )}

            {activeTab === 'upload' && (
              <motion.div key="up" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 glass-card flex justify-center items-center bg-white/[0.01]">
                <UploadPanel onComplete={() => setActiveTab('dashboard')} />
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div key="prof" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 glass-card flex flex-col items-center overflow-y-auto">
                <ProfilePanel user={user} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <footer className="h-12 border-t border-white/5 bg-[#020617] flex items-center justify-between px-12 text-[10px] text-slate-600 uppercase font-bold tracking-[0.4em]">
        <div className="flex items-center gap-8"><span>Nexus Core v4.2.0</span></div>
        <div className="flex items-center gap-8"><span className="text-primary-500/60 font-black">Firestore Live</span><span>{new Date().toISOString().split('T')[1].substring(0, 8)} Z</span></div>
      </footer>
    </div>
  );
};

export default App;
