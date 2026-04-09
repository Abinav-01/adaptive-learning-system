import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api/axios";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumInput from "../components/ui/PremiumInput";
import { BookOpen, History, Sparkles, GraduationCap, ChevronRight, Layout } from "lucide-react";

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [topicInput, setTopicInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [topicError, setTopicError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, histRes] = await Promise.all([
          api.get("/subjects/"),
          api.get("/users/history").catch(() => ({ data: [] }))
        ]);
        setSubjects(subRes.data);
        setHistory(histRes.data);
      } catch (err) {
        setError("Failed to load curriculum. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTopicSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!topicInput.trim()) {
      setTopicError("Please enter a topic you'd like to learn.");
      return;
    }
    
    setIsSubmitting(true);
    setTopicError("");
    
    try {
      const response = await api.post("/ai/interpret-topic", { query: topicInput });
      const { chapter_id } = response.data;
      navigate(`/lesson/${chapter_id}`, { state: { topic: topicInput } });
    } catch (err) {
      console.error("AI interpretation failed", err);
      setTopicError("Could not understand topic. Loading default lesson...");
      setTimeout(() => navigate('/lesson/chapter_2'), 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-6">
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center p-4 border border-emerald-500/40"
      >
        <GraduationCap className="text-emerald-500 w-full h-full" />
      </motion.div>
      <p className="text-gray-400 font-medium tracking-widest text-sm animate-pulse uppercase">Initializing your classroom...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-7xl mx-auto p-6 md:p-12 pb-32"
    >
      {/* Background Shapes */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Hero Section */}
      <header className="mb-16 text-center max-w-3xl mx-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-white/5 mb-6"
        >
          <Sparkles size={14} className="text-emerald-400" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Advanced Adaptive Learning</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-6 bg-gradient-to-br from-white via-white to-white/40 bg-clip-text text-transparent">
          What do you want to <br className="hidden md:block" /> learn today?
        </h1>
        
        <PremiumInput 
          value={topicInput}
          onChange={(e) => {
             setTopicInput(e.target.value);
             if (topicError) setTopicError("");
          }}
          onSubmit={handleTopicSubmit}
          placeholder="Try: 'polynomials', 'roots', 'factorization'..."
          disabled={isSubmitting}
          error={topicError}
          icon={<Layout size={20} />}
          className="mt-10"
        />
      </header>

      {/* Continue Learning History */}
      {history.length > 0 && (
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8 px-2">
             <h2 className="text-2xl font-bold flex items-center gap-3">
                <History className="text-emerald-500" />
                Continue Learning
             </h2>
             <PremiumButton variant="secondary" className="px-4 py-2 text-xs">View All</PremiumButton>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-6 px-2 snap-x no-scrollbar">
            {history.map((record, idx) => {
               const dateString = new Date(record.last_accessed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
               const displayName = record.topic ? record.topic.charAt(0).toUpperCase() + record.topic.slice(1) : record.chapter_name;
               return (
                <PremiumCard 
                  key={`${record.chapter_id}-${record.topic || 'base'}-${idx}`} 
                  onClick={() => navigate(`/lesson/${record.chapter_id}`, { state: { topic: record.topic } })}
                  className="snap-start shrink-0 w-[300px] border-white/5 hover:border-emerald-500/20"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="h-10 w-10 glass-emerald rounded-lg flex items-center justify-center">
                       <BookOpen size={18} className="text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{dateString}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 truncate">{displayName}</h3>
                  {record.topic && <p className="text-xs text-gray-500 mb-4">{record.chapter_name}</p>}
                  <div className="flex items-center text-xs font-bold text-gray-400 group-hover:text-emerald-400 transition-colors uppercase tracking-widest mt-4">
                     Resume Lesson <ChevronRight size={14} className="ml-1" />
                  </div>
                </PremiumCard>
               );
            })}
          </div>
        </section>
      )}

      {/* Curriculum Grid */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
           <h2 className="text-2xl font-bold flex items-center gap-3">
              <GraduationCap className="text-emerald-500" />
              Your Curriculum
           </h2>
        </div>

        {subjects.length === 0 ? (
          <PremiumCard className="text-center py-20 bg-white/[0.02]">
            <p className="text-gray-500 font-medium">No subjects are currently available.</p>
          </PremiumCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {subjects.map((subject, idx) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx + 0.4 }}
              >
                <PremiumCard 
                  onClick={() => navigate(`/subject/${subject.id}`)}
                  className="h-full border-white/5 hover:border-blue-500/20"
                >
                  <div className="mb-6 h-12 w-12 glass rounded-xl flex items-center justify-center text-emerald-400 font-bold border border-white/10 group-hover:border-emerald-500/30 transition-all">
                    {subject.title.charAt(0)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-emerald-400 transition-colors">{subject.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed line-clamp-3 mb-8">{subject.description}</p>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] group-hover:text-emerald-400 transition-colors">
                     View All Chapters
                     <ChevronRight size={16} />
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
