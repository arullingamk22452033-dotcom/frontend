import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaCalendarDay, FaBox, FaUsers, FaMoneyBillWave, FaExclamationTriangle, FaChartPie } from "react-icons/fa";

export default function DailyReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/report/daily");
      setData(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Generating Daily Report...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-500">
        <FaExclamationTriangle className="text-6xl mb-4 opacity-20 text-rose-500" />
        <p className="text-xl font-medium text-white">Failed to load daily report</p>
        <p className="text-sm mt-2">Please try again later or check your connection.</p>
      </div>
    );
  }

  const statCards = [
    { title: "Total Production", value: `${data.totalProduction} kg`, icon: <FaBox className="text-blue-400 text-3xl" />, gradient: "from-blue-500/10 to-blue-600/5", border: "border-blue-500/20" },
    { title: "Workers Present", value: data.presentWorkers, icon: <FaUsers className="text-emerald-400 text-3xl" />, gradient: "from-emerald-500/10 to-emerald-600/5", border: "border-emerald-500/20" },
    { title: "Total Wages", value: `₹ ${data.totalWages.toLocaleString()}`, icon: <FaMoneyBillWave className="text-amber-400 text-3xl" />, gradient: "from-amber-500/10 to-amber-600/5", border: "border-amber-500/20" },
    { title: "Low Stock Items", value: data.lowStockCount, icon: <FaExclamationTriangle className="text-rose-400 text-3xl" />, gradient: "from-rose-500/10 to-rose-600/5", border: "border-rose-500/20" }
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
            <FaCalendarDay className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Daily Summary</h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Report for {data.date ? new Date(data.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Today"}
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
            className={`bg-gradient-to-br ${card.gradient} border ${card.border} backdrop-blur-xl p-6 rounded-2xl shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden`}
          >
            <div className={`absolute -right-4 -top-4 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl`}></div>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-black/20 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                {card.icon}
              </div>
            </div>
            <div>
              <p className="text-gray-400 font-medium text-sm">{card.title}</p>
              <h2 className="text-3xl font-black text-white mt-1 tracking-tight">{card.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* LOW STOCK ALERT TABLE */}
      <AnimatePresence>
        {data.lowStockItems && data.lowStockItems.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-rose-500/20 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mt-8 relative"
          >
            {/* Warning Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-600 via-rose-500 to-rose-400"></div>

            <div className="p-6 border-b border-white/5 bg-rose-500/5 flex items-center gap-3">
              <div className="bg-rose-500/20 p-2 rounded-lg text-rose-400 animate-pulse">
                <FaExclamationTriangle />
              </div>
              <h2 className="text-xl font-bold text-white tracking-wide">Critical Low Stock Alerts</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-black/40 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                    <th className="p-4 font-semibold pl-6">Material Name</th>
                    <th className="p-4 font-semibold text-center">Current Quantity</th>
                    <th className="p-4 font-semibold text-center">Minimum Required</th>
                    <th className="p-4 font-semibold text-right pr-6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.lowStockItems.map((item, index) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      key={item._id} 
                      className="border-b border-white/5 hover:bg-rose-500/5 transition-colors group"
                    >
                      <td className="p-4 pl-6 font-bold text-gray-200 group-hover:text-white text-lg">
                        {item.name}
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-rose-400 font-mono font-bold text-xl">{item.quantity} kg</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-gray-400 font-mono">{item.minLevel} kg</span>
                      </td>
                      <td className="p-4 text-right pr-6">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Needs Restock
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(!data.lowStockItems || data.lowStockItems.length === 0) && (
         <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center mt-8"
        >
           <FaChartPie className="text-5xl text-emerald-400 mb-4 opacity-80" />
           <h3 className="text-xl font-bold text-white">All Stock Levels Normal</h3>
           <p className="text-emerald-200/70 mt-2">No critical shortages detected in today's inventory check.</p>
         </motion.div>
      )}

    </div>
  );
}