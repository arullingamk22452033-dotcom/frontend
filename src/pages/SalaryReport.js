import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoneyBillWave, FaCalendarAlt, FaFileExcel, FaUsers, FaRupeeSign } from "react-icons/fa";
import { exportToExcel } from "../utils/excelExport"; 

export default function SalaryReport() {
  const [workers, setWorkers] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const API = "http://localhost:5000/api";

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/workers/monthly?month=${month}&year=${year}`);
      setWorkers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("FETCH ERROR:", err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = {};
  workers.forEach((w) => {
    summary[w.name] = {
      days: Number(w.presentDays || 0),
      total: Number(w.totalSalary || 0)
    };
  });

  const grandTotal = Object.values(summary).reduce((sum, w) => sum + w.total, 0);
  const totalWorkers = Object.keys(summary).length;

  const exportSalary = () => {
    const formatted = Object.keys(summary).map((name) => ({
      Name: name,
      "Days Present": summary[name].days,
      "Total Salary (₹)": summary[name].total
    }));
    exportToExcel(formatted, `Salary_Report_${month}_${year}`);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-green-500/20 p-3 rounded-xl border border-green-500/30 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <FaMoneyBillWave className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Salary Reports</h1>
            <p className="text-gray-400 mt-1">Monthly wage calculations and payroll</p>
          </div>
        </div>
      </div>

      {/* FILTER & WIDGETS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* FILTERS */}
        <div className="md:col-span-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-5 flex flex-col justify-center">
          <h3 className="text-gray-400 font-medium text-sm mb-3 uppercase tracking-wider flex items-center gap-2">
            <FaCalendarAlt /> Select Period
          </h3>
          <div className="flex gap-3">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="flex-1 bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={i} value={i + 1} className="bg-gray-900">{m}</option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-24 bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-center"
            />
          </div>
        </div>

        {/* WIDGET 1 */}
        <div className="bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-500/20 backdrop-blur-xl rounded-2xl shadow-xl p-5 flex items-center gap-4 relative overflow-hidden">
           <div className="absolute -right-4 -bottom-4 opacity-10">
             <FaUsers className="text-8xl" />
           </div>
           <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400">
             <FaUsers className="text-2xl" />
           </div>
           <div>
             <p className="text-gray-400 font-medium text-sm">Active Workers</p>
             <p className="text-3xl font-black text-white">{totalWorkers}</p>
           </div>
        </div>

        {/* WIDGET 2 (GRAND TOTAL) */}
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 backdrop-blur-xl rounded-2xl shadow-xl p-5 flex items-center gap-4 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 opacity-10">
             <FaRupeeSign className="text-8xl" />
           </div>
           <div className="bg-green-500/20 p-4 rounded-xl text-green-400">
             <FaMoneyBillWave className="text-2xl" />
           </div>
           <div>
             <p className="text-green-200 font-medium text-sm">Total Payroll Amount</p>
             <p className="text-3xl font-black text-white tracking-tighter">₹ {grandTotal.toLocaleString()}</p>
           </div>
        </div>

      </div>

      {/* SALARY TABLE */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/20">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaUsers className="text-gray-400" /> Worker Payroll Details
          </h2>
          <button 
            onClick={exportSalary}
            disabled={Object.keys(summary).length === 0}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <FaFileExcel className="text-emerald-400" /> Export List
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
             <div className="p-12 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 font-medium animate-pulse">Calculating Payroll Data...</p>
             </div>
          ) : (
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-black/40 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                  <th className="p-4 font-semibold pl-6">Worker Name</th>
                  <th className="p-4 font-semibold text-center">Days Present</th>
                  <th className="p-4 font-semibold text-right pr-6">Total Salary (₹)</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {Object.keys(summary).length > 0 ? (
                    Object.keys(summary).map((name, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={name} 
                        className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                      >
                        <td className="p-4 pl-6 font-bold text-gray-200 group-hover:text-white transition-colors text-lg">
                          {name}
                        </td>
                        <td className="p-4 text-center">
                          <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-4 py-1.5 rounded-full text-sm font-bold font-mono">
                            {summary[name].days} Days
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <span className="text-green-400 font-bold font-mono text-xl tracking-wide">
                            ₹ {summary[name].total.toLocaleString()}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <FaCalendarAlt className="text-5xl mb-4 opacity-20" />
                          <p className="text-lg font-medium">No payroll data found for this period.</p>
                          <p className="text-sm mt-1">Check another month or ensure attendance is marked.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}