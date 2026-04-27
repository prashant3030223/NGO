import React, { useState } from 'react';
import { auth, googleProvider, githubProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { Shield, Mail, Lock, Users, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('ngo@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError('Google Sign-In failed.');
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithPopup(auth, githubProvider);
    } catch (err) {
      console.error(err);
      setError('GitHub Sign-In failed.');
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error(err);
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
      <div className="w-full md:w-[45%] bg-[#1d4ed8] p-12 md:p-20 flex flex-col justify-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-primary-400 rounded-full blur-3xl" />
        </div>

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="relative z-10 space-y-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20">
              <Shield className="w-10 h-10 text-white fill-white/10" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight font-display text-white">VolunteerAI</h1>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-medium text-white/90">AI-Powered Volunteer Coordination System</p>
          </div>
          <div className="space-y-8 pt-8">
            <div className="flex items-center gap-5 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors"><Users className="w-6 h-6" /></div>
              <p className="text-lg font-medium">Smart volunteer matching based on skills & location</p>
            </div>
            <div className="flex items-center gap-5 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors"><Activity className="w-6 h-6" /></div>
              <p className="text-lg font-medium">Real-time need tracking and prioritization</p>
            </div>
            <div className="flex items-center gap-5 group">
              <div className="p-2 bg-white/10 rounded-lg group-hover:bg-white/20 transition-colors"><BarChart3 className="w-6 h-6" /></div>
              <p className="text-lg font-medium">Data-driven impact analytics</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 md:p-20 bg-white">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-10">
          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 font-display">Welcome back</h2>
            <p className="text-slate-500 font-medium">Sign in to your account to continue</p>
          </div>

          {error && <p className="text-rose-500 text-sm font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</p>}

          <form onSubmit={handleEmailLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 font-medium shadow-sm" placeholder="ngo@example.com" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 font-medium shadow-sm" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
              </label>
              <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-200 active:scale-[0.98] transition-all transform">Sign In</button>
          </form>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <span className="relative px-6 bg-white text-slate-400 text-sm font-bold uppercase tracking-widest">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={handleGoogleLogin} className="flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              <span>Google</span>
            </button>
            <button onClick={handleGithubLogin} className="flex items-center justify-center gap-3 bg-white border border-slate-200 py-3.5 rounded-xl hover:bg-slate-50 transition-all font-bold text-slate-700 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.041-1.416-4.041-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span>GitHub</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
