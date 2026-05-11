import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaBoxOpen, FaEdit, FaTrash, FaPlus, FaExclamationCircle, FaCheckCircle, FaSearch } from "react-icons/fa";

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [minLevel, setMinLevel] = useState("");
  const [price, setPrice] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const role = localStorage.getItem("role");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    const res = await axios.get("http://localhost:5000/api/inventory");
    setItems(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/inventory/${editId}`, {
          name, quantity, minLevel, price
        });
      } else {
        await axios.post("http://localhost:5000/api/inventory", {
          name, quantity, minLevel, price
        });
      }

      resetForm();
      fetchInventory();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item permanently?")) return;
    await axios.delete(`http://localhost:5000/api/inventory/${id}`);
    fetchInventory();
  };

  const handleEdit = (item) => {
    setName(item.name);
    setQuantity(item.quantity);
    setMinLevel(item.minLevel);
    setPrice(item.price);
    setEditId(item._id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setName("");
    setQuantity("");
    setMinLevel("");
    setPrice("");
    setEditId(null);
    setIsModalOpen(false);
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <FaBoxOpen className="text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Inventory Management</h1>
            <p className="text-gray-400 mt-1">Track materials, prices, and stock levels</p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Search materials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          {role === "admin" && (
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 whitespace-nowrap"
            >
              <FaPlus /> Add Item
            </button>
          )}
        </div>
      </div>

      {role === "staff" && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
          <FaExclamationCircle className="text-amber-400 text-xl" />
          <span className="font-medium">Staff Account: You have view-only access to the inventory.</span>
        </div>
      )}

      {/* TABLE */}
      <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-black/40 text-gray-400 text-sm uppercase tracking-wider border-b border-white/10">
                <th className="p-4 font-semibold">Material</th>
                <th className="p-4 font-semibold text-center">In Stock</th>
                <th className="p-4 font-semibold text-center">Min Level</th>
                <th className="p-4 font-semibold">Price (₹)</th>
                <th className="p-4 font-semibold">Status</th>
                {role === "admin" && <th className="p-4 font-semibold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <motion.tr 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.05 }}
                      key={item._id} 
                      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-4">
                        <span className="font-medium text-gray-200 group-hover:text-white transition-colors text-lg">{item.name}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`font-mono text-lg font-bold ${item.quantity <= item.minLevel ? 'text-rose-400' : 'text-gray-300'}`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-500 font-mono">{item.minLevel}</td>
                      <td className="p-4">
                        <span className="text-gray-300 font-mono font-medium tracking-wide">₹{item.price}</span>
                      </td>
                      <td className="p-4">
                        {item.quantity <= item.minLevel ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <FaCheckCircle /> Healthy
                          </span>
                        )}
                      </td>
                      {role === "admin" && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors border border-blue-500/20"
                              title="Edit Item"
                            >
                              <FaEdit />
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white rounded-lg transition-colors border border-rose-500/20"
                              title="Delete Item"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FaBoxOpen className="text-6xl mb-4 opacity-20" />
                        <p className="text-xl font-medium">No inventory items found.</p>
                        {searchTerm && <p className="text-sm mt-1">Try adjusting your search.</p>}
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIN MODAL */}
      <AnimatePresence>
        {isModalOpen && role === "admin" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl p-6 w-full max-w-md"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                {editId ? "Edit Item ✏️" : "Add New Item 📦"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Material Name</label>
                  <input
                    className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="e.g. Cotton Yarn"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Quantity</label>
                    <input
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      type="number"
                      min="0"
                      placeholder="0"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-400 mb-1">Min Level</label>
                    <input
                      className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                      type="number"
                      min="0"
                      placeholder="Alert threshold"
                      value={minLevel}
                      onChange={(e) => setMinLevel(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-400 mb-1">Price (₹)</label>
                  <input
                    className="w-full bg-black/30 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-3 rounded-xl shadow-lg transition-transform hover:scale-105"
                  >
                    {editId ? "Update Item" : "Save Item"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
 
export default Inventory;