import React, { useState } from 'react';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { User, Mail, Shield, Camera, Save, CheckCircle, Globe, Building, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePanel = ({ user }) => {
  const [displayName, setDisplayName] = useState(user.displayName || '');
  const [photoURL, setPhotoURL] = useState(user.photoURL || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await updateProfile(auth.currentUser, { displayName, photoURL });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentAvatar = photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl p-8"
    >
      <div className="flex items-center gap-6 mb-12">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative w-32 h-32 rounded-3xl overflow-hidden border-2 border-white/10 p-1 bg-[#020617]">
            <img 
              src={currentAvatar} 
              className="w-full h-full rounded-2xl object-cover" 
              alt="Profile" 
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-4xl font-black font-display text-white tracking-tight uppercase">{displayName || 'Field Operator'}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-[10px] font-black text-primary-400 uppercase tracking-widest">Master Admin</span>
            <span className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1">
              <Globe className="w-3 h-3" /> Sector 7-G Node
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-8 space-y-8 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-5 h-5 text-primary-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Identity Parameters</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all"
                placeholder="OPERATOR NAME"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Profile Matrix (URL)</label>
              <input 
                type="text" 
                value={photoURL}
                onChange={(e) => setPhotoURL(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all"
                placeholder="AVATAR_ENDPOINT_URL"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-8 space-y-8 bg-white/[0.02]">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-emerald-500" />
            <h3 className="text-sm font-black uppercase tracking-widest text-white">NGO Credentials</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Assigned Email</label>
              <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-500 flex items-center gap-3">
                <Mail className="w-4 h-4" /> {user.email}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Organization Nexus</label>
              <div className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-sm font-bold text-slate-500 flex items-center gap-3">
                <Building className="w-4 h-4" /> RescueMatch Global NGO
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 flex justify-end">
        <button 
          onClick={handleUpdate}
          disabled={isUpdating}
          className="bg-white text-black font-black px-12 py-5 rounded-3xl flex items-center gap-4 hover:bg-primary-500 hover:text-white transition-all shadow-2xl active:scale-95 disabled:bg-slate-800 disabled:text-slate-600 group"
        >
          {isUpdating ? <Activity className="w-5 h-5 animate-spin" /> : saved ? <CheckCircle className="w-5 h-5" /> : <Save className="w-5 h-5 group-hover:scale-125 transition-transform" />}
          <span className="uppercase tracking-[0.2em] text-xs">{saved ? 'Protocol Synchronized' : 'Commit Changes'}</span>
        </button>
      </div>
    </motion.div>
  );
};

export default ProfilePanel;
