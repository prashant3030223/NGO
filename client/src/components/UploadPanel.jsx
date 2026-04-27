import React, { useState } from 'react';
import axios from 'axios';
import { 
  Upload, FileText, Image as ImageIcon, Send, Loader2, 
  CheckCircle, ShieldAlert, Cpu, Database, Info, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPanel = ({ onComplete }) => {
  const [file, setFile] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file && !textInput) return;
    setUploading(true);
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (textInput) formData.append('textInput', textInput);
    try {
      const res = await axios.post('http://localhost:5002/api/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data.analysis);
      setTimeout(() => { onComplete(); }, 4000);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-3xl glass-card p-10 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Cpu className="w-40 h-40" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-primary-500/10 rounded-2xl border border-primary-500/20">
            <Database className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black font-display text-white tracking-tight">Upload Center</h2>
            <p className="text-slate-500 text-sm font-medium">Add new reports from the field to start matching.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-12 hover:border-primary-500/50 hover:bg-primary-500/5 transition-all cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Upload className="w-12 h-12 text-slate-600 group-hover:text-primary-400 mb-4 transition-transform group-hover:-translate-y-1" />
              <span className="text-sm font-bold text-slate-300 tracking-wide uppercase">File Upload</span>
              <span className="text-[10px] text-slate-600 mt-2 font-black tracking-widest uppercase">PDF • JPG • PNG</span>
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              
              {file && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-6 flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-xl text-xs font-black shadow-lg"
                >
                  <FileText className="w-3 h-3" />
                  {file.name.substring(0, 15)}...
                  <X className="w-3 h-3 ml-2 cursor-pointer hover:scale-125 transition-transform" onClick={(e) => { e.preventDefault(); setFile(null); }} />
                </motion.div>
              )}
            </label>
            <div className="flex items-center gap-2 px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <Info className="w-4 h-4 text-primary-500" />
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">AI will read and understand your file.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <textarea 
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="OR TYPE YOUR REPORT HERE..."
                className="w-full h-full min-h-[200px] bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-sm font-medium focus:border-primary-500 focus:bg-white/[0.05] outline-none transition-all resize-none placeholder:text-slate-700 placeholder:font-black placeholder:tracking-widest"
              />
              <div className="absolute top-4 right-4 pointer-events-none">
                <Send className="w-4 h-4 text-slate-800" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <button 
            onClick={handleUpload}
            disabled={uploading || (!file && !textInput)}
            className="w-full relative group overflow-hidden bg-white hover:bg-slate-100 disabled:bg-slate-900 disabled:text-slate-700 text-black py-5 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-4 shadow-2xl shadow-white/5"
          >
            {uploading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing data...</>
            ) : result ? (
              <><CheckCircle className="w-5 h-5 text-emerald-600" /> Data Extracted</>
            ) : (
              <><Send className="w-5 h-5" /> Upload Report</>
            )}
          </button>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-8 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <ShieldAlert className="w-12 h-12 text-emerald-500" />
              </div>
              <h4 className="text-emerald-400 font-black text-[10px] tracking-widest uppercase mb-2">AI Results</h4>
              <p className="text-slate-200 text-sm font-medium leading-relaxed mb-4">{result.summary}</p>
              <div className="flex gap-6">
                <div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Category</div>
                  <div className="text-xs font-bold text-white uppercase">{result.type}</div>
                </div>
                <div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Urgency</div>
                  <div className="text-xs font-bold text-emerald-400">{result.urgencyScore}% CRITICAL</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default UploadPanel;
