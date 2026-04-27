import React from 'react';
import { 
  AlertCircle, MapPin, Clock, ArrowRight, ShieldAlert, 
  Droplet, HeartPulse, Home, Truck, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const typeIcons = {
  food: { icon: Droplet, color: 'emerald', label: 'Rations' },
  medical: { icon: HeartPulse, color: 'rose', label: 'Critical Med' },
  shelter: { icon: Home, color: 'amber', label: 'Tactical Shelter' },
  logistics: { icon: Truck, color: 'primary', label: 'Supply Chain' },
  default: { icon: AlertCircle, color: 'slate', label: 'Field Intel' }
};

const NeedCard = ({ need }) => {
  const info = typeIcons[need.type?.toLowerCase()] || typeIcons.default;
  const isUrgent = need.urgencyScore > 80;

  return (
    <motion.div
      whileHover={{ scale: 1.02, x: 5 }}
      className={`relative group bg-white/[0.03] border border-white/5 rounded-2xl p-5 hover:bg-white/[0.06] transition-all cursor-pointer overflow-hidden ${isUrgent ? 'border-l-4 border-l-rose-500' : ''}`}
    >
      {/* Background Accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-${info.color}-500/5 blur-2xl group-hover:bg-${info.color}-500/10 transition-colors`} />
      
      <div className="relative z-10 flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 bg-${info.color}-500/10 rounded-xl border border-${info.color}-500/20 group-hover:scale-110 transition-transform`}>
              <info.icon className={`w-4 h-4 text-${info.color}-400`} />
            </div>
            <div>
              <p className={`text-[10px] font-black text-${info.color}-500 uppercase tracking-[0.2em] mb-0.5`}>{info.label}</p>
              <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-primary-400 transition-colors">{need.location.name}</h3>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-black font-display leading-none ${isUrgent ? 'text-rose-500' : 'text-slate-400'}`}>
              {need.urgencyScore}<span className="text-[10px] opacity-40 ml-0.5">%</span>
            </div>
            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">PRIORITY LEVEL</p>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-medium line-clamp-2 italic">
          "{need.summary}"
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <MapPin className="w-3 h-3" /> {need.location.lat.toFixed(2)}, {need.location.lng.toFixed(2)}
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-black text-primary-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
            Analyze <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NeedCard;
