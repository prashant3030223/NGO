import React from 'react';
import { Shield, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = "Synchronizing with Nexus Core..." }) => {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-8">
      <div className="relative">
        <div className="absolute inset-0 bg-primary-500 blur-[80px] opacity-20 animate-pulse" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="relative bg-primary-600 p-6 rounded-[2rem] shadow-2xl shadow-primary-500/40"
        >
          <Shield className="w-16 h-16 text-white" />
        </motion.div>
      </div>
      
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
          <span className="text-sm font-black text-slate-400 uppercase tracking-[0.6em] animate-pulse">{message}</span>
        </div>
        <div className="w-64 h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-full bg-gradient-to-r from-primary-600 to-primary-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
