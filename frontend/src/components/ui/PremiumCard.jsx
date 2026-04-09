import { motion } from "framer-motion";

export default function PremiumCard({ children, className = "", hover = true, onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -5, scale: 1.01, borderColor: "rgba(16, 185, 129, 0.3)" } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      className={`glass rounded-2xl p-6 transition-all duration-300 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Decorative Glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
      
      {children}
    </motion.div>
  );
}
