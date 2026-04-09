import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, X, BarChart3, Camera, Mic, RefreshCw } from "lucide-react";
import SlideView from "./SlideView";
import AITutor from "./AITutor";
import AttentionMonitor from "./AttentionMonitor";
import CameraPreview from "./CameraPreview";
import PremiumButton from "./ui/PremiumButton";
import { useRef } from "react";

export default function LessonPlayer() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const lessonId = id || "2";
  const topic = location.state?.topic || null;
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [attentionScore, setAttentionScore] = useState(1);
  const videoRef = useRef(null);

  const fetchSlides = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const resp = await api.get(`/lessons/${lessonId}/generate`, { 
        params: { topic, force_refresh: forceRefresh || undefined } 
      });
      if (resp.data?.slides) {
        setSlides(resp.data.slides);
        setCurrentIndex(0);
      }
    } catch (err) {
      setError("Failed to generate your personalized lesson.");
    } finally {
      setLoading(false);
    }
  }, [lessonId, topic]);

  const refreshLesson = useCallback(() => fetchSlides(true), [fetchSlides]);

  useEffect(() => { fetchSlides(); }, [fetchSlides]);

  const slide = slides[currentIndex];

  const goNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex, slides.length]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentIndex]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goNext, goPrev]);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6">
       <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full mb-8 shadow-glow" />
       <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Building your lesson...</h2>
       <p className="text-gray-500 font-medium tracking-widest text-xs uppercase">RAG Engine is synthesizing concepts</p>
    </div>
  );

  if (error || !slides.length) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="glass p-12 rounded-3xl text-center max-w-md border-red-500/20">
        <X className="w-16 h-16 text-red-500 mx-auto mb-6" />
        <h3 className="text-2xl font-extrabold text-white mb-4">Lesson Unavailable</h3>
        <p className="text-gray-400 mb-8">{error || "No content found."}</p>
        <PremiumButton fullWidth onClick={() => navigate('/dashboard')}>Back to Dashboard</PremiumButton>
      </div>
    </div>
  );

  const progressPercent = ((currentIndex + 1) / slides.length) * 100;

  return (
    <>
      {/* Global Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-[60]">
        <motion.div 
          animate={{ width: `${progressPercent}%` }} 
          transition={{ duration: 0.4 }}
          className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
        />
      </div>

      {/* Silent Focus Indicator */}
      <div className="fixed top-2 right-2 text-[10px] font-mono text-gray-500 z-[100] tracking-tighter bg-black/20 p-1 rounded-md">
        FOCUS: {attentionScore.toFixed(2)}
      </div>

      {/* Top Nav */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-none h-16 px-6 flex items-center justify-between z-50 sticky top-0"
      >
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors"><X size={20}/></Link>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <h1 className="text-sm font-bold truncate max-w-[200px]">{slide?.title}</h1>
            <p className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold">Slide {currentIndex + 1} / {slides.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <PremiumButton variant="secondary" className="px-3 h-10" onClick={() => setCameraEnabled(!cameraEnabled)} icon={<Camera size={16} className={cameraEnabled ? "text-emerald-400" : "text-gray-500"}/>} />
          <PremiumButton variant="secondary" className="px-3 h-10" onClick={() => setVoiceEnabled(!voiceEnabled)} icon={<Mic size={16} className={voiceEnabled ? "text-emerald-400" : "text-gray-500"}/>} />
          <PremiumButton variant="secondary" className="px-3 h-10" onClick={refreshLesson} icon={<RefreshCw size={16} className="text-gray-500"/>} title="Regenerate lesson" />
          <PremiumButton variant="secondary" className="px-3 h-10" onClick={() => navigate(`/analytics/${lessonId}`)} icon={<BarChart3 size={16}/>} />
        </div>
      </motion.nav>

      {/* Main Content */}
      <div className="min-h-screen pb-40">
        {/* Ambient background glow */}
        <div className="fixed inset-0 pointer-events-none -z-10">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" 
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 60, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -60, scale: 1.02 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="w-full"
            >
              <SlideView slide={slide} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 glass rounded-2xl px-4 py-2 z-40 shadow-2xl">
        <PremiumButton 
          variant="secondary" 
          onClick={goPrev} 
          disabled={currentIndex === 0} 
          icon={<ArrowLeft size={18}/>} 
          className="h-11 w-11 p-0" 
        />
        <div className="px-4 flex flex-col items-center gap-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {currentIndex + 1} of {slides.length}
          </span>
          <div className="w-28 h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.4 }}
              className="h-full bg-emerald-500 rounded-full" 
            />
          </div>
        </div>
        <PremiumButton 
          variant="primary" 
          onClick={goNext} 
          disabled={currentIndex === slides.length - 1}
          icon={<ArrowRight size={18}/>} 
          className="h-11 w-11 p-0" 
        />
      </div>

      {/* AI Tutor */}
      <AITutor 
        slide={slide} 
        voiceEnabled={voiceEnabled} 
        onCommandNext={goNext}
      />

      {/* Camera Preview */}
      <CameraPreview 
        videoRef={videoRef} 
        cameraEnabled={cameraEnabled} 
      />

      {/* Attention Monitor (passive) */}
      <AttentionMonitor 
        lessonId={lessonId} 
        onAttentionChange={setAttentionScore} 
        cameraEnabled={cameraEnabled}
        videoRef={videoRef}
      />
    </>
  );
}
