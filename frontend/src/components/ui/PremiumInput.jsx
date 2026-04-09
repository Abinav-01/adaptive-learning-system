import { motion } from "framer-motion";

export default function PremiumInput({ 
  value, 
  onChange, 
  placeholder, 
  type = "text",
  disabled = false, 
  error = "", 
  className = "",
  onSubmit, 
  icon
}) {
  return (
    <div className={`w-full ${className}`}>
      <motion.div
        className={`
          flex items-center gap-3 bg-white/[0.03] border-2 rounded-2xl p-0.5 transition-all duration-300
          ${error ? 'border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'border-white/5 focus-within:border-emerald-500/40 focus-within:shadow-[0_0_25px_rgba(16,185,129,0.1)]'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        animate={error ? { x: [-4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.4, type: "spring", stiffness: 500 }}
      >
        {icon && (
          <div className={`pl-4 transition-colors duration-300 ${error ? 'text-red-400' : 'text-emerald-400/70 focus-within:text-emerald-400'}`}>
            {icon}
          </div>
        )}
        <input 
          type={type} 
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onKeyDown={(e) => e.key === "Enter" && onSubmit && onSubmit(e)}
          className="flex-1 bg-transparent text-white px-4 py-3.5 outline-none text-base placeholder:text-gray-600 font-medium tracking-wide"
        />
        {onSubmit && (
          <motion.button
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSubmit}
            disabled={disabled}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl m-1 transition-colors shadow-lg shadow-emerald-500/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </motion.button>
        )}
      </motion.div>
      {error && (
        <motion.p 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-xs mt-2 font-semibold pl-3 tracking-tight"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
