import React from 'react';
import { UserCheck, ArrowRight, Zap, CheckCircle2, ShieldCheck, Activity, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssignmentPanel = ({ assignments, needs }) => {
  if (assignments.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-primary-500 blur-2xl opacity-10 animate-pulse" />
          <div className="relative p-6 bg-white/5 rounded-3xl border border-white/5">
            <Cpu className="w-10 h-10 opacity-20" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xs font-black uppercase tracking-[0.4em] opacity-30 italic">Orchestrator Idle</p>
          <p className="text-[10px] uppercase tracking-widest opacity-20 font-medium">WAITING FOR COMMAND TO SYNCHRONIZE RESPONSE NODES...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto pr-4 custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence>
          {assignments.map((asgn, idx) => {
            const need = needs.find(n => n.id === asgn.needId);
            return (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-card p-5 relative group border-white/10 hover:border-primary-500/30 transition-all bg-gradient-to-br from-white/[0.05] to-transparent overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary-500/5 blur-2xl group-hover:bg-primary-500/10 transition-colors" />
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-primary-500/20 p-2.5 rounded-xl text-primary-400 border border-primary-500/20 shadow-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-black text-white uppercase tracking-wider">{asgn.volunteerName}</p>
                      <p className="text-[9px] text-primary-500 font-black uppercase tracking-widest mt-0.5">{need?.type || 'RESPONDER'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-px h-8 bg-gradient-to-b from-primary-500 to-transparent" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Match Strength</span>
                        <span className="text-[10px] text-primary-400 font-black tracking-tighter">{Math.round(asgn.matchScore)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${asgn.matchScore}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="h-full bg-gradient-to-r from-primary-600 via-primary-400 to-white" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Activity className="w-3 h-3 text-emerald-500" /> ACTIVE LINK
                    </div>
                    <div className="text-[10px] font-black text-white uppercase italic tracking-tighter opacity-60">
                      → {need?.location.name || 'Nexus'}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AssignmentPanel;
