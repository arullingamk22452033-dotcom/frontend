import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaArrowUp,
  FaArrowDown,
  FaChartLine
} from "react-icons/fa";

export default function ProfitPage() {

  const [finance, setFinance] = useState({
    income: 0,
    expense: 0,
    profit: 0,
    invoices: [],
    productions: []
  });

  // 🔥 FILTER STATES
  const [filter, setFilter] = useState("day");
  const [date, setDate] = useState("");

  const API = "http://localhost:5000/api/finance";

  useEffect(() => {
    fetchFinance();
  }, [filter, date]);

  const fetchFinance = async () => {
    try {
      const res = await axios.get(API, {
        params: { filter, date }
      });

      setFinance({
        income: res.data.income || 0,
        expense: res.data.expense || 0,
        profit: res.data.profit || 0,
        invoices: res.data.invoices || [],
        productions: res.data.productions || []
      });

    } catch (err) {
      console.log(err);
    }
  };

  return (

    <div className="h-screen overflow-y-auto bg-[#0f172a] text-white p-4 md:p-8">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6">

        <div className="bg-blue-500/20 p-4 rounded-2xl">
          <FaChartLine className="text-3xl text-blue-400" />
        </div>

        <div>
          <h1 className="text-3xl font-black">Finance Dashboard</h1>
          <p className="text-gray-400">Income • Expense • Profit Report</p>
        </div>

      </div>

      {/* 🔥 FILTER UI */}
      <div className="flex gap-3 mb-6">

        <select
          className="bg-black/40 border border-white/10 p-2 rounded-xl"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="day">Day Wise</option>
          <option value="month">Month Wise</option>
        </select>

        <input
          type={filter === "day" ? "date" : "month"}
          className="bg-black/40 border border-white/10 p-2 rounded-xl"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20">
          <FaArrowUp className="text-green-400 text-3xl mb-2" />
          <p className="text-gray-400">Income</p>
          <h2 className="text-3xl font-bold text-green-400">
            ₹{finance.income.toLocaleString()}
          </h2>
        </div>

        <div className="bg-red-500/10 p-6 rounded-3xl border border-red-500/20">
          <FaArrowDown className="text-red-400 text-3xl mb-2" />
          <p className="text-gray-400">Expense</p>
          <h2 className="text-3xl font-bold text-red-400">
            ₹{finance.expense.toLocaleString()}
          </h2>
        </div>

        <div className="bg-blue-500/10 p-6 rounded-3xl border border-blue-500/20">
          <FaMoneyBillWave className="text-blue-400 text-3xl mb-2" />
          <p className="text-gray-400">Profit</p>
          <h2 className="text-3xl font-bold text-blue-400">
            ₹{finance.profit.toLocaleString()}
          </h2>
        </div>

      </div>

      {/* 🔥 INCOME TABLE (SCROLL FIXED) */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-6">

        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Income Details</h2>
        </div>

        <div className="overflow-y-auto max-h-[300px]">

          <table className="w-full text-left">

            <thead className="sticky top-0 bg-black/40">
              <tr className="text-gray-400">
                <th className="p-3">Customer</th>
                <th className="p-3">Items</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {finance.invoices.length > 0 ? (
                finance.invoices.map((inv, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5">

                    <td className="p-3">
                      {inv.customerName || inv.customer || "Unknown"}
                    </td>

                    <td className="p-3">
                      {inv.items?.length ? `${inv.items.length} Items` : "1 Items"}
                    </td>

                    <td className="p-3 text-green-400">
                      ₹{Number(inv.total || 0).toLocaleString()}
                    </td>

                    <td className="p-3">
                      {inv.createdAt || inv.date
                        ? new Date(inv.createdAt || inv.date).toLocaleDateString()
                        : "No Date"}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-400" colSpan="4">
                    No income data found
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </div>

      {/* EXPENSE TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden mb-6">

        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Expense Details</h2>
        </div>

        <div className="overflow-y-auto max-h-[300px]">

          <table className="w-full text-left">

            <thead className="sticky top-0 bg-black/40">
              <tr className="text-gray-400">
                <th className="p-3">Material</th>
                <th className="p-3">Used</th>
                <th className="p-3">Output</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>

            <tbody>
              {finance.productions.length > 0 ? (
                finance.productions.map((p, i) => (
                  <tr key={i} className="border-b border-white/10 hover:bg-white/5">

                    <td className="p-3">{p.material}</td>
                    <td className="p-3">{p.usedQty}</td>
                    <td className="p-3">{p.outputQty}</td>
                    <td className="p-3 text-red-400">₹{p.cost}</td>
                    <td className="p-3">
                      {p.date
                        ? new Date(p.date).toLocaleDateString()
                        : "No Date"}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-3 text-gray-400" colSpan="5">
                    No expense data found
                  </td>
                </tr>
              )}
            </tbody>

          </table>

        </div>

      </div>

      {/* PROFIT TABLE */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">

        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Profit Summary</h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-black/40 text-gray-400">
              <tr>
                <th className="p-3">Income</th>
                <th className="p-3">Expense</th>
                <th className="p-3">Profit</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>

            <tbody>
              <tr className="text-center">

                <td className="p-3 text-green-400 font-bold">
                  ₹{finance.income.toLocaleString()}
                </td>

                <td className="p-3 text-red-400 font-bold">
                  ₹{finance.expense.toLocaleString()}
                </td>

                <td className="p-3 text-blue-400 font-bold">
                  ₹{finance.profit.toLocaleString()}
                </td>

                <td className="p-3">
                  {finance.profit >= 0
                    ? <span className="text-green-400">Profit</span>
                    : <span className="text-red-400">Loss</span>}
                </td>

              </tr>
            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}