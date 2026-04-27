import React, { useState } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { Building2, MapPin, Phone, Briefcase, ArrowRight, Loader2, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NGORegistration = ({ profile }) => {
  const [formData, setFormData] = useState({
    name: '',
    location_name: '',
    phone: 'N/A',
    type: 'Disaster',
    description: 'Relief Organization'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('🚀 Initiating NGO Registration for profile:', profile?.id);

    if (!profile?.id) {
      setError("CRITICAL ERROR: User Identity Missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create NGO record in Firestore
      console.log('📂 Creating NGO record...');
      const ngoRef = await addDoc(collection(db, 'ngos'), {
        name: formData.name,
        location: { name: formData.location_name, lat: 28.6139, lng: 77.2090 },
        phone: formData.phone,
        type: formData.type,
        verified: false,
        created_at: new Date()
      });
      console.log('✅ NGO record created with ID:', ngoRef.id);

      // 2. Link NGO to Profile
      console.log('🔗 Linking NGO to profile:', profile.id);
      await updateDoc(doc(db, 'profiles', profile.id), {
        ngo_id: ngoRef.id,
        role: 'NGO_ADMIN' // Ensure role is set
      });
      console.log('✨ Profile updated successfully');

    } catch (err) {
      console.error('❌ Registration Failed:', err);
      if (err.code === 'permission-denied') {
        setError("SECURITY DENIED: Please update your Firestore Rules to allow creating NGOs.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 via-transparent to-transparent z-0" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-2xl glass-card p-12 relative z-10"
      >
        <div className="flex items-center gap-6 mb-12">
          <div className="bg-primary-600 p-4 rounded-3xl shadow-2xl shadow-primary-500/20">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-black tracking-tight text-white uppercase">NGO Initialization</h2>
            <p className="text-slate-500 font-medium">Link your organization to the relief network.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Organization Name</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-800" 
                placeholder="e.g. Stark Industries"
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Base of Operations</label>
              <input 
                type="text" 
                value={formData.location_name} 
                onChange={(e) => setFormData({...formData, location_name: e.target.value})} 
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-800" 
                placeholder="e.g. New York / Delhi"
                required 
              />
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4" /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-primary-600 hover:bg-primary-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-4 group shadow-2xl shadow-primary-500/20"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finalize Integration <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
          </button>
        </form>

      </motion.div>
    </div>
  );
};

export default NGORegistration;
