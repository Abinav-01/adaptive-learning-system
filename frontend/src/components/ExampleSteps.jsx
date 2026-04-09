import { motion, AnimatePresence } from "framer-motion";
import FormulaView from "./FormulaView";

export default function ExampleSteps({ steps, currentStepIndex, offset = 0 }) {
  if (!steps || !Array.isArray(steps)) return null;

  return (
    <div className="mt-12 space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/20" />
        <h3 className="text-emerald-400 font-black tracking-[0.2em] uppercase text-xs flex items-center gap-3">
          <span className="bg-emerald-500/10 p-2 rounded-xl">🎓</span>
          Guided Walkthrough
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/20" />
      </div>
      
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {steps.map((step, index) => {
            const isVisible = currentStepIndex >= (offset + index);
            const isLatest = currentStepIndex === (offset + index);
            
            if (!isVisible) return null;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  scale: isLatest ? 1.02 : 1,
                  borderColor: isLatest ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.05)"
                }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
                className={`p-6 rounded-2xl border bg-[#111]/50 backdrop-blur-sm shadow-xl transition-all duration-500 ${isLatest ? 'shadow-emerald-500/5' : ''}`}
              >
                <div className="flex items-start gap-6">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-colors duration-500 ${isLatest ? 'bg-emerald-500 text-white shadow-glow' : 'bg-white/5 text-gray-400 border border-white/5'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-base font-bold mb-2 transition-colors duration-500 ${isLatest ? 'text-white' : 'text-gray-400'}`}>
                      {step.step_title || `Analysis Phase ${index + 1}`}
                    </h4>
                    <p className={`text-sm leading-relaxed mb-4 transition-colors duration-500 ${isLatest ? 'text-gray-300' : 'text-gray-500'}`}>
                      {step.step || step.explanation}
                    </p>
                    
                    {step.formula && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/40 rounded-xl p-4 inline-block border border-white/5"
                      >
                        <FormulaView formula={step.formula} isVisible={true} isInline={true} />
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
