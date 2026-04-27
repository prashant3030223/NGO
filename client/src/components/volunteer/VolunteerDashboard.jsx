import React, { useState, useEffect } from 'react';
import { db, auth } from '../../firebase';
import { 
  collection, onSnapshot, query, where, doc, 
  updateDoc, addDoc, orderBy, limit 
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { 
  Shield, Globe, Zap, Navigation, Trophy, Wallet, LogOut, ArrowRight, 
  MapPin, Star, Filter, Search, CheckCircle2, X, Camera, FileText, Loader2,
  LayoutGrid, History, Award, Settings, User, ShoppingBag, TrendingUp, Clock, AlertCircle, Banknote, CreditCard, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MapView from '../shared/MapView';
import confetti from 'canvas-confetti';

const VolunteerDashboard = ({ profile }) => {
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('missions');
  const [missionFilter, setMissionFilter] = useState('nearby');
  const [userPoints, setUserPoints] = useState(profile.points || 0);
  const [history, setHistory] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [completionData, setCompletionData] = useState({ note: '' });
  const [loading, setLoading] = useState(false);

  // Payout State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutData, setPayoutData] = useState({ upi_id: '', points: 2000 });
  const MIN_PAYOUT = 2000;

  useEffect(() => {
    const q = profile.ngo_id 
      ? query(collection(db, 'tasks'), where('ngo_id', '==', profile.ngo_id))
      : query(collection(db, 'tasks'));
      
    const unsubTasks = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const visible = data.filter(t => t.status === 'Open' || (t.assigned_to === profile.id && t.status !== 'Completed'));
      visible.sort((a, b) => (b.created_at?.seconds || 0) - (a.created_at?.seconds || 0));
      setTasks(visible);
    });

    const qHist = query(collection(db, 'task_history'), where('user_id', '==', profile.id));
    const unsubHist = onSnapshot(qHist, (snap) => setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    const qLead = query(collection(db, 'profiles'), orderBy('points', 'desc'), limit(10));
    const unsubLead = onSnapshot(qLead, (snap) => setLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubTasks(); unsubHist(); unsubLead(); };
  }, [profile.id, profile.ngo_id]);

  const handleAcceptTask = async (taskId) => {
    setLoading(true);
    try { await updateDoc(doc(db, 'tasks', taskId), { status: 'Accepted', assigned_to: profile.id, assigned_to_name: profile.name, accepted_at: new Date() }); } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await updateDoc(doc(db, 'tasks', selectedTask.id), { status: 'Pending Verification', completion_note: completionData.note, submitted_at: new Date() }); setSelectedTask(null); } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handlePayoutRequest = async (e) => {
    e.preventDefault();
    if (userPoints < payoutData.points) return alert("Insufficient points!");
    setLoading(true);
    try {
      const newPoints = userPoints - payoutData.points;
      await updateDoc(doc(db, 'profiles', profile.id), { points: newPoints });
      await addDoc(collection(db, 'payout_requests'), {
        user_id: profile.id,
        user_name: profile.name,
        upi_id: payoutData.upi_id,
        points_redeemed: payoutData.points,
        amount_inr: (payoutData.points / 10).toFixed(2), // Example: 10 points = 1 INR
        status: 'Pending',
        created_at: new Date(),
        ngo_id: profile.ngo_id || 'Global'
      });
      setUserPoints(newPoints);
      setIsPayoutModalOpen(false);
      alert("Payout request submitted successfully!");
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="h-screen flex bg-[#020617] text-slate-100 overflow-hidden font-sans">
      <aside className="w-20 lg:w-64 border-r border-white/5 flex flex-col bg-black/20 backdrop-blur-3xl z-[1000]">
        <div className="p-6 flex items-center gap-4"><div className="bg-primary-600 p-2.5 rounded-2xl shadow-xl shadow-primary-500/20"><Shield className="w-6 h-6 text-white" /></div><span className="hidden lg:block font-black tracking-tighter uppercase text-sm">Rescue<span className="text-primary-500">Vol</span></span></div>
        <nav className="flex-1 px-4 py-8 space-y-2">
          {[
            { id: 'missions', icon: LayoutGrid, label: 'Operations' },
            { id: 'leaderboard', icon: Trophy, label: 'Leaderboard' },
            { id: 'history', icon: History, label: 'History' },
            { id: 'rewards', icon: ShoppingBag, label: 'Rewards' },
            { id: 'profile', icon: User, label: 'Identity' },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 'text-slate-500 hover:text-white'}`}>
              <item.icon className="w-5 h-5 min-w-[20px]" /><span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-white/5"><button onClick={handleLogout} className="w-full flex items-center gap-4 p-3 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"><LogOut className="w-5 h-5 min-w-[20px]" /><span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">Logout</span></button></div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-black/10 backdrop-blur-md">
          <h2 className="text-xl font-black uppercase tracking-tight">{activeTab}</h2>
          <div className="flex items-center gap-6">
            <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
              <Wallet className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-black text-white">{userPoints} <span className="text-[10px] text-amber-500/60 uppercase">Credits</span></span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'missions' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col lg:flex-row gap-12 h-full">
                <div className="w-full lg:w-[450px] space-y-8">
                  <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5">
                    {[{id: 'nearby', label: 'Nearby', icon: MapPin}, {id: 'all', label: 'Global', icon: Globe}].map(f => (
                      <button key={f.id} onClick={() => setMissionFilter(f.id)} className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${missionFilter === f.id ? 'bg-primary-600 text-white' : 'text-slate-500'}`}><f.icon className="w-3 h-3" /> {f.label}</button>
                    ))}
                  </div>
                  <div className="space-y-6">
                    {tasks.map(task => (
                      <motion.div key={task.id} className={`glass-card p-6 group transition-all ${task.assigned_to === profile.id ? 'border-primary-500 bg-primary-500/5' : ''}`}>
                        <div className="flex justify-between items-start mb-6">
                          <div className="p-3 bg-white/5 rounded-2xl border border-white/10 group-hover:bg-primary-500/10 transition-all"><Zap className={`w-5 h-5 ${task.priority === 'Critical' ? 'text-rose-500 animate-pulse' : 'text-primary-500'}`} /></div>
                          <div className="text-right"><p className="text-lg font-black text-white">+{task.points || 100} <span className="text-[10px] text-slate-500">PTS</span></p></div>
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 leading-tight uppercase group-hover:text-primary-400 transition-colors">{task.title}</h3>
                        <div className="flex items-center gap-2 mb-6">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${task.status === 'Open' ? 'bg-amber-500/20 text-amber-500' : 'bg-primary-500/20 text-primary-500'}`}>{task.status}</span>
                          {task.assigned_to === profile.id && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-500">ASSIGNED TO YOU</span>}
                        </div>
                        <div className="flex items-center justify-between pt-6 border-t border-white/5">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Navigation className="w-3 h-3 text-primary-500" /> {task.location?.name}</span>
                          {task.status === 'Open' ? (
                            <button onClick={() => handleAcceptTask(task.id)} className="px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-black uppercase transition-all">Accept</button>
                          ) : task.assigned_to === profile.id && task.status === 'Accepted' ? (
                            <button onClick={() => setSelectedTask(task)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase transition-all">Report</button>
                          ) : task.status === 'Pending Verification' ? (
                            <span className="text-[9px] font-black text-amber-500 uppercase flex items-center gap-1"><Clock className="w-3 h-3" /> Under Review</span>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 hidden lg:block rounded-3xl overflow-hidden glass-card relative"><MapView tasks={tasks} /></div>
              </motion.div>
            )}

            {activeTab === 'rewards' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  <div className="glass-card p-10 bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border-emerald-500/30 flex items-center justify-between group overflow-hidden relative">
                    <Banknote className="absolute -right-8 -bottom-8 w-40 h-40 text-emerald-500/10 group-hover:scale-125 transition-transform" />
                    <div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">UPI Cash-Out</h3>
                      <p className="text-xs text-emerald-500/60 font-black uppercase tracking-widest mb-6">Min. Threshold: 2000 Credits</p>
                      <button 
                        onClick={() => setIsPayoutModalOpen(true)}
                        disabled={userPoints < MIN_PAYOUT}
                        className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${userPoints >= MIN_PAYOUT ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20' : 'bg-white/5 text-slate-700 cursor-not-allowed'}`}
                      >
                        {userPoints >= MIN_PAYOUT ? 'Initiate Payout' : 'Locked'}
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-black text-white">₹{(userPoints / 10).toFixed(0)}</p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Est. Value</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { title: 'Gold Responder Badge', price: 1000, icon: Award, color: 'amber' },
                    { title: 'Priority Dispatch Token', price: 2500, icon: Zap, color: 'primary' },
                    { title: 'Certified Crisis Lead', price: 5000, icon: Shield, color: 'emerald' },
                  ].map(reward => (
                    <div key={reward.title} className="glass-card p-10 flex flex-col items-center text-center group">
                      <div className={`p-8 bg-${reward.color}-500/10 rounded-full border border-${reward.color}-500/20 mb-8 group-hover:scale-110 transition-transform`}><reward.icon className={`w-12 h-12 text-${reward.color}-500`} /></div>
                      <h4 className="text-xl font-black text-white uppercase mb-4">{reward.title}</h4>
                      <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase text-white hover:bg-primary-600 transition-all">Redeem {reward.price} PTS</button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* LEADERBOARD, HISTORY, PROFILE (UNCHANGED) */}
            {activeTab === 'leaderboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4 mb-12"><Trophy className="w-16 h-16 text-amber-500 mx-auto" /><h3 className="text-4xl font-black uppercase tracking-tight">Top Responders</h3></div>
                <div className="space-y-4">
                  {leaderboard.map((user, i) => (
                    <div key={user.id} className={`glass-card p-6 flex items-center gap-6 ${user.id === profile.id ? 'border-primary-500 bg-primary-500/5' : ''}`}>
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center font-black text-xl text-primary-500">#{i + 1}</div>
                      <div className="flex-1 font-bold text-white uppercase">{user.name}</div>
                      <div className="text-right font-black text-amber-500">{user.points || 0} PTS</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-5xl mx-auto space-y-8">
                <h3 className="text-3xl font-black uppercase tracking-tight mb-12">Mission History</h3>
                {history.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {history.map(item => (
                      <div key={item.id} className="glass-card p-8 flex items-center justify-between border-l-4 border-emerald-500">
                        <div className="flex items-center gap-8">
                          <div className="p-4 bg-emerald-500/10 rounded-2xl"><CheckCircle2 className="w-8 h-8 text-emerald-500" /></div>
                          <div><h4 className="text-xl font-black text-white uppercase">{item.task_title}</h4><p className="text-xs text-slate-500 font-medium mt-1">Verified on {item.created_at?.toDate().toLocaleDateString()}</p></div>
                        </div>
                        <div className="text-right font-black text-emerald-500">+{item.points_earned}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-20 text-center"><History className="w-16 h-16 text-slate-800 mx-auto mb-6" /><p className="text-slate-500 font-bold uppercase tracking-widest">No Verified History</p></div>
                )}
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                <div className="glass-card overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-900 flex items-center justify-center relative"><div className="absolute -bottom-16"><img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} className="w-32 h-32 rounded-[2.5rem] bg-[#020617] border-4 border-[#020617] shadow-2xl" alt="p" /></div></div>
                  <div className="pt-20 pb-12 px-12 text-center space-y-6">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight">{profile.name}</h3>
                    <div className="grid grid-cols-2 gap-4 pt-8">
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl"><p className="text-3xl font-black text-white">{history.length}</p><p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Missions Verified</p></div>
                      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl"><p className="text-3xl font-black text-white">{userPoints}</p><p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Total Impact</p></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* PAYOUT MODAL */}
      <AnimatePresence>
        {isPayoutModalOpen && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPayoutModalOpen(false)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg glass-card overflow-hidden">
              <div className="h-32 bg-emerald-600 p-8 flex flex-col justify-end"><button onClick={() => setIsPayoutModalOpen(false)} className="absolute top-6 right-6 p-2 bg-black/20 rounded-xl"><X className="w-6 h-6" /></button><h3 className="text-xl font-black text-white uppercase">UPI Redemption</h3></div>
              <form onSubmit={handlePayoutRequest} className="p-10 space-y-8">
                <div className="p-4 bg-primary-500/10 border border-primary-500/20 rounded-2xl flex items-center gap-3 text-primary-500 text-[10px] font-black uppercase tracking-widest"><CreditCard className="w-4 h-4" /> 10 Credits = ₹1 INR</div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enter UPI ID</label>
                  <input type="text" value={payoutData.upi_id} onChange={(e) => setPayoutData({...payoutData, upi_id: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500" placeholder="e.g. responder@okaxis" required />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Points to Redeem (Min 2000)</label>
                  <input type="number" min={MIN_PAYOUT} max={userPoints} value={payoutData.points} onChange={(e) => setPayoutData({...payoutData, points: parseInt(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500" required />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send Payout Request</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VERIFICATION MODAL (UNCHANGED) */}
      <AnimatePresence>
        {selectedTask && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTask(null)} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl glass-card overflow-hidden">
              <div className="h-40 bg-primary-600 p-10 flex flex-col justify-end"><button onClick={() => setSelectedTask(null)} className="absolute top-6 right-6 p-2 bg-black/20 rounded-xl"><X className="w-6 h-6" /></button><h3 className="text-2xl font-black text-white uppercase">Mission Verification</h3></div>
              <form onSubmit={handleSubmitVerification} className="p-10 space-y-8">
                <textarea value={completionData.note} onChange={(e) => setCompletionData({note: e.target.value})} className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-bold text-white outline-none focus:border-primary-500" placeholder="Provide details..." required />
                <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white py-6 rounded-3xl font-black text-xs uppercase tracking-widest">Submit Review</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VolunteerDashboard;
