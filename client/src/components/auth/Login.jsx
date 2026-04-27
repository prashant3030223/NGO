import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Shield, Mail, Lock, Globe, ArrowRight, Loader2, Code as CodeIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [searchParams] = useSearchParams();
  const inviteNGO = searchParams.get('invite');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegistering) {
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, 'profiles', user.uid), {
          name: email.split('@')[0],
          email: user.email,
          role: inviteNGO ? 'VOLUNTEER' : 'NGO_ADMIN', // If not invited, they ARE an NGO Admin
          ngo_id: inviteNGO || null,
          points: 0,
          created_at: new Date()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) { setError(err.message); }
    setLoading(false);
  };

  const handleSocialLogin = async (providerName) => {
    const provider = providerName === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      const { user } = await signInWithPopup(auth, provider);
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        // Force NGO_ADMIN role for new social users who aren't using an invite link
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          role: inviteNGO ? 'VOLUNTEER' : 'NGO_ADMIN',
          ngo_id: inviteNGO || null,
          points: 0,
          created_at: new Date()
        });
      }
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#020617] overflow-hidden">
      {/* Left Branding Side */}
      <div className="lg:w-1/2 relative p-12 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-transparent to-transparent z-0" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-primary-600 p-3 rounded-2xl shadow-2xl shadow-primary-500/20"><Shield className="w-8 h-8 text-white" /></div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">RescueMatch <span className="text-primary-500">AI</span></h1>
        </div>
        <div className="relative z-10 max-w-lg">
          {inviteNGO && (
            <div className="mb-6 inline-flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-[10px] font-black uppercase tracking-widest">
              <CodeIcon className="w-3 h-3" /> Exclusive Invite Link Active
            </div>
          )}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-6xl font-black tracking-tighter leading-[0.9] mb-8 uppercase">
              {inviteNGO ? 'VOLUNTEER' : 'NGO'} <br /> <span className="text-primary-500">COMMAND</span> <br /> CENTER.
            </h2>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              {inviteNGO ? 'Join your organization and start responding to missions.' : 'Deploy your NGO to the world\'s most advanced coordination grid.'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Login Form Side */}
      <div className="lg:w-1/2 bg-white/[0.02] border-l border-white/5 backdrop-blur-3xl p-12 flex flex-col justify-center items-center">
        <div className="w-full max-w-md space-y-10">
          <div>
            <h3 className="text-3xl font-black tracking-tight text-white mb-2">
              {inviteNGO ? 'VOLUNTEER SIGNUP' : (isRegistering ? 'NGO INITIALIZATION' : 'ACCESS TERMINAL')}
            </h3>
            <p className="text-slate-500 font-medium">
              {inviteNGO ? 'Joining organization via secure invite.' : 'Authentication via your provided Firebase configuration.'}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Email Identifier</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-500 transition-colors" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-800" placeholder="name@email.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Passkey</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-primary-500 transition-colors" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-800" placeholder="••••••••" required />
              </div>
            </div>

            {error && <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-bold"><Shield className="w-4 h-4" /> {error}</div>}

            <button type="submit" disabled={loading} className="w-full bg-white hover:bg-slate-100 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-3 group">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isRegistering || inviteNGO ? (inviteNGO ? 'Join as Volunteer' : 'Register as NGO') : 'Sign In'} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-[#020617] px-4 text-slate-600">Secondary Protocols</span></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"><Globe className="w-4 h-4" /> Google</button>
            <button onClick={() => handleSocialLogin('github')} className="flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"><CodeIcon className="w-4 h-4" /> GitHub</button>
          </div>

          {!inviteNGO && (
            <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              {isRegistering ? 'Already have an account?' : "Don't have an account?"} 
              <span onClick={() => setIsRegistering(!isRegistering)} className="text-primary-500 cursor-pointer hover:underline ml-2">
                {isRegistering ? 'Login' : 'Register as NGO Admin'}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
