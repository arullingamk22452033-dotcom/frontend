import { motion } from "framer-motion";
import { FaUserCircle, FaIdBadge, FaShieldAlt, FaEnvelope } from "react-icons/fa";

export default function Profile() {
  const name = localStorage.getItem("name") || "Guest User";
  const role = localStorage.getItem("role") || "staff";

  return (
    <div className="space-y-6 flex justify-center items-center min-h-[70vh]">
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 w-full max-w-md relative overflow-hidden"
      >
        {/* Decorative Background Blur */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/20 rounded-full blur-[80px] -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-[80px] -ml-10 -mb-10"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="relative mb-6 group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
            <div className="relative bg-[#1e293b] p-2 rounded-full border-2 border-white/10">
              <FaUserCircle className="text-8xl text-gray-300" />
            </div>
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-1">{name}</h1>
          <p className={`px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wider mb-8 ${role === 'admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
            {role} Account
          </p>

          <div className="w-full space-y-4">
            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400">
                <FaIdBadge className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Full Name</p>
                <p className="text-white font-medium text-lg">{name}</p>
              </div>
            </div>

            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="bg-purple-500/10 p-3 rounded-lg text-purple-400">
                <FaShieldAlt className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Access Level</p>
                <p className="text-white font-medium text-lg capitalize">{role}</p>
              </div>
            </div>

            <div className="bg-black/20 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
              <div className="bg-emerald-500/10 p-3 rounded-lg text-emerald-400">
                <FaEnvelope className="text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Contact</p>
                <p className="text-white font-medium text-lg truncate">contact@{name.toLowerCase().replace(/\s+/g, '')}.com</p>
              </div>
            </div>
          </div>

          <button className="w-full mt-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold py-3 rounded-xl transition-colors shadow-lg">
            Edit Profile Settings
          </button>

        </div>
      </motion.div>
    </div>
  );
}