import { useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export default function CameraPreview({ videoRef, cameraEnabled }) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!cameraEnabled) return null;

  return (
    <div className={`
      fixed bottom-4 right-4 
      ${isMinimized ? 'w-12 h-12 rounded-full' : 'w-40 h-28 md:w-56 md:h-36 rounded-xl'} 
      bg-[#0a0a0a] 
      shadow-2xl 
      border border-gray-800 
      z-[1000]
      overflow-hidden 
      transition-all duration-300 ease-in-out
      group
    `}>
      {/* Header Overlay */}
      {!isMinimized && (
        <div className="absolute top-0 left-0 right-0 h-7 bg-black/40 flex items-center justify-between px-2 z-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">Live</span>
          </div>
          <button 
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white"
          >
            <Minimize2 size={12} />
          </button>
        </div>
      )}

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`
          w-full h-full object-cover 
          ${isMinimized ? 'opacity-0' : 'opacity-100'}
          transform scale-x-[-1]
          transition-opacity duration-300
        `}
      />

      {/* Minimized Placeholder/Toggle */}
      {isMinimized && (
        <button 
          onClick={() => setIsMinimized(false)}
          className="w-full h-full flex items-center justify-center bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 transition-colors"
        >
          <Maximize2 size={16} />
        </button>
      )}

      {/* Subtle Bottom Label */}
      {!isMinimized && (
        <div className="absolute bottom-2 left-2 pointer-events-none">
          <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest bg-black/20 px-1.5 py-0.5 rounded">You</span>
        </div>
      )}
    </div>
  );
}
