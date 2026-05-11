import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import {
  FaFileInvoice,
  FaTrash,
  FaPrint,
  FaSearch
} from "react-icons/fa";

export default function InvoiceHistoryPage() {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");

  const API = `${window.location.protocol}//${window.location.hostname}:5000/api`;

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API}/invoices`);
      setInvoices(res.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteInvoice = async (id) => {
    if (!window.confirm("Delete this invoice?")) return;

    try {
      await axios.delete(`${API}/invoices/${id}`);
      fetchInvoices();
    } catch (err) {
      console.log(err);
    }
  };

  // 🔍 SEARCH FILTER
  const filtered = invoices.filter((inv) =>
    inv.customerName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  );

  // 📊 STATS
  const totalInvoices = invoices.length;

  const uniqueCustomers = new Set(
    invoices.map((inv) => inv.customerName)
  ).size;

  const totalRevenue = invoices.reduce(
    (sum, inv) => sum + (inv.total || 0),
    0
  );

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">

        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <FaFileInvoice />
          Invoice History
        </h1>

        {/* STATS */}
        <div className="flex flex-wrap gap-4">

          <div className="bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-center min-w-[110px]">
            <p className="text-xs text-gray-400">Invoices</p>
            <p className="text-white text-xl font-bold">
              {totalInvoices}
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-center min-w-[110px]">
            <p className="text-xs text-gray-400">Customers</p>
            <p className="text-blue-400 text-xl font-bold">
              {uniqueCustomers}
            </p>
          </div>

          <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl text-center min-w-[140px]">
            <p className="text-xs text-gray-400">Revenue</p>
            <p className="text-green-400 text-xl font-bold">
              ₹{totalRevenue.toLocaleString()}
            </p>
          </div>

        </div>
      </div>

      {/* SEARCH */}
      <div className="relative max-w-sm">
        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-black/40 border border-white/10 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* SCROLLABLE CARDS */}
      <div className="grid gap-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">

        {filtered.length > 0 ? (
          filtered.map((inv) => (

            <motion.div
              key={inv._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#2a2f4a] to-[#1f2937] border border-white/10 rounded-2xl p-5 shadow-lg hover:shadow-blue-500/10 transition-all"
            >

              {/* TOP */}
              <div className="flex justify-between mb-4">

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider">
                    Receipt
                  </p>

                  <h2 className="text-2xl text-white font-bold">
                    {inv.customerName}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {inv.customerPhone || "No Phone"}
                  </p>
                </div>

                <div className="text-right text-sm text-gray-400">
                  <p className="font-bold">
                    #{inv._id.slice(-6).toUpperCase()}
                  </p>

                  <p>
                    {inv.date
                      ? new Date(inv.date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

              </div>

              {/* ITEMS */}
              <div className="border-t border-dashed border-gray-600 py-4">

                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider">
                  Order Summary
                </p>

                <div className="space-y-2">

                  {inv.items?.slice(0, 3).map((item, i) => (

                    <div
                      key={i}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-300">
                        {item.name} × {item.qty}
                      </span>

                      <span className="text-gray-400">
                        ₹{item.qty * item.price}
                      </span>
                    </div>

                  ))}

                </div>

                {inv.items?.length > 3 && (
                  <p className="text-xs text-gray-500 mt-3">
                    +{inv.items.length - 3} more items...
                  </p>
                )}

              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-center mt-4">

                <div className="flex gap-2">

                  {/* PRINT */}
                  <button
                    onClick={() => navigate(`/bill/${inv._id}`)}
                    className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-3 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                  >
                    <FaPrint />
                  </button>

                  {/* DELETE */}
                  <button
                    onClick={() => deleteInvoice(inv._id)}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                  >
                    <FaTrash />
                  </button>

                </div>

                <div className="text-right">

                  <p className="text-xs text-green-400 uppercase tracking-wider">
                    Total Paid
                  </p>

                  <p className="text-2xl text-green-400 font-black">
                    ₹{inv.total?.toLocaleString()}
                  </p>

                </div>

              </div>

            </motion.div>

          ))
        ) : (

          <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
            <h2 className="text-xl text-gray-400 font-semibold">
              No invoices found
            </h2>

            <p className="text-gray-500 mt-2">
              Try changing the search keyword.
            </p>
          </div>

        )}

      </div>

    </div>
  );
}