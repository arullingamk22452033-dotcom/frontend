import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileInvoice,
  FaPlus,
  FaPrint,
  FaTimes,
  FaBox,
  FaTrash,
  FaFileExcel,
  FaSearch,
  FaWhatsapp,
} from "react-icons/fa";

import { exportToExcel } from "../utils/excelExport";

// ================= URL CONFIG =================
const BACKEND_URL = "";
const FRONTEND_URL = "";

const getApiBase = () => {
  if (BACKEND_URL) return `${BACKEND_URL}/api`;
  return `${window.location.protocol}//${window.location.hostname}:5000/api`;
};

const getFrontendOrigin = () => {
  if (FRONTEND_URL) return FRONTEND_URL;
  return `${window.location.protocol}//${window.location.hostname}:3000`;
};
// ==============================================

export default function InvoicePage() {
  const navigate = useNavigate();

  const [customer, setCustomer] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [items, setItems] = useState([
    {
      name: "",
      qty: 1,
      price: 0,
    },
  ]);

  const [invoices, setInvoices] = useState([]);
  const [inventory, setInventory] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const API = getApiBase();

  // ================= FETCH =================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [invoiceRes, inventoryRes] = await Promise.all([
        axios.get(`${API}/invoices`),
        axios.get(`${API}/inventory`),
      ]);

      setInvoices(invoiceRes.data || []);
      setInventory(inventoryRes.data || []);
    } catch (error) {
      console.log("Fetch Error:", error);
    }
  };

  // ================= ITEM CHANGE =================
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];

    updatedItems[index][field] = value;

    // Auto set price
    if (field === "name") {
      const selectedInventory = inventory.find(
        (item) => item.name === value
      );

      if (selectedInventory) {
        updatedItems[index].price = selectedInventory.price || 0;
      }
    }

    setItems(updatedItems);
  };

  // ================= ADD / REMOVE =================
  const addItemRow = () => {
    setItems([
      ...items,
      {
        name: "",
        qty: 1,
        price: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
  };

  // ================= TOTAL =================
  const liveTotal = items.reduce((total, item) => {
    return total + Number(item.qty || 0) * Number(item.price || 0);
  }, 0);

  // ================= CREATE INVOICE =================
  const createInvoice = async (e) => {
    e.preventDefault();

    if (!customer.trim()) {
      alert("Enter customer name");
      return;
    }

    const invalidItem = items.some(
      (item) =>
        !item.name ||
        Number(item.qty) <= 0 ||
        Number(item.price) < 0
    );

    if (invalidItem) {
      alert("Please fill all item fields correctly");
      return;
    }

    // ===== STOCK CHECK =====
    const lowStockItems = [];

    items.forEach((billItem) => {
      const stockItem = inventory.find(
        (inv) => inv.name === billItem.name
      );

      if (!stockItem) return;

      const remaining =
        Number(stockItem.quantity) - Number(billItem.qty);

      if (remaining < 0) {
        lowStockItems.push(
          `${stockItem.name} (Out of Stock)`
        );
      } else if (remaining <= Number(stockItem.minLevel || 0)) {
        lowStockItems.push(
          `${stockItem.name} (Low Stock)`
        );
      }
    });

    if (lowStockItems.length > 0) {
      alert(
        "⚠️ Low Stock Alert:\n\n" +
          lowStockItems.join("\n")
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customerName: customer,
        customerPhone,
        items,
      };

      const response = await axios.post(
        `${API}/invoices`,
        payload
      );

      setCustomer("");
      setCustomerPhone("");

      setItems([
        {
          name: "",
          qty: 1,
          price: 0,
        },
      ]);

      await fetchData();

      setSelectedInvoice(response.data);

      alert("✅ Invoice Created Successfully");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Failed to create invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE =================
  const deleteInvoice = async (id, customerName) => {
    const confirmDelete = window.confirm(
      `Delete invoice for ${customerName}?`
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await axios.delete(`${API}/invoices/${id}`);

      await fetchData();

      alert("✅ Invoice Deleted");
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Delete failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= EXPORT =================
  const exportAllInvoices = () => {
    const formatted = invoices.map((inv) => ({
      Customer: inv.customerName,
      Phone: inv.customerPhone || "-",
      Total: inv.total || 0,
      Items: inv.items?.length || 0,
      Date: inv.date
        ? new Date(inv.date).toLocaleDateString()
        : "-",
    }));

    exportToExcel(formatted, "Invoices_History");
  };

  // ================= SEARCH =================
  const filteredInvoices = invoices.filter((invoice) => {
    return (
      invoice.customerName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      invoice._id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  // ================= SHARE =================
  const shareInvoiceOnWhatsApp = (invoice) => {
    if (!invoice?._id) {
      alert("Invoice ID missing");
      return;
    }

    const cleanId = invoice._id.toString();

    const invoiceLink = `${getFrontendOrigin()}/bill/${cleanId}`;

    const message = `🏭 *MillFlow Invoice*\n\n🔗 ${invoiceLink}`;

    const encodedMessage = encodeURIComponent(message);

    const phone = invoice.customerPhone || "";

    const whatsappUrl = phone
      ? `https://wa.me/${phone.replace(
          /^\+/,
          ""
        )}?text=${encodedMessage}`
      : `https://wa.me/?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print-hidden">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 p-3 rounded-xl border border-blue-500/30 text-blue-400">
            <FaFileInvoice className="text-2xl" />
          </div>

          <div>
            <h1 className="text-3xl font-black text-white">
              Invoice System
            </h1>

            <p className="text-gray-400">
              Generate bills and track sales
            </p>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => navigate("/admin/history")}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold px-4 py-2 rounded-xl"
          >
            View History
          </button>

          <button
            onClick={exportAllInvoices}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold px-4 py-2 rounded-xl"
          >
            <FaFileExcel />
            Export
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 print-hidden">
        {/* LEFT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaPlus />
              New Invoice
            </h2>

            <div className="text-right">
              <p className="text-sm text-gray-400">
                Total Amount
              </p>

              <p className="text-3xl font-black text-emerald-400">
                ₹ {liveTotal.toLocaleString()}
              </p>
            </div>
          </div>

          <form
            onSubmit={createInvoice}
            className="space-y-5"
          >
            {/* CUSTOMER */}
            <input
              type="text"
              placeholder="Customer Name"
              value={customer}
              onChange={(e) =>
                setCustomer(e.target.value)
              }
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3"
              required
            />

            {/* PHONE */}
            <input
              type="tel"
              placeholder="+919876543210"
              value={customerPhone}
              onChange={(e) =>
                setCustomerPhone(e.target.value)
              }
              className="w-full bg-black/30 border border-white/10 text-white rounded-xl px-4 py-3"
            />

            {/* ITEMS */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-gray-400 font-semibold">
                  Items
                </p>

                <button
                  type="button"
                  onClick={addItemRow}
                  className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg flex items-center gap-2"
                >
                  <FaPlus />
                  Add
                </button>
              </div>

              <AnimatePresence>
                {items.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col md:flex-row gap-3 bg-black/20 p-3 rounded-xl"
                  >
                    {/* ITEM */}
                    <select
                      value={item.name}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "name",
                          e.target.value
                        )
                      }
                      className="flex-1 bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2"
                      required
                    >
                      <option value="">
                        Select Item
                      </option>

                      {inventory.map((inv) => (
                        <option
                          key={inv._id}
                          value={inv.name}
                        >
                          {inv.name} ({inv.quantity})
                        </option>
                      ))}
                    </select>

                    {/* QTY */}
                    <input
                      type="number"
                      min="1"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "qty",
                          Number(e.target.value)
                        )
                      }
                      className="w-full md:w-24 bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2"
                    />

                    {/* PRICE */}
                    <input
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(
                          index,
                          "price",
                          Number(e.target.value)
                        )
                      }
                      className="w-full md:w-32 bg-black/40 border border-white/10 text-white rounded-lg px-3 py-2"
                    />

                    {/* REMOVE */}
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeItemRow(index)
                        }
                        className="bg-red-500 text-white px-3 rounded-lg"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl"
            >
              {loading
                ? "Generating..."
                : "Generate Invoice"}
            </button>
          </form>
        </div>

        {/* RIGHT */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[750px]">
          <div className="p-5 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-white font-bold flex items-center gap-2">
              <FaFileInvoice />
              Invoice History
            </h2>

            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-500" />

              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) =>
                  setSearchTerm(e.target.value)
                }
                className="bg-black/40 border border-white/10 text-white rounded-full pl-10 pr-4 py-2"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {filteredInvoices.length > 0 ? (
              filteredInvoices.map((inv) => (
                <div
                  key={inv._id}
                  className="bg-white/10 border border-white/10 rounded-xl p-5"
                >
                  <div className="flex justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {inv.customerName}
                      </h3>

                      <p className="text-gray-400 text-sm">
                        {inv.customerPhone}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-500 text-xs">
                        #
                        {inv._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </p>

                      <p className="text-gray-400 text-sm">
                        {inv.date
                          ? new Date(
                              inv.date
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="my-4 border-y border-white/10 py-3 space-y-2">
                    {inv.items?.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-gray-300">
                          {item.name} x{item.qty}
                        </span>

                        <span className="text-gray-400">
                          ₹
                          {(
                            item.qty * item.price
                          ).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* FOOTER */}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setSelectedInvoice(inv)
                        }
                        className="bg-blue-500 text-white p-3 rounded-lg"
                      >
                        <FaPrint />
                      </button>

                      <button
                        onClick={() =>
                          deleteInvoice(
                            inv._id,
                            inv.customerName
                          )
                        }
                        className="bg-red-500 text-white p-3 rounded-lg"
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-gray-400 text-xs">
                        Total
                      </p>

                      <h3 className="text-2xl font-black text-emerald-400">
                        ₹
                        {Number(
                          inv.total || 0
                        ).toLocaleString()}
                      </h3>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col justify-center items-center text-gray-500">
                <FaFileInvoice className="text-5xl mb-3" />

                <p>No invoices found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden"
            >
              {/* HEADER */}
              <div className="bg-gray-100 p-4 flex justify-between items-center">
                <h2 className="font-bold">
                  Invoice Preview
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <FaPrint />
                    Print
                  </button>

                  <button
                    onClick={() =>
                      shareInvoiceOnWhatsApp(
                        selectedInvoice
                      )
                    }
                    className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                  >
                    <FaWhatsapp />
                    Share
                  </button>

                  <button
                    onClick={() =>
                      setSelectedInvoice(null)
                    }
                    className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* BODY */}
              <div className="p-8 text-black">
                <div className="flex justify-between border-b pb-4 mb-6">
                  <div>
                    <h1 className="text-4xl font-black">
                      MillFlow
                    </h1>

                    <p className="text-gray-500">
                      FACTORY INVOICE
                    </p>
                  </div>

                  <div className="text-right">
                    <h2 className="text-3xl font-light">
                      INVOICE
                    </h2>

                    <p className="text-sm mt-2">
                      #
                      {selectedInvoice._id
                        ?.slice(-6)
                        .toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* CUSTOMER */}
                <div className="flex justify-between mb-6">
                  <div>
                    <p className="text-gray-500">
                      Customer
                    </p>

                    <h3 className="font-bold text-lg">
                      {
                        selectedInvoice.customerName
                      }
                    </h3>

                    <p className="text-sm text-gray-500">
                      {
                        selectedInvoice.customerPhone
                      }
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-gray-500">
                      Date
                    </p>

                    <p>
                      {new Date(
                        selectedInvoice.date ||
                          Date.now()
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* TABLE */}
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-100">
                      <th className="text-left py-3 px-3">
                        Item
                      </th>

                      <th className="py-3 px-3">
                        Qty
                      </th>

                      <th className="text-right py-3 px-3">
                        Price
                      </th>

                      <th className="text-right py-3 px-3">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedInvoice.items?.map(
                      (item, index) => (
                        <Fragment key={index}>
                          <tr className="border-b">
                            <td className="py-3 px-3">
                              {item.name}
                            </td>

                            <td className="text-center py-3 px-3">
                              {item.qty}
                            </td>

                            <td className="text-right py-3 px-3">
                              ₹{item.price}
                            </td>

                            <td className="text-right py-3 px-3 font-bold">
                              ₹
                              {(
                                item.qty *
                                item.price
                              ).toLocaleString()}
                            </td>
                          </tr>

                          <tr>
                            <td
                              colSpan="4"
                              className="text-right text-xs pr-4 pb-2"
                            >
                              {item.lowStock ? (
                                <span className="text-red-500">
                                  ⚠ Low Stock:
                                  Only{" "}
                                  {item.balance}{" "}
                                  left
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  Balance:{" "}
                                  {item.balance ||
                                    0}
                                </span>
                              )}
                            </td>
                          </tr>
                        </Fragment>
                      )
                    )}
                  </tbody>
                </table>

                {/* TOTAL */}
                <div className="flex justify-end mt-8">
                  <div className="w-72 bg-gray-100 p-5 rounded-xl">
                    <div className="flex justify-between">
                      <span>Subtotal</span>

                      <span className="font-bold">
                        ₹
                        {Number(
                          selectedInvoice.total || 0
                        ).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex justify-between mt-4 border-t pt-4">
                      <span className="font-bold">
                        Grand Total
                      </span>

                      <span className="text-2xl font-black text-blue-600">
                        ₹
                        {Number(
                          selectedInvoice.total || 0
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="text-center text-gray-400 text-xs mt-12 border-t pt-5">
                  Thank you for doing business with
                  MillFlow
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          .print-hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}