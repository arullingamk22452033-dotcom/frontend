import { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import {
  FaIndustry,
  FaPlusCircle,
  FaHistory,
  FaFileExcel,
  FaBox,
  FaCogs,
  FaEdit,
  FaTrash,
  FaFilter
} from "react-icons/fa";

import { exportToExcel } from "../utils/excelExport";

export default function Production() {
  const [materials, setMaterials] = useState([]);
  const [production, setProduction] = useState([]);

  const [material, setMaterial] = useState("");
  const [usedQty, setUsedQty] = useState("");
  const [outputQty, setOutputQty] = useState("");

  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState(null);

  // FILTER STATES
  const [filterType, setFilterType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const API = "http://localhost:5000/api";

  useEffect(() => {
    fetchMaterials();
    fetchProduction();
  }, []);

  // FETCH MATERIALS
  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`${API}/inventory`);
      setMaterials(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // FETCH PRODUCTION
  const fetchProduction = async () => {
    try {
      const res = await axios.get(`${API}/production`);
      setProduction(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  // EXPORT EXCEL
  const exportProduction = () => {
    const formatted = filteredProduction.map((p) => ({
      Material: p.material,
      "Used (kg)": p.usedQty,
      "Output (kg)": p.outputQty,
      Date: p.date
        ? new Date(p.date).toLocaleDateString()
        : "-"
    }));

    exportToExcel(formatted, "Production_Report");
  };

  // EDIT
  const handleEdit = (item) => {
    setMaterial(item.material);
    setUsedQty(item.usedQty);
    setOutputQty(item.outputQty);

    setEditId(item._id);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this record?")) return;

    try {
      await axios.delete(`${API}/production/${id}`);

      setProduction((prev) =>
        prev.filter((item) => item._id !== id)
      );

      fetchMaterials();

      alert("✅ Deleted Successfully");
    } catch (err) {
      console.log(err);
      alert("Delete failed ❌");
    }
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!material || !usedQty || !outputQty) {
      return alert("Fill all fields ❗");
    }

    try {
      setLoading(true);

      if (editId) {
        // UPDATE
        await axios.put(`${API}/production/${editId}`, {
          material,
          usedQty: Number(usedQty),
          outputQty: Number(outputQty)
        });

        alert("✅ Production Updated");
      } else {
        // CREATE
        const res = await axios.post(`${API}/production`, {
          material,
          usedQty: Number(usedQty),
          outputQty: Number(outputQty)
        });

        alert(
          `✅ Saved Successfully!\n📦 Remaining Stock: ${res.data.remainingStock} kg`
        );
      }

      // RESET
      setMaterial("");
      setUsedQty("");
      setOutputQty("");
      setEditId(null);

      fetchMaterials();
      fetchProduction();

    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Error ❌");
    } finally {
      setLoading(false);
    }
  };

  // FILTER LOGIC
  const filteredProduction = production.filter((item) => {
    if (filterType === "day" && selectedDate) {
      return (
        new Date(item.date).toLocaleDateString() ===
        new Date(selectedDate).toLocaleDateString()
      );
    }

    if (filterType === "month" && selectedMonth) {
      const itemDate = new Date(item.date);

      const itemMonth =
        itemDate.getFullYear() +
        "-" +
        String(itemDate.getMonth() + 1).padStart(2, "0");

      return itemMonth === selectedMonth;
    }

    return true;
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <FaIndustry className="text-2xl" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Production Log
            </h1>

            <p className="text-gray-400 mt-1">
              Record material usage and daily outputs
            </p>
          </div>
        </div>

        <button
          onClick={exportProduction}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 whitespace-nowrap"
        >
          <FaFileExcel />
          Export Report
        </button>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center">

        <div className="flex items-center gap-2 text-white font-semibold">
          <FaFilter />
          Filter Production
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2"
        >
          <option value="all">All</option>
          <option value="day">Day Wise</option>
          <option value="month">Month Wise</option>
        </select>

        {filterType === "day" && (
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2"
          />
        )}

        {filterType === "month" && (
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-black/30 border border-white/10 text-white rounded-xl px-4 py-2"
          />
        )}

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl p-6 sticky top-6">

            <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
              <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                <FaCogs />
              </div>

              <h2 className="text-xl font-bold text-white">
                {editId ? "Edit Production" : "Log Production"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* MATERIAL */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">
                  Raw Material
                </label>

                <div className="relative">
                  <FaBox className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full bg-black/30 border border-white/10 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    required
                  >
                    <option value="">Select Material...</option>

                    {materials.map((item) => (
                      <option key={item._id} value={item.name}>
                        {item.name} (Available: {item.quantity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* USED */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">
                  Input Quantity (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  value={usedQty}
                  onChange={(e) => setUsedQty(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* OUTPUT */}
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-1">
                  Final Output (kg)
                </label>

                <input
                  type="number"
                  min="0"
                  value={outputQty}
                  onChange={(e) => setOutputQty(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition-all"
              >
                <FaPlusCircle />

                {loading
                  ? "Saving..."
                  : editId
                  ? "Update Production"
                  : "Save Production"}
              </button>

            </form>
          </div>
        </div>

        {/* TABLE */}
        <div className="lg:col-span-2">
          <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden h-full flex flex-col">

            <div className="p-6 border-b border-white/10 flex items-center gap-2 bg-black/20">
              <FaHistory className="text-gray-400" />

              <h2 className="text-lg font-bold text-white">
                Recent Activity History
              </h2>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse whitespace-nowrap">

                <thead>
                  <tr className="bg-black/40 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                    <th className="p-4">Material</th>
                    <th className="p-4 text-center">Used Qty</th>
                    <th className="p-4 text-center">Output Qty</th>
                    <th className="p-4 text-right">Date</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence>

                    {filteredProduction.length > 0 ? (
                      filteredProduction.map((p, index) => (

                        <motion.tr
                          key={p._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-white/5 hover:bg-white/5"
                        >

                          <td className="p-4 text-gray-200">
                            {p.material}
                          </td>

                          <td className="p-4 text-center text-rose-400 font-bold">
                            -{p.usedQty} kg
                          </td>

                          <td className="p-4 text-center text-emerald-400 font-bold">
                            +{p.outputQty} kg
                          </td>

                          <td className="p-4 text-right text-gray-400 text-sm">
                            {p.date
                              ? new Date(p.date).toLocaleDateString()
                              : "-"}
                          </td>

                          <td className="p-4 text-center">
                            <div className="flex justify-center gap-2">

                              <button
                                onClick={() => handleEdit(p)}
                                className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg border border-blue-500/20"
                              >
                                <FaEdit />
                              </button>

                              <button
                                onClick={() => handleDelete(p._id)}
                                className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg border border-rose-500/20"
                              >
                                <FaTrash />
                              </button>

                            </div>
                          </td>

                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="p-12 text-center text-gray-500">
                          No production data available.
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
    </div>
  );
}