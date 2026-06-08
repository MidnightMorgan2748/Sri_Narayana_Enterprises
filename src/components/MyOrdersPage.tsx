import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Calendar, FileText, CheckCircle, Clock, Truck, ArrowRight, ArrowLeft } from "lucide-react";

interface MyOrdersPageProps {
  onBackToHome: () => void;
  onTrackOrder: (orderId: string, mobile: string) => void;
}

export default function MyOrdersPage({ onBackToHome, onTrackOrder }: MyOrdersPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError("Please key in your registered Mobile Number or Email ID.");
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const resp = await fetch(`/api/customer-orders?query=${encodeURIComponent(searchQuery.trim())}`);
      const payload = await resp.json();

      if (!resp.ok || !payload.success) {
        setError(payload.error || "lookup unsuccessful. Please crosscheck your parameters.");
        setOrders([]);
      } else {
        setOrders(payload.orders || []);
      }
    } catch (err) {
      setError("Communication latency. Check your internet connection before retrying.");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = String(status).toLowerCase();
    if (s === "pending") return "bg-amber-50 text-amber-700 border-amber-200";
    if (s === "confirmed") return "bg-blue-50 text-blue-700 border-blue-200";
    if (s === "packed") return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (s === "dispatched") return "bg-purple-50 text-purple-700 border-purple-200";
    if (s === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 font-sans" id="my-orders-lookup">
      {/* Header element */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button 
            onClick={onBackToHome}
            className="group flex items-center gap-1.5 text-slate-500 hover:text-[#003366] text-xs font-bold uppercase tracking-wider mb-2 select-none cursor-pointer"
          >
            <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-display font-extrabold text-[#003366] tracking-tight">
            My Purchase History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Search order invoices, products purchased, and track status values matching your trade profile.
          </p>
        </div>
      </div>

      {/* Central panel structure */}
      <div className="space-y-8">
        {/* Input panel bar */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6 max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Mobile Number or Email Address"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-4 pr-10 bg-slate-50 border border-slate-200 focus:border-[#003366] focus:bg-white rounded-xl text-xs font-bold tracking-wider focus:outline-none transition-all"
                id="orders-history-query-input"
              />
              <Search className="absolute right-3.5 top-3.5 text-slate-400" size={16} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 bg-[#003366] hover:bg-[#002244] disabled:bg-slate-300 text-white font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
              id="submit-lookup-history-btn"
            >
              {loading ? "Searching..." : "Locate Orders"}
            </button>
          </form>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100 mt-4">
              {error}
            </div>
          )}
        </div>

        {/* Results layout */}
        <div className="space-y-4">
          {!searched ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 select-none">
              <FileText size={40} className="mx-auto mb-3 opacity-40 text-[#FF7A00]" />
              <h4 className="text-slate-800 font-bold text-sm">Awaiting Entry Parameters</h4>
              <p className="text-xs max-w-xs text-slate-500 mx-auto mt-1">
                Verify your order statistics (totals, quantities, dates) by keying in your registered customer contact credentials above.
              </p>
            </div>
          ) : loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <span className="h-8 w-8 rounded-full border-3 border-[#003366] border-t-transparent animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-medium">Retrieving invoice caches from database...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
              <FileText size={40} className="mx-auto mb-3 text-slate-300" />
              <h4 className="text-slate-700 font-bold text-sm">No Orders Found</h4>
              <p className="text-xs max-w-md text-slate-500 mx-auto mt-1">
                We couldn't record any purchase matches matching "<span className="font-bold text-slate-800">{searchQuery}</span>". Be sure to check formatting or call Bestavaripeta showroom sales at +91 98487 42012.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-500 font-bold px-1" id="orders-found-count">
                FOUND {orders.length} ORDER INVOICES matching your inquiry:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {orders.map((order, idx) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Title and ID */}
                        <div className="flex justify-between items-center gap-2 mb-3">
                          <span className="font-mono text-xs font-black text-[#003366] bg-slate-100 px-2.5 py-1 rounded-lg">
                            {order.id}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 border rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4">
                          <Calendar size={12} className="text-[#FF7A00]" />
                          <span>
                            {new Date(order.created_at).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric"
                            })}
                          </span>
                        </div>

                        {/* Items preview list */}
                        <div className="border-t border-b border-slate-100 py-3 mb-4 space-y-1.5 text-xs">
                          {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-start gap-3">
                              <span className="text-slate-600 font-medium leading-relaxed truncate max-w-[200px]">
                                {item.name}
                              </span>
                              <span className="text-slate-400 font-mono shrink-0">
                                {item.quantity} {item.size}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Total and Action tracking trigger link */}
                      <div className="flex justify-between items-center pt-1">
                        <div>
                          <span className="block text-[9px] uppercase tracking-wider text-slate-400">Total Price</span>
                          <span className="text-sm font-black text-[#003366] font-mono">₹{order.total}</span>
                        </div>

                        <button
                          onClick={() => onTrackOrder(order.id, order.customer_mobile)}
                          className="px-4 py-1.5 bg-[#FF7A00]/10 hover:bg-[#FF7A00] text-[#FF7A00] hover:text-slate-950 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center gap-1 group"
                        >
                          <span>Track Shipment</span>
                          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
