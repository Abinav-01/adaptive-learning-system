import { useState, useContext } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import PremiumInput from "../components/ui/PremiumInput";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumCard from "../components/ui/PremiumCard";
import { Mail, Lock, LogIn, Sparkles } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitLoading, setSubmitLoading] = useState(false);
  const { login, token, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!authLoading && token) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="auth-bg" />
      <div className="auth-grid" />
      
      {/* Floating Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow delay-700" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[440px] z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-glow"
          >
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400 font-medium">
            Continue your adaptive learning journey
          </p>
        </div>

        <PremiumCard className="backdrop-blur-2xl border-white/5 shadow-2xl overflow-visible" hover={false}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0, mb: 0 }}
                animate={{ opacity: 1, height: "auto", mb: 24 }}
                exit={{ opacity: 0, height: 0, mb: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3 overflow-hidden"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
              <PremiumInput
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={20} />}
                disabled={isSubmitLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">Forgot?</Link>
              </div>
              <PremiumInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={20} />}
                disabled={isSubmitLoading}
              />
            </div>

            <PremiumButton 
              fullWidth 
              className="mt-2 h-14 text-lg" 
              disabled={isSubmitLoading}
              icon={isSubmitLoading ? null : <LogIn size={20} />}
            >
              {isSubmitLoading ? "Verifying..." : "Sign In"}
            </PremiumButton>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <span className="text-gray-500 text-sm font-medium">New to the platform?</span>{" "}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-all hover:underline decoration-2 underline-offset-4">
              Create an account
            </Link>
          </div>
        </PremiumCard>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-8 text-gray-600 text-xs font-medium uppercase tracking-[0.2em]"
        >
          Secure • Adaptive • Intelligent
        </motion.p>
      </motion.div>
    </div>
  );
}
