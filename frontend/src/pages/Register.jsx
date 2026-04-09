import { useState, useContext } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import PremiumInput from "../components/ui/PremiumInput";
import PremiumButton from "../components/ui/PremiumButton";
import PremiumCard from "../components/ui/PremiumCard";
import { User, Mail, Lock, UserPlus, Sparkles } from "lucide-react";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setSubmitLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setSubmitLoading(false);
      return;
    }

    try {
      await api.post("/users/register", {
        email,
        password,
        full_name: fullName
      });

      await login(email, password);
      navigate("/dashboard");

    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      if (typeof errorDetail === "string") {
        if (errorDetail.toLowerCase().includes("unique constraint") || errorDetail.toLowerCase().includes("already exists")) {
          setError("A user with this email already exists.");
        } else if (errorDetail.toLowerCase().includes("invalid email")) {
          setError("Invalid email format.");
        } else {
          setError(errorDetail);
        }
      } else {
        setError("Registration failed. Please try again.");
      }
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
      <div className="absolute top-1/4 -right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse-slow delay-700" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4 shadow-glow"
          >
            <Sparkles className="w-8 h-8 text-emerald-400" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-400 font-medium">
            Join the future of adaptive learning
          </p>
        </div>

        <PremiumCard className="backdrop-blur-2xl border-white/5 shadow-2xl overflow-visible" hover={false}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-3 mb-6 shadow-lg shadow-red-500/5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
              <PremiumInput
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User size={18} />}
                disabled={isSubmitLoading}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <PremiumInput
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                disabled={isSubmitLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <PremiumInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                disabled={isSubmitLoading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Confirm</label>
              <PremiumInput
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Lock size={18} />}
                disabled={isSubmitLoading}
              />
            </div>

            <div className="md:col-span-2 mt-4">
              <PremiumButton 
                fullWidth 
                className="h-14 text-lg" 
                disabled={isSubmitLoading}
                icon={isSubmitLoading ? null : <UserPlus size={20} />}
              >
                {isSubmitLoading ? "Creating Profile..." : "Get Started"}
              </PremiumButton>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <span className="text-gray-500 text-sm font-medium">Already have an account?</span>{" "}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-all hover:underline decoration-2 underline-offset-4">
              Sign in here
            </Link>
          </div>
        </PremiumCard>

        <div className="mt-8 flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
           {/* Placeholder for platform badges if any */}
        </div>
      </motion.div>
    </div>
  );
}
