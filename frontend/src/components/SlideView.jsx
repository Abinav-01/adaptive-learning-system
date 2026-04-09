import { motion, AnimatePresence } from "framer-motion";
import BulletList from "./BulletList";
import FormulaView from "./FormulaView";
import ExampleSteps from "./ExampleSteps";
import TypewriterText from "./TypewriterText";

export default function SlideView({ slide }) {
  if (!slide) return null;
  
  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <PremiumStage>
        <div className="flex flex-col gap-10">
          {/* Title */}
          <motion.h2 
            key={slide.title}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight"
          >
            {slide.title}
          </motion.h2>

          {/* All Bullets - shown immediately */}
          {Array.isArray(slide.bullets) && slide.bullets.length > 0 && (
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } }}
              className="space-y-4"
            >
              {slide.bullets.map((bullet, idx) => (
                <motion.li
                  key={idx}
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0, transition: { duration: 0.4 } } }}
                  className="text-lg text-gray-200 flex items-start group"
                >
                  <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-4 mt-1 border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                  </div>
                  <span className="flex-1 leading-relaxed">{bullet}</span>
                </motion.li>
              ))}
            </motion.ul>
          )}

          {/* Formula */}
          {slide.formula && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
              <FormulaView formula={slide.formula} isVisible={true} />
            </motion.div>
          )}

          {/* Example Steps */}
          {Array.isArray(slide.example_steps) && slide.example_steps.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Step-by-Step Example</div>
              <ol className="space-y-3">
                {slide.example_steps.map((step, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-4 text-gray-300"
                  >
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-xs font-black text-emerald-400">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed pt-0.5">{step}</span>
                  </motion.li>
                ))}
              </ol>
            </motion.div>
          )}

          {/* Practice Questions */}
          {Array.isArray(slide.practice_questions) && slide.practice_questions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
              <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">Practice Questions</div>
              <ul className="space-y-3">
                {slide.practice_questions.map((q, idx) => (
                  <li key={idx} className="text-gray-400 text-sm flex gap-3">
                    <span className="text-blue-400 font-bold">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* AI Narration */}
          {slide.narration && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/40" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">AI Teacher Says...</span>
              </div>
              <p className="text-gray-300 leading-relaxed">{slide.narration}</p>
            </motion.div>
          )}
        </div>
      </PremiumStage>
    </div>
  );
}

function PremiumStage({ children }) {
  return (
    <motion.div 
      className="glass rounded-[2.5rem] p-10 md:p-14 shadow-[0_40px_100px_rgba(0,0,0,0.7)] border-white/5 relative overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full pointer-events-none" />
      {children}
    </motion.div>
  );
}
