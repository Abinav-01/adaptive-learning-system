import { motion, AnimatePresence } from "framer-motion";

export default function BulletList({ bullets, currentStepIndex }) {
  if (!Array.isArray(bullets) || bullets.length === 0) return null;

  // Pedagogical Reveal: Show bullets based on current step index
  const visibleBullets = bullets.slice(0, currentStepIndex + 1);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.ul 
      variants={container}
      initial="hidden"
      animate="show"
      className="slide-bullets space-y-6 mb-8"
    >
      <AnimatePresence mode="popLayout">
        {visibleBullets.map((bullet, idx) => (
          <motion.li
            key={idx}
            variants={item}
            className="text-xl text-gray-200 flex items-start group"
          >
            <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-4 mt-1 border border-emerald-500/20 group-hover:border-emerald-500/50 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            </div>
            <span className="flex-1 leading-relaxed">{bullet}</span>
          </motion.li>
        ))}
      </AnimatePresence>
    </motion.ul>
  );
}
