import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { 
  collection, query, where, onSnapshot, 
  addDoc, doc, updateDoc, deleteDoc, getDoc, runTransaction
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Shield, Users, AlertTriangle, Activity, Globe, Zap, 
  BarChart3, Search, Plus, MapPin, Settings, LogOut,
  ChevronRight, ArrowUpRight, X, UserPlus, CheckCircle2, 
  Clock, Loader2, Copy, Share2, TrendingUp, Target, Star,
  ClipboardCheck, Eye, ThumbsUp, Banknote, IndianRupee, CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../shared/MapView';
import axios from 'axios';

const NGODashboard = ({ profile }) => {
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', location_name: '', lat: 28.6139, lng: 77.2090, points: 500 });
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [locationQuery, setLocationQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);

  const [reviewTask, setReviewTask] = useState(null);

  useEffect(() => {
    if (!profile.ngo_id) return;
    
    // Tasks
    const qTasks = query(collection(db, 'tasks'), where('ngo_id', '==', profile.ngo_id));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      setTasks(data);
    });

    // Volunteers
    const qVols = query(collection(db, 'profiles'), where('role', '==', 'VOLUNTEER'), where('ngo_id', '==', profile.ngo_id));
    const unsubVols = onSnapshot(qVols, (snap) => setVolunteers(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    // Payout Requests
    const qPayouts = query(collection(db, 'payout_requests'), where('ngo_id', '==', profile.ngo_id));
    const unsubPayouts = onSnapshot(qPayouts, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      setPayouts(data);
    });

    return () => { unsubTasks(); unsubVols(); unsubPayouts(); };
  }, [profile.ngo_id]);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (locationQuery.length > 2) {
        setIsSearchingLoc(true);
        try {
          const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${locationQuery}`);
          setSuggestions(res.data.slice(0, 5));
        } catch (err) { console.error(err); }
        setIsSearchingLoc(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [locationQuery]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'tasks'), {
        ...newTask,
        status: 'Open',
        ngo_id: profile.ngo_id,
        created_at: new Date(),
        location: { lat: newTask.lat, lng: newTask.lng, name: newTask.location_name }
      });
      setIsTaskModalOpen(false);
      setNewTask({ title: '', description: '', priority: 'Medium', location_name: '', lat: 28.6139, lng: 77.2090, points: 500 });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleVerifyTask = async (task) => {
    setLoading(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'profiles', task.assigned_to);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw "User does not exist!";
        const newPoints = (userDoc.data().points || 0) + (task.points || 100);
        transaction.update(userRef, { points: newPoints });
        transaction.update(doc(db, 'tasks', task.id), { status: 'Completed', verified_at: new Date() });
        const historyRef = doc(collection(db, 'task_history'));
        transaction.set(historyRef, {
          task_id: task.id, task_title: task.title, user_id: task.assigned_to,
          points_earned: task.points || 100, created_at: new Date(), note: task.completion_note
        });
      });
      setReviewTask(null);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleProcessPayout = async (payoutId) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'payout_requests', payoutId), { status: 'Processed', processed_at: new Date() });
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const generateInviteLink = () => {
    const link = `${window.location.origin}/login?invite=${profile.ngo_id}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const pendingApprovals = tasks.filter(t => t.status === 'Pending Verification');
  const pendingPayouts = payouts.filter(p => p.status === 'Pending');

  return (
    <div className="h-screen flex bg-[#020617] text-slate-100 overflow-hidden font-sans">
      <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col bg-black/20 backdrop-blur-3xl z-50">
        <div className="p-6 flex items-center gap-4">
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20"><Shield className="w-6 h-6 text-white" /></div>
          <span className="hidden lg:block font-black tracking-tighter uppercase text-sm">Nexus <span className="text-primary-500">Admin</span></span>
        </div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'approvals', icon: ClipboardCheck, label: 'Review Hub', badge: pendingApprovals.length },
            { id: 'payouts', icon: Banknote, label: 'Payouts', badge: pendingPayouts.length },
            { id: 'tasks', icon: Activity, label: 'Missions' },
            { id: 'volunteers', icon: Users, label: 'Responders' },
            { id: 'map', icon: Globe, label: 'Live Map' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all relative ${activeTab === item.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-500/20' : 'text-slate-500 hover:text-white'}`}>
              <item.icon className="w-5 h-5 min-w-[20px]" />
              <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {item.badge > 0 && <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center animate-pulse">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5"><button onClick={() => signOut(auth)} className="w-full flex items-center gap-4 p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"><LogOut className="w-5 h-5 min-w-[20px]" /><span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Logout</span></button></div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-black/10 backdrop-blur-md">
          <h2 className="text-xl font-black uppercase tracking-tight">{activeTab}</h2>
          <div className="flex items-center gap-4">
            <button onClick={generateInviteLink} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${copySuccess ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' : 'border-white/10 text-slate-400 hover:text-white'}`}>
              {copySuccess ? 'Copied Link!' : <><Share2 className="w-3 h-3" /> Invite Link</>}
            </button>
            <button onClick={() => setIsTaskModalOpen(true)} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-500/20"><Plus className="w-4 h-4" /> Deploy Mission</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="Live Missions" value={tasks.filter(t => t.status === 'Open').length} icon={Activity} color="primary" />
                  <StatCard label="Verification Queue" value={pendingApprovals.length} icon={ClipboardCheck} color="amber" />
                  <StatCard label="Payout Requests" value={pendingPayouts.length} icon={Banknote} color="emerald" />
                  <StatCard label="Total Responders" value={volunteers.length} icon={Users} color="indigo" />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                  <div className="xl:col-span-2 glass-card p-8 flex flex-col gap-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Recent Operational Activity</h3>
                    <div className="space-y-4">
                      {tasks.slice(0, 5).map(t => (
                        <div key={t.id} className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex justify-between items-center group hover:bg-white/[0.05] transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${t.status === 'Open' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}><Zap className="w-4 h-4" /></div>
                            <div><h4 className="font-bold text-white uppercase text-xs">{t.title}</h4><p className="text-[10px] text-slate-500 font-black tracking-widest mt-1">{t.status} • {t.location?.name}</p></div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-800 group-hover:text-white transition-all" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="glass-card overflow-hidden"><MapView tasks={tasks} hideHeader /></div>
                </div>
              </motion.div>
            )}

            {activeTab === 'approvals' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {pendingApprovals.length > 0 ? pendingApprovals.map(task => (
                  <div key={task.id} className="glass-card p-10 flex items-center justify-between border-l-4 border-amber-500 bg-amber-500/[0.02]">
                    <div className="flex items-center gap-8">
                      <div className="p-4 bg-amber-500/10 rounded-2xl shadow-xl shadow-amber-500/10"><Clock className="w-8 h-8 text-amber-500" /></div>
                      <div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">{task.title}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Submitted by <span className="text-primary-500">{task.assigned_to_name}</span></p>
                      </div>
                    </div>
                    <button onClick={() => setReviewTask(task)} className="bg-white text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all flex items-center gap-3"><Eye className="w-4 h-4" /> Review Submission</button>
                  </div>
                )) : (
                  <div className="glass-card p-20 text-center"><ClipboardCheck className="w-16 h-16 text-slate-800 mx-auto mb-6" /><p className="text-slate-500 font-bold uppercase tracking-widest">Verification Queue Empty</p></div>
                )}
              </motion.div>
            )}

            {activeTab === 'payouts' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {payouts.length > 0 ? payouts.map(p => (
                  <div key={p.id} className={`glass-card p-10 flex items-center justify-between border-l-4 ${p.status === 'Pending' ? 'border-emerald-500 bg-emerald-500/[0.02]' : 'border-slate-800 opacity-60'}`}>
                    <div className="flex items-center gap-8">
                      <div className={`p-4 rounded-2xl ${p.status === 'Pending' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-500'}`}><IndianRupee className="w-8 h-8" /></div>
                      <div>
                        <h4 className="text-2xl font-black text-white uppercase tracking-tight">₹{p.amount_inr}</h4>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Request from <span className="text-emerald-500">{p.user_name}</span> • UPI: <span className="text-white">{p.upi_id}</span></p>
                      </div>
                    </div>
                    {p.status === 'Pending' ? (
                      <button onClick={() => handleProcessPayout(p.id)} disabled={loading} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center gap-3">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Mark as Paid</>}
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 font-black text-[10px] uppercase tracking-widest"><CheckCircle2 className="w-4 h-4" /> Processed</div>
                    )}
                  </div>
                )) : (
                  <div className="glass-card p-20 text-center"><Banknote className="w-16 h-16 text-slate-800 mx-auto mb-6" /><p className="text-slate-500 font-bold uppercase tracking-widest">No Payout Requests</p></div>
                )}
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  {tasks.length > 0 ? tasks.map(t => (
                    <div key={t.id} className="glass-card p-6 flex justify-between items-center group">
                      <div className="flex items-center gap-6">
                        <div className={`p-3 rounded-2xl ${t.status === 'Open' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}><Zap className="w-5 h-5" /></div>
                        <div>
                          <h4 className="text-lg font-black text-white uppercase">{t.title}</h4>
                          <p className="text-[10px] text-slate-500 font-black tracking-widest mt-1">{t.status} • {t.location?.name} • {t.points} PTS</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all"><Settings className="w-4 h-4" /></button>
                        <button onClick={async () => { if(confirm('Delete mission?')) await deleteDoc(doc(db, 'tasks', t.id)) }} className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all"><X className="w-4 h-4" /></button>
                      </div>
                    </div>
                  )) : (
                    <div className="glass-card p-20 text-center"><Activity className="w-16 h-16 text-slate-800 mx-auto mb-6" /><p className="text-slate-500 font-bold uppercase tracking-widest">No Missions Deployed</p></div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'volunteers' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {volunteers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {volunteers.map(v => (
                      <div key={v.id} className="glass-card p-8 flex flex-col gap-6 group hover:border-primary-500/30 transition-all">
                        <div className="flex items-center gap-6">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${v.id}`} className="w-20 h-20 rounded-3xl bg-white/5 border border-white/5" alt="v" />
                          <div className="flex-1">
                            <h4 className="text-lg font-black text-white uppercase leading-tight">{v.name}</h4>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mt-2 italic">{v.skills?.join(' • ') || 'General Ops'}</p>
                          </div>
                        </div>
                        <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                          <div><p className="text-2xl font-black text-amber-500">{v.points || 0}</p><p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Impact Points</p></div>
                          <div className="p-3 bg-white/5 rounded-2xl text-amber-500"><Star className="w-5 h-5 fill-current" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-20 text-center space-y-6">
                    <Users className="w-16 h-16 text-slate-800 mx-auto" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest leading-relaxed">No Responders Enrolled Yet<br/><span className="text-[10px] text-slate-700">Share your invite link to build your workforce</span></p>
                    <button onClick={generateInviteLink} className="text-primary-500 hover:underline text-xs font-black uppercase tracking-widest">Copy Invite Link</button>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'map' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-[calc(100vh-200px)] glass-card overflow-hidden"><MapView tasks={tasks} /></motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* TASK DEPLOYMENT MODAL */}
      <AnimatePresence>
        {isTaskModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTaskModalOpen(false)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl glass-card overflow-hidden">
              <div className="h-40 bg-primary-600 p-10 flex flex-col justify-end"><button onClick={() => setIsTaskModalOpen(false)} className="absolute top-6 right-6 p-2 bg-black/20 rounded-xl transition-all"><X className="w-6 h-6 text-white" /></button><h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Deploy New Mission</h3></div>
              <form onSubmit={handleCreateTask} className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission Name</label><input type="text" required value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary-500" placeholder="e.g. Flood Relief Phase 1" /></div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Impact Credits</label><input type="number" required value={newTask.points} onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-primary-500" /></div>
                </div>
                <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tactical Objectives</label><textarea required value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 text-sm font-bold text-white outline-none focus:border-primary-500 resize-none" placeholder="Describe the mission goals..." /></div>
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Target Location Search</label>
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 w-4 h-4 text-slate-500" />
                    <input type="text" value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white font-bold outline-none focus:border-primary-500" placeholder="Search city or street (e.g. Aligarh)" />
                    {isSearchingLoc && <Loader2 className="absolute right-4 w-4 h-4 text-primary-500 animate-spin" />}
                  </div>
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-[3000] overflow-hidden">
                      {suggestions.map((s, i) => (
                        <button key={i} type="button" onClick={() => { setNewTask({...newTask, location_name: s.display_name, lat: parseFloat(s.lat), lng: parseFloat(s.lon)}); setLocationQuery(s.display_name); setSuggestions([]); }} className="w-full text-left px-6 py-4 text-[10px] font-bold text-slate-300 hover:bg-primary-600 hover:text-white transition-all border-b border-white/5 last:border-0">{s.display_name}</button>
                      ))}
                    </div>
                  )}
                </div>
                <button type="submit" disabled={loading} className="w-full bg-primary-600 hover:bg-emerald-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-primary-500/20">{loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Activate Strategic Deployment'}</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REVIEW MODAL (UNCHANGED) */}
      <AnimatePresence>
        {reviewTask && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewTask(null)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl glass-card overflow-hidden">
              <div className="h-40 bg-amber-500 p-10 flex flex-col justify-end"><button onClick={() => setReviewTask(null)} className="absolute top-6 right-6 p-2 bg-black/20 rounded-xl"><X className="w-6 h-6" /></button><h3 className="text-2xl font-black text-white uppercase">Operational Review</h3></div>
              <div className="p-10 space-y-8">
                <div className="space-y-4"><h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Responder Report</h4><p className="text-slate-300 font-medium leading-relaxed bg-white/5 p-6 rounded-2xl italic">"{reviewTask.completion_note}"</p></div>
                <button onClick={() => handleVerifyTask(reviewTask)} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest transition-all">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Approve & Award Points"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color }) => (
  <div className="glass-card p-8 group">
    <div className={`p-4 bg-${color}-500/10 rounded-2xl border border-${color}-500/20 mb-8 w-fit group-hover:scale-110 transition-transform`}><Icon className={`w-8 h-8 text-${color}-500`} /></div>
    <p className="text-5xl font-black text-white mb-2">{value}</p>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</p>
  </div>
);

export default NGODashboard;
