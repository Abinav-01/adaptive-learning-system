import { motion } from "framer-motion";

export default function VoiceOrb({ state = "idle" }) {
  // idle: small, breathing pulse
  // listening: active pulsing
  // thinking: rotating shimmer
  // speaking: reactive waveform

  const variants = {
    idle: {
      scale: [1, 1.05, 1],
      opacity: [0.6, 0.8, 0.6],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
    },
    listening: {
      scale: [1, 1.2, 1],
      boxShadow: [
        "0 0 20px rgba(16,185,129,0.4)",
        "0 0 50px rgba(16,185,129,0.8)",
        "0 0 20px rgba(16,185,129,0.4)"
      ],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    },
    thinking: {
      rotate: 360,
      scale: 1.1,
      opacity: 0.9,
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    speaking: {
      scale: [1, 1.15, 1.05, 1.2, 1],
      boxShadow: [
        "0 0 10px rgba(16,185,129,0.3)",
        "0 0 40px rgba(16,185,129,0.6)",
        "0 0 10px rgba(16,185,129,0.3)"
      ],
      transition: { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Background Glow */}
      <motion.div
        animate={state}
        variants={variants}
        className="absolute w-16 h-16 rounded-full bg-emerald-500/20 blur-xl"
      />
      
      {/* The Core Orb */}
      <motion.div
        animate={state}
        variants={variants}
        className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] border-2 border-emerald-300/30 flex items-center justify-center overflow-hidden"
      >
        {state === "thinking" && (
          <div className="absolute inset-0 bg-white/10 animate-[shimmer_1.5s_infinite]" />
        )}
        
        {/* State Icon / Indicator */}
        <div className="z-10 bg-white/10 rounded-full p-2">
           {state === "listening" ? (
             <div className="flex gap-1">
               <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white rounded-full" />
               <motion.div animate={{ height: [6, 16, 6] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-white rounded-full" />
               <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-white rounded-full" />
             </div>
           ) : state === "speaking" ? (
             <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
             </svg>
           ) : state === "thinking" ? (
              <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
           ) : (
             <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
           )}
        </div>
      </motion.div>
      
      {/* Label (Optional) */}
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute -bottom-8 text-[10px] uppercase tracking-widest font-bold text-emerald-400 drop-shadow-sm whitespace-nowrap"
      >
        {state.toUpperCase()}
      </motion.span>
    </div>
  );
}
