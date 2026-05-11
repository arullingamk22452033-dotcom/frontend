import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function InvoiceView() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        // Clean the ID (remove any quotes or extra whitespace)
        const cleanId = id?.replace(/^"|"$/g, '').trim();
        if (!cleanId) {
          throw new Error("Invalid invoice ID");
        }

        // Use dynamic backend URL (adapt to your setup)
        const backendUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
        const response = await axios.get(`${backendUrl}/invoices/${cleanId}`);
        
        if (response.data) {
          setInvoice(response.data);
        } else {
          throw new Error("No invoice data received");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.response?.data?.message || err.message || "Invoice not found");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchInvoice();
    } else {
      setError("No invoice ID provided");
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl">Loading invoice...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-md">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <p className="text-sm mt-2">Invoice ID: {id}</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-lg">
          No invoice data available.
        </div>
      </div>
    );
  }

  // Render the bill (clean layout, no sidebar)
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 md:p-10">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">MillFlow</h1>
              <p className="text-gray-500 font-medium tracking-widest text-sm mt-1">FACTORY INVOICE</p>
            </div>
            <div className="text-right">
              <h2 className="text-3xl font-light text-gray-400">INVOICE</h2>
              <p className="text-sm font-bold text-gray-600 mt-2">ID: #{invoice._id?.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          {/* Customer info */}
          <div className="border-t border-b border-gray-200 py-4 mb-6 text-sm flex justify-between">
            <div>
              <p className="text-gray-500">Billed To:</p>
              <p className="font-bold text-gray-800 text-base">{invoice.customerName}</p>
              {invoice.customerPhone && (
                <p className="text-xs text-gray-500 mt-1">{invoice.customerPhone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-gray-500">Date:</p>
              <p className="font-semibold text-gray-800">
                {new Date(invoice.date).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm mb-6">
              <thead>
                <tr className="bg-gray-100 text-gray-600 border-b-2 border-gray-300">
                  <th className="py-3 px-4 text-left font-bold">Item Description</th>
                  <th className="py-3 px-4 text-center font-bold">Qty</th>
                  <th className="py-3 px-4 text-right font-bold">Price</th>
                  <th className="py-3 px-4 text-right font-bold">Total</th>
                 </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-800">{item.name}</td>
                    <td className="py-3 px-4 text-center">{item.qty}</td>
                    <td className="py-3 px-4 text-right">₹{item.price}</td>
                    <td className="py-3 px-4 text-right font-bold">₹{item.price * item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-72 bg-gray-50 rounded-xl border border-gray-200 p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold">₹{invoice.total?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
                <span className="text-gray-800 font-bold uppercase text-sm">Grand Total</span>
                <span className="font-black text-2xl text-blue-600 tracking-tighter">
                  ₹{invoice.total?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-gray-400 text-xs font-medium border-t border-gray-200 pt-6">
            <p>Thank you for doing business with MillFlow.</p>
            <p>This is a computer-generated invoice and requires no signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
}