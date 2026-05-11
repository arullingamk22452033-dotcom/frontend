import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaBoxes,
  FaIndustry,
  FaUsers,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaPlus,
  FaArrowRight,
  FaChartLine,
  FaCalendarCheck
} from "react-icons/fa";

export default function Dashboard() {
  const [production, setProduction] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const userName = localStorage.getItem("name") || "Admin";
  const role = localStorage.getItem("role") || "admin";
  const base = role === "admin" ? "/admin" : "/staff";

  const navigate = useNavigate();

  const API = "http://localhost:5000/api";

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, workerRes, stockRes, alertRes, invoiceRes] =
        await Promise.all([
          axios.get(`${API}/production`),
          axios.get(`${API}/workers`),
          axios.get(`${API}/inventory/low-stock`),
          axios.get(`${API}/alerts`),
          axios.get(`${API}/invoices`)
        ]);

      setProduction(prodRes.data || []);
      setWorkers(workerRes.data || []);
      setLowStock(stockRes.data || []);
      setAlerts(alertRes.data || []);
      setInvoices(invoiceRes.data || []);
    } catch (err) {
      console.log("FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const getLastAttendance = (worker) => {
    if (!worker.attendance || worker.attendance.length === 0) return null;

    return worker.attendance[worker.attendance.length - 1];
  };

  const today = new Date().toISOString().split("T")[0];

  const totalOutput = production.reduce(
    (sum, p) => sum + Number(p.outputQty || 0),
    0
  );

  const totalWorkers = workers.length;

  const presentWorkers = workers.filter((w) => {
    const record = w.attendance?.find(
      (a) =>
        new Date(a.date).toISOString().split("T")[0] === today
    );

    return record?.status === "present";
  }).length;

  const totalWages = workers.reduce((total, w) => {
    const record = w.attendance?.find(
      (a) =>
        new Date(a.date).toISOString().split("T")[0] === today
    );

    if (record?.status === "present") {
      return total + Number(w.wage || 0);
    }

    return total;
  }, 0);

  const totalSales = invoices.reduce(
    (sum, inv) => sum + Number(inv.total || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative flex flex-col items-center">
          <div className="w-20 h-20 md:w-24 md:h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>

          <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full"></div>

          <p className="mt-6 text-indigo-300 font-bold tracking-widest uppercase text-xs md:text-sm animate-pulse text-center">
            Loading Factory Data
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Sales",
      value: `₹${totalSales.toLocaleString()}`,
      icon: <FaFileInvoiceDollar />,
      gradient: "from-amber-500 to-orange-600",
      bgClass: "bg-amber-500/10",
      borderClass: "border-amber-500/20",
      textClass: "text-amber-400"
    },

    {
      title: "Production Output",
      value: `${totalOutput} kg`,
      icon: <FaIndustry />,
      gradient: "from-blue-500 to-indigo-600",
      bgClass: "bg-blue-500/10",
      borderClass: "border-blue-500/20",
      textClass: "text-blue-400"
    },

    {
      title: "Active Workforce",
      value: `${presentWorkers} / ${totalWorkers}`,
      icon: <FaUsers />,
      gradient: "from-emerald-500 to-teal-600",
      bgClass: "bg-emerald-500/10",
      borderClass: "border-emerald-500/20",
      textClass: "text-emerald-400"
    },

    {
      title: "Today's Payroll",
      value: `₹${totalWages.toLocaleString()}`,
      icon: <FaBoxes />,
      gradient: "from-rose-500 to-pink-600",
      bgClass: "bg-rose-500/10",
      borderClass: "border-rose-500/20",
      textClass: "text-rose-400"
    }
  ];

  return (
    <div className="space-y-4 md:space-y-8 pb-10 overflow-x-hidden">

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1e293b] to-black border border-white/10 p-4 md:p-8 shadow-2xl"
      >
        {/* GLOW */}
        <div className="absolute top-[-50%] right-[-10%] w-96 h-96 bg-blue-600/30 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute bottom-[-50%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

          {/* LEFT */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 tracking-tight mb-2">
              Good Morning, {userName}.
            </h1>

            <p className="text-gray-400 text-sm md:text-lg flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></span>

              Factory systems are running smoothly today.
            </p>
          </div>

          {/* BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">

            <button
              onClick={() => navigate(`${base}/production`)}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl transition-all shadow-lg backdrop-blur-md font-medium group"
            >
              <FaPlus className="text-indigo-400 group-hover:rotate-90 transition-transform" />

              Log Production
            </button>

            <button
              onClick={() => navigate(`${base}/invoices`)}
              className="w-full md:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/25 font-bold hover:scale-105"
            >
              <FaFileInvoiceDollar />

              Create Invoice
            </button>

          </div>
        </div>
      </motion.div>

      {/* ALERTS */}
      <AnimatePresence>
        {alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3"
          >
            {alerts.map((a, i) => (
              <div
                key={i}
                className={`flex justify-between items-center p-4 rounded-2xl border backdrop-blur-xl shadow-lg relative overflow-hidden group

                ${
                  a.type === "stock"
                    ? "bg-rose-500/10 border-rose-500/30"
                    : a.type === "worker"
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-blue-500/10 border-blue-500/30"
                }`}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <div
                    className={`p-2 rounded-lg

                    ${
                      a.type === "stock"
                        ? "bg-rose-500/20 text-rose-400"
                        : a.type === "worker"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    <FaExclamationTriangle className="text-lg" />
                  </div>

                  <span className="font-semibold tracking-wide text-sm md:text-base">
                    {a.message}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">

        {/* STAT CARDS */}
        {statCards.map((card, i) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: i * 0.1,
              type: "spring",
              stiffness: 100
            }}
            key={i}
            className={`group relative overflow-hidden rounded-3xl ${card.bgClass} border ${card.borderClass} p-5 md:p-6 backdrop-blur-xl`}
          >
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} opacity-20 rounded-bl-full`}
            ></div>

            <div className="flex flex-col h-full justify-between relative z-10">

              <div className="flex justify-between items-start mb-6">

                <div
                  className={`p-3 rounded-2xl bg-black/40 backdrop-blur-md border border-white/5 shadow-inner ${card.textClass} text-xl md:text-2xl`}
                >
                  {card.icon}
                </div>

                <div className="bg-white/5 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold text-white/60 border border-white/10">
                  Today
                </div>

              </div>

              <div>
                <p className="text-gray-400 font-semibold text-xs md:text-sm mb-1 uppercase tracking-wider">
                  {card.title}
                </p>

                <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tighter">
                  {card.value}
                </h2>
              </div>

            </div>
          </motion.div>
        ))}

      </div>

      {/* LOW STOCK */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e293b]/50 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-4 md:p-6 border-b border-white/5 flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">

          <h2 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-lg">
              <FaChartLine />
            </div>

            Critical Inventory
          </h2>

          <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/30">
            {lowStock.length} Items Low
          </span>
        </div>

        <div className="p-4 md:p-6">

          {lowStock.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {lowStock.map((i) => (
                <div
                  key={i._id}
                  className="flex justify-between items-center p-4 rounded-2xl bg-black/40 border border-rose-500/20"
                >
                  <span className="font-bold text-gray-200">
                    {i.name}
                  </span>

                  <span className="text-rose-400 font-black font-mono">
                    {i.quantity} kg
                  </span>
                </div>
              ))}

            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-gray-500">
              <FaBoxes className="text-5xl opacity-20 mb-3" />

              <p className="font-medium text-emerald-400/80">
                Inventory levels are optimal.
              </p>
            </div>
          )}

        </div>
      </motion.div>

      {/* WORKERS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1e293b]/50 border border-white/10 backdrop-blur-2xl rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center">

          <h2 className="text-lg font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <FaCalendarCheck />
            </div>

            Workforce Status
          </h2>

        </div>

        <div className="overflow-x-auto">

          <table className="w-full min-w-[600px] text-left border-collapse">

            <thead>
              <tr className="bg-black/20 text-gray-400 text-xs uppercase tracking-widest border-b border-white/5">
                <th className="py-4 pl-6">Employee</th>
                <th className="py-4 text-center">Status</th>
                <th className="py-4 pr-6 text-right">Daily Wage</th>
              </tr>
            </thead>

            <tbody>
              {workers.slice(0, 5).map((w) => {
                const last = getLastAttendance(w);

                return (
                  <tr
                    key={w._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 pl-6 font-bold text-gray-300">
                      {w.name}
                    </td>

                    <td className="py-4 text-center">

                      {last?.status === "present" && (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-400">
                          Present
                        </span>
                      )}

                      {last?.status === "absent" && (
                        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500/10 text-rose-400">
                          Absent
                        </span>
                      )}

                    </td>

                    <td className="py-4 pr-6 text-right text-gray-400 font-mono">
                      ₹{w.wage}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>

        </div>
      </motion.div>

    </div>
  );
}