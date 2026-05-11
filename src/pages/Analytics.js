import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend
} from "recharts";
import { FaChartLine, FaUsers, FaMoneyBillWave, FaChartPie } from "react-icons/fa";

export default function Analytics() {
  const [production, setProduction] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const API = "http://localhost:5000/api";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prod, work] = await Promise.all([
        axios.get(`${API}/production`),
        axios.get(`${API}/workers`)
      ]);

      setProduction(Array.isArray(prod.data) ? prod.data : []);
      setWorkers(Array.isArray(work.data) ? work.data : []);
    } catch (err) {
      console.log("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const productionData = production.map((p) => ({
    date: p.date ? new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Unknown",
    output: Number(p.outputQty || 0)
  }));

  const attendanceMap = {};
  workers.forEach((w) => {
    if (Array.isArray(w.attendance)) {
      w.attendance.forEach((a) => {
        const date = a.date ? new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "Unknown";
        if (!attendanceMap[date]) {
          attendanceMap[date] = { date, present: 0, absent: 0 };
        }
        if (a.status === "present") attendanceMap[date].present += 1;
        else attendanceMap[date].absent += 1;
      });
    }
  });
  const attendanceData = Object.values(attendanceMap);

  const salaryMap = {};
  workers.forEach((w) => {
    if (!salaryMap[w.name]) {
      salaryMap[w.name] = { name: w.name, salary: 0 };
    }
    if (Array.isArray(w.attendance)) {
      w.attendance.forEach((a) => {
        if (a.status === "present") salaryMap[w.name].salary += Number(w.wage || 0);
      });
    }
  });
  const salaryData = Object.values(salaryMap);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1e293b] border border-white/10 shadow-2xl p-4 rounded-xl backdrop-blur-xl">
          <p className="font-bold text-white mb-2">{label}</p>
          {payload.map((pld, index) => (
            <p key={index} style={{ color: pld.color }} className="font-medium text-sm flex items-center justify-between gap-4">
              <span>{pld.name}:</span>
              <span className="font-mono text-white">{pld.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-400 font-medium animate-pulse">Gathering Analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <div className="bg-indigo-500/20 p-3 rounded-xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
          <FaChartPie className="text-2xl" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Analytics Dashboard</h1>
          <p className="text-gray-400 mt-1">Visualize data trends and factory performance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PRODUCTION CHART */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-black/20">
            <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400">
              <FaChartLine />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Production Output Trend</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={productionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" name="Output (kg)" dataKey="output" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6, strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* SALARY DISTRIBUTION CHART */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-black/20">
            <div className="bg-amber-500/20 p-2 rounded-lg text-amber-400">
              <FaMoneyBillWave />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Payroll Distribution</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salaryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar name="Earned Salary (₹)" dataKey="salary" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ATTENDANCE CHART */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl shadow-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center gap-3 bg-black/20">
            <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
              <FaUsers />
            </div>
            <h2 className="text-xl font-bold text-white tracking-wide">Workforce Attendance Overview</h2>
          </div>
          <div className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={0}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 12 }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar name="Present" dataKey="present" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar name="Absent" dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </div>
  );
}