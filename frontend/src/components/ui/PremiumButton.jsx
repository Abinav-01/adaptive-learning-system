import { motion } from "framer-motion";

export default function PremiumButton({ 
  children, 
  onClick, 
  variant = "primary", 
  className = "", 
  disabled = false,
  fullWidth = false,
  icon
}) {
  const variants = {
    primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]",
    secondary: "bg-white/10 hover:bg-white/20 text-white border border-white/10",
    outline: "bg-transparent border border-white/20 hover:border-emerald-500/50 text-white",
    danger: "bg-red-500/80 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.2)]"
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </motion.button>
  );
}
