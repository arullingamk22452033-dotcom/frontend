import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaEnvelope } from "react-icons/fa";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role", res.data.user.role);
        localStorage.setItem("name", res.data.user.name);

        const role = res.data.user.role.trim().toLowerCase();
        if (role === "admin") navigate("/admin/dashboard");
        else navigate("/staff/dashboard");
      } else {
        await axios.post("http://localhost:5000/api/auth/register", { name, email, password, role: "staff" });
        alert("Registered Successfully! ✅");
        setIsLogin(true);
      }
    } catch (err) {
      alert(err.response?.data?.error || "An error occurred ❌");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#0f172a] to-black text-white relative overflow-hidden">
      
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl p-10 w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            MillFlow
          </h1>
          <p className="text-gray-400 font-medium">
            {isLogin ? "Sign in to continue" : "Create a staff account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="popLayout">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative"
              >
                <FaUser className="absolute top-4 left-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <FaEnvelope className="absolute top-4 left-4 text-gray-400" />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute top-4 left-4 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300 mt-4"
          >
            {isLogin ? "Sign In" : "Create Account"}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 font-semibold cursor-pointer hover:text-blue-300 transition-colors"
            >
              {isLogin ? "Register here" : "Sign in here"}
            </span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}