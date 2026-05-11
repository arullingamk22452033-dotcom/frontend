import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaUserPlus,
  FaUserTie,
  FaCheck,
  FaTimes,
  FaFileExcel,
  FaDownload,
  FaSearch,
  FaTrash,
  FaChartPie,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFilter
} from "react-icons/fa";

import {
  exportToExcel,
  exportSingleWorker
} from "../utils/excelExport";

export default function Workers() {
  const [name, setName] = useState("");
  const [wage, setWage] = useState("");

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWorker, setSelectedWorker] = useState(null);

  // ✅ FILTER STATES
  const [filterType, setFilterType] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const API = "http://localhost:5000/api/workers";

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      const res = await axios.get(API);
      setWorkers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ ADD WORKER
  const addWorker = async (e) => {
    e.preventDefault();

    if (!name || !wage) return;

    try {
      setLoading(true);

      await axios.post(`${API}/add`, {
        name,
        wage: Number(wage)
      });

      setName("");
      setWage("");

      fetchWorkers();

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ DELETE WORKER
  const deleteWorker = async (id, workerName) => {
    if (
      !window.confirm(
        `Are you sure you want to permanently remove ${workerName}?`
      )
    )
      return;

    try {
      setLoading(true);

      await axios.delete(`${API}/${id}`);

      fetchWorkers();

    } catch (err) {
      console.log(err);
      alert("Failed to delete worker.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ MARK ATTENDANCE
  const markAttendance = async (id, status) => {
    try {
      setLoading(true);

      await axios.put(`${API}/attendance/${id}`, {
        status
      });

      fetchWorkers();

    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ GET LAST ATTENDANCE
  const getLastAttendance = (w) => {
    if (!w.attendance || w.attendance.length === 0) return null;

    return w.attendance[w.attendance.length - 1];
  };

  // ✅ STATS
  const calculateWorkerStats = (worker) => {
    if (!worker || !worker.attendance) {
      return {
        present: 0,
        absent: 0,
        totalEarned: 0
      };
    }

    let present = 0;
    let absent = 0;

    worker.attendance.forEach((a) => {
      if (a.status === "present") present++;
      else if (a.status === "absent") absent++;
    });

    return {
      present,
      absent,
      totalEarned: present * worker.wage
    };
  };

  // ✅ EXPORT
  const exportWorkers = () => {
    const formatted = filteredWorkers.map((w) => {
      const last = getLastAttendance(w);

      return {
        Name: w.name,
        Wage: w.wage,
        Status: last?.status || "Not Marked",
        Date: last?.date
          ? new Date(last.date).toLocaleDateString()
          : "-"
      };
    });

    exportToExcel(formatted, "Workers_Report");
  };

  // ✅ FILTER LOGIC
  const filteredWorkers = workers.filter((w) => {
    const matchSearch = w.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;

    const last = getLastAttendance(w);

    if (!last) {
      return filterType === "all";
    }

    const attendanceDate = new Date(last.date);

    // TODAY
    if (filterType === "today") {
      return (
        attendanceDate.toDateString() ===
        new Date().toDateString()
      );
    }

    // MONTH
    if (filterType === "month" && selectedMonth) {
      const workerMonth =
        attendanceDate.getMonth() + 1;

      const workerYear =
        attendanceDate.getFullYear();

      const [year, month] =
        selectedMonth.split("-");

      return (
        Number(month) === workerMonth &&
        Number(year) === workerYear
      );
    }

    // DATE
    if (filterType === "date" && selectedDate) {
      return (
        attendanceDate.toISOString().split("T")[0] ===
        selectedDate
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <div className="flex items-center gap-3">
          <div className="bg-purple-500/20 p-3 rounded-xl border border-purple-500/30 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <FaUserTie className="text-2xl" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Worker Management
            </h1>

            <p className="text-gray-400 mt-1">
              Manage staff, daily wages, and attendance
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto flex-wrap">

          {/* SEARCH */}
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

            <input
              type="text"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(e.target.value)
              }
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
          </div>

          {/* FILTER */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">

            <FaFilter className="text-gray-400" />

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(e.target.value)
              }
              className="bg-transparent text-white outline-none"
            >
              <option className="bg-gray-900" value="all">
                All
              </option>

              <option className="bg-gray-900" value="today">
                Today
              </option>

              <option className="bg-gray-900" value="month">
                Month
              </option>

              <option className="bg-gray-900" value="date">
                Date
              </option>
            </select>
          </div>

          {/* MONTH */}
          {filterType === "month" && (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value)
              }
              className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2"
            />
          )}

          {/* DATE */}
          {filterType === "date" && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(e.target.value)
              }
              className="bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2"
            />
          )}

          {/* EXPORT */}
          <button
            onClick={exportWorkers}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:scale-105 whitespace-nowrap"
          >
            <FaFileExcel />
            Export All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ADD WORKER FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 sticky top-6">

            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <FaUserPlus />
              </div>

              <h2 className="text-lg font-bold text-white">
                Add New Worker
              </h2>
            </div>

            <form
              onSubmit={addWorker}
              className="space-y-4"
            >

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">
                  Daily Wage (₹)
                </label>

                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  value={wage}
                  onChange={(e) =>
                    setWage(e.target.value)
                  }
                  className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] mt-4 disabled:opacity-50"
              >
                <FaUserPlus />

                {loading
                  ? "Adding..."
                  : "Register Worker"}
              </button>
            </form>
          </div>
        </div>

        {/* TABLE */}
        <div className="lg:col-span-3">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-left border-collapse whitespace-nowrap">

                <thead>
                  <tr className="bg-black/40 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">

                    <th className="p-4 font-semibold">
                      Worker Details
                    </th>

                    <th className="p-4 font-semibold text-center">
                      Today's Status
                    </th>

                    <th className="p-4 font-semibold text-center">
                      Mark Attendance
                    </th>

                    <th className="p-4 font-semibold text-right">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>

                    {filteredWorkers.length > 0 ? (
                      filteredWorkers.map((w, index) => {

                        const last =
                          getLastAttendance(w);

                        const isToday =
                          last &&
                          new Date(last.date)
                            .toISOString()
                            .split("T")[0] ===
                            new Date()
                              .toISOString()
                              .split("T")[0];

                        return (
                          <motion.tr
                            initial={{
                              opacity: 0,
                              x: 20
                            }}
                            animate={{
                              opacity: 1,
                              x: 0
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.9
                            }}
                            transition={{
                              delay: index * 0.05
                            }}
                            key={w._id}
                            className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                          >

                            <td className="p-4">
                              <div className="flex flex-col">

                                <span className="font-bold text-gray-200 group-hover:text-white transition-colors text-lg">
                                  {w.name}
                                </span>

                                <span className="text-gray-400 text-sm font-mono tracking-wide">
                                  Wage: ₹{w.wage}
                                </span>

                              </div>
                            </td>

                            <td className="p-4 text-center">

                              {last?.status ===
                                "present" &&
                                isToday && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                    Present
                                  </span>
                                )}

                              {last?.status ===
                                "absent" &&
                                isToday && (
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    Absent
                                  </span>
                                )}

                              {(!last || !isToday) && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                  Pending
                                </span>
                              )}

                            </td>

                            <td className="p-4">
                              <div className="flex justify-center gap-2">

                                <button
                                  onClick={() =>
                                    markAttendance(
                                      w._id,
                                      "present"
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    (last?.status ===
                                      "present" &&
                                      isToday)
                                  }
                                  className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white rounded-xl transition-all border border-emerald-500/20 disabled:opacity-30"
                                >
                                  <FaCheck />
                                </button>

                                <button
                                  onClick={() =>
                                    markAttendance(
                                      w._id,
                                      "absent"
                                    )
                                  }
                                  disabled={
                                    loading ||
                                    (last?.status ===
                                      "absent" &&
                                      isToday)
                                  }
                                  className="w-10 h-10 flex items-center justify-center bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all border border-rose-500/20 disabled:opacity-30"
                                >
                                  <FaTimes />
                                </button>

                              </div>
                            </td>

                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">

                                <button
                                  onClick={() =>
                                    setSelectedWorker(w)
                                  }
                                  className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors"
                                >
                                  <FaChartPie />
                                </button>

                                <button
                                  onClick={() =>
                                    exportSingleWorker(w)
                                  }
                                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg transition-colors"
                                >
                                  <FaDownload />
                                </button>

                                <button
                                  onClick={() =>
                                    deleteWorker(
                                      w._id,
                                      w.name
                                    )
                                  }
                                  className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors"
                                >
                                  <FaTrash />
                                </button>

                              </div>
                            </td>

                          </motion.tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="p-10 text-center"
                        >

                          <div className="flex flex-col items-center justify-center text-gray-500">
                            <FaUserTie className="text-6xl mb-4 opacity-20" />

                            <p className="text-xl font-medium">
                              No workers found.
                            </p>
                          </div>

                        </td>
                      </tr>
                    )}

                  </AnimatePresence>
                </tbody>

              </table>

            </div>
          </div>
        </div>
      </div>

      {/* STATS MODAL */}
      <AnimatePresence>

        {selectedWorker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20
              }}
              className="bg-[#1e293b] border border-white/10 rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
            >

              <div className="flex justify-between items-start mb-6 relative z-10">

                <div>
                  <h2 className="text-2xl font-black text-white">
                    {selectedWorker.name}'s Stats
                  </h2>

                  <p className="text-gray-400">
                    Lifetime Attendance & Earnings
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedWorker(null)
                  }
                  className="text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
                >
                  <FaTimes />
                </button>

              </div>

              {(() => {
                const stats =
                  calculateWorkerStats(
                    selectedWorker
                  );

                return (
                  <div className="space-y-4 relative z-10">

                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
                      <p className="text-emerald-400 text-sm">
                        Days Present
                      </p>

                      <p className="text-3xl font-black text-white">
                        {stats.present}
                      </p>
                    </div>

                    <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl">
                      <p className="text-rose-400 text-sm">
                        Days Absent
                      </p>

                      <p className="text-3xl font-black text-white">
                        {stats.absent}
                      </p>
                    </div>

                    <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl">
                      <p className="text-indigo-400 text-sm">
                        Total Earnings
                      </p>

                      <p className="text-3xl font-black text-white">
                        ₹
                        {stats.totalEarned.toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedWorker(null)
                      }
                      className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl"
                    >
                      Close Summary
                    </button>

                  </div>
                );
              })()}

            </motion.div>
          </div>
        )}

      </AnimatePresence>

    </div>
  );
}