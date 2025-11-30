import React from 'react';
import { motion } from 'framer-motion';
import { Smile, Frown, CloudRain, Zap, Calendar, Clock, Flame, Sun, BatteryCharging, Heart, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useWeb3 } from '@/hooks/use-web3';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

const EMOTION_CONFIG: any = {
  happy: { icon: Smile, color: 'bg-accent text-black', label: 'Happy' },
  excited: { icon: Flame, color: 'bg-orange-400 text-black', label: 'Excited' },
  grateful: { icon: Heart, color: 'bg-pink-400 text-white', label: 'Grateful' },
  calm: { icon: Sun, color: 'bg-yellow-200 text-yellow-800', label: 'Calm' },
  tired: { icon: BatteryCharging, color: 'bg-slate-300 text-slate-600', label: 'Tired' },
  anxious: { icon: Zap, color: 'bg-primary text-white', label: 'Anxious' },
  sad: { icon: CloudRain, color: 'bg-secondary text-white', label: 'Sad' },
  angry: { icon: Frown, color: 'bg-destructive text-white', label: 'Frustrated' },
};

export default function HistoryPage() {
  const { history, isConnected } = useWeb3();

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-slate-100 p-8 rounded-full border-4 border-slate-200">
          <AlertCircle className="w-16 h-16 text-slate-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black font-heading uppercase">Wallet Not Connected</h2>
          <p className="text-slate-500 font-bold mt-2">Connect your wallet to view your mood history.</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="bg-slate-100 p-8 rounded-full border-4 border-slate-200">
          <Calendar className="w-16 h-16 text-slate-400" />
        </div>
        <div>
          <h2 className="text-3xl font-black font-heading uppercase">No History Yet</h2>
          <p className="text-slate-500 font-bold mt-2">Start logging your emotions to see your timeline.</p>
        </div>
        <Link href="/">
          <Button className="btn-flat bg-black text-white font-bold px-8 py-6">
            Log First Mood
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="border-b-2 border-black pb-6">
        <h1 className="text-5xl font-heading font-black text-black uppercase tracking-tighter">Mood History</h1>
        <p className="text-xl font-bold text-slate-500 mt-2">Your emotional journey on-chain.</p>
      </div>

      <div className="relative border-l-4 border-black ml-4 md:ml-8 pl-8 md:pl-12 py-4 space-y-12">
        {history.map((entry, idx) => {
          const config = EMOTION_CONFIG[entry.emotion] || EMOTION_CONFIG['happy'];
          const Icon = config.icon;

          return (
            <motion.div
              key={entry.timestamp}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {/* Timeline Node */}
              <div className={`
                absolute -left-[3.25rem] md:-left-[4.25rem] top-0 w-10 h-10 md:w-12 md:h-12 rounded-full border-4 border-black flex items-center justify-center z-10
                ${config.color}
              `}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>

              {/* Card */}
              <div className="bg-white border-2 border-black p-6 rounded-xl shadow-flat relative group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-md border border-black text-xs font-black uppercase ${config.color}`}>
                      {config.label}
                    </span>
                    <span className="text-sm font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(entry.timestamp, 'h:mm a')}
                    </span>
                  </div>
                  <div className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(entry.timestamp, 'MMMM d, yyyy')}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                   <div className="flex-1">
                     <p className="font-bold text-lg text-black mb-2">"{entry.notes}"</p>
                     <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1">
                         <span className="text-xs font-black uppercase text-slate-400">Intensity</span>
                         <div className="flex gap-0.5">
                           {[...Array(10)].map((_, i) => (
                             <div 
                               key={i} 
                               className={`w-1.5 h-3 rounded-sm ${i < entry.intensity ? 'bg-black' : 'bg-slate-200'}`}
                             />
                           ))}
                         </div>
                       </div>
                       <div className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-black border border-green-800">
                         +{entry.earned} FEELS
                       </div>
                     </div>
                   </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
