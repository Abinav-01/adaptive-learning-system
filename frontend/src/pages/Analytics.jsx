import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import api from "../api/axios";
import { 
  Area, 
  AreaChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ArrowLeft, Target, Activity, Clock, AlertTriangle, Play } from "lucide-react";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";

const MetricCard = ({ title, value, subtitle, icon, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <PremiumCard className="h-full border-white/5">
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 glass-emerald rounded-xl text-emerald-400">
          {icon}
        </div>
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>
      <h3 className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-2">{title}</h3>
      <div className="text-4xl font-black text-white mb-2">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
    </PremiumCard>
  </motion.div>
);

export default function Analytics() {
  const { lesson_id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/analytics/lesson/${lesson_id}`);
        const formattedTimeline = res.data.timeline.map((point) => {
          let timeLabel = "00:00";
          if (point.timestamp) {
            const dateObj = new Date(point.timestamp);
            timeLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          }
          return { time: timeLabel, score: point.score };
        });

        setData({ ...res.data, timeline: formattedTimeline });
      } catch (err) {
        setError("Failed to load analytics data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [lesson_id]);

  if (loading) return (
    <div className="min-h-screen flex flex-col justify-center items-center gap-6">
      <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-glow" />
      <p className="text-gray-500 font-bold tracking-widest text-xs uppercase animate-pulse">Processing engagement metrics...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center p-6">
       <PremiumCard className="max-w-md text-center border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Analytics Error</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <PremiumButton onClick={() => window.location.reload()}>Retry</PremiumButton>
       </PremiumCard>
    </div>
  );

  if (!data) return null;

  const formatDuration = (s) => (s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`);
  const avgAttention = (data.average_attention_score * 100).toFixed(0);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-6 md:p-12 pb-32"
    >
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <Link to="/dashboard" className="inline-flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-bold text-xs uppercase tracking-widest mb-6 transition-all group">
             <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Learning Hub
           </Link>
           <h1 className="text-5xl font-black tracking-tight text-white mb-2">Engagement Report</h1>
           <p className="text-gray-500 font-medium">Session analysis for <span className="text-white">Chapter {lesson_id}</span></p>
        </div>
        <PremiumButton icon={<Play size={16}/>} onClick={() => navigate(`/lesson/${lesson_id}`)}>Resume Lesson</PremiumButton>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <MetricCard 
          title="Average Focus" 
          value={`${avgAttention}%`} 
          subtitle="Biometric attention score"
          delay={0.1}
          icon={<Target size={24} />}
        />
        <MetricCard 
          title="Data Points" 
          value={data.total_logs} 
          subtitle="Total telemetry records"
          delay={0.2}
          icon={<Activity size={24} />}
        />
        <MetricCard 
          title="Attention Gaps" 
          value={data.focus_loss_count} 
          subtitle="Instances of focus drift"
          delay={0.3}
          icon={<AlertTriangle size={24} />}
        />
        <MetricCard 
          title="Engaged Time" 
          value={formatDuration(data.session_duration)} 
          subtitle="Total session length"
          delay={0.4}
          icon={<Clock size={24} />}
        />
      </div>

      {/* Visual Timeline Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <PremiumCard className="p-8 md:p-10 border-white/5 overflow-visible">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-2xl font-bold text-white">Attention Timeline</h2>
              <p className="text-gray-500 text-sm mt-1">Real-time biometric fluctuation across the session</p>
            </div>
            <div className="px-4 py-2 glass rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Live Telemetry
            </div>
          </div>

          <div className="h-[450px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.timeline} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#444" 
                  tick={{fill: '#666', fontSize: 10, fontWeight: 700}} 
                  tickMargin={15}
                  axisLine={false}
                />
                <YAxis 
                  domain={[0, 1]} 
                  stroke="#444" 
                  tick={{fill: '#666', fontSize: 10, fontWeight: 700}}
                  tickFormatter={(val) => `${val * 100}%`}
                  axisLine={false}
                  tickMargin={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(10, 10, 10, 0.9)', 
                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                    borderRadius: '16px', 
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                  }}
                  itemStyle={{ color: '#10b981', fontWeight: 800 }}
                  labelStyle={{ color: '#888', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#10b981" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                  activeDot={{ r: 8, fill: "#10b981", stroke: "#0a0a0a", strokeWidth: 3 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </motion.div>
    </motion.div>
  );
}
