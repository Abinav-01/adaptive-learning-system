import { motion, AnimatePresence } from "framer-motion";
import katex from "katex";
import "katex/dist/katex.min.css";

export default function FormulaView({ formula, isVisible, isInline = false }) {
  const renderFormula = () => {
    if (!formula) return null;
    
    try {
      return (
        <span 
          dangerouslySetInnerHTML={{ 
            __html: katex.renderToString(formula, { 
              throwOnError: true, // Let it throw so we catch and fallback
              displayMode: !isInline 
            }) 
          }} 
        />
      );
    } catch (err) {
      console.warn("KaTeX render failed:", err, formula);
      // Fallback: Show the raw formula text without formatting artifacts
      return (
        <span className={`${isInline ? '' : 'block py-2'} font-mono text-emerald-300/80 break-all`}>
          {formula}
        </span>
      );
    }
  };

  if (isInline) return renderFormula();

  return (
    <AnimatePresence>
      {isVisible && formula && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotateX: -10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          transition={{ 
            duration: 0.8, 
            type: "spring", 
            bounce: 0.45 
          }}
          className="relative group"
        >
          {/* Decorative Corner Accents */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg" />

          <div className="slide-formula bg-[#111] border border-emerald-500/30 shadow-[0_20px_50px_rgba(16,185,129,0.1)] p-10 rounded-2xl flex flex-col justify-center items-center my-8 transition-all hover:border-emerald-500/50 group-hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)]">
            <div className="text-[10px] font-black text-emerald-500/60 uppercase tracking-[0.3em] mb-6">Mathematical Foundation</div>
            <div className="text-3xl md:text-4xl text-white">
              {renderFormula()}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
