import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Truck, Search, Calendar, MapPin, Package, Phone, ArrowLeft, CheckCircle2 } from "lucide-react";

interface TrackOrderPageProps {
  onBackToHome: () => void;
  shopWhatsAppNumber: string;
  initialOrderId?: string;
  initialMobile?: string;
}

const STAGES = ["pending", "confirmed", "packed", "dispatched", "delivered"];
const STAGE_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  dispatched: "Dispatched",
  delivered: "Delivered"
};

export default function TrackOrderPage({ 
  onBackToHome, 
  shopWhatsAppNumber,
  initialOrderId = "",
  initialMobile = ""
}: TrackOrderPageProps) {
  const [orderId, setOrderId] = useState(initialOrderId);
  const [mobile, setMobile] = useState(initialMobile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<any | null>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const handleTrack = async (e?: React.FormEvent, targetId?: string, targetMobile?: string) => {
    if (e) e.preventDefault();
    const queryId = targetId || orderId;
    const queryMobile = targetMobile !== undefined ? targetMobile : mobile;

    if (!queryId) {
      setError("Please fill in both Order ID and Mobile Number to track.");
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingData(null);

    try {
      let url = `/api/track-order?orderId=${encodeURIComponent(queryId.trim())}`;
      if (queryMobile && queryMobile.trim()) {
        url += `&mobile=${encodeURIComponent(queryMobile.trim())}`;
      }
      const resp = await fetch(url);
      const payload = await resp.json();
      
      if (!resp.ok || !payload.success) {
        setError(payload.error || "We couldn't locate an order with those credentials. Please verify your SNE Order ID.");
      } else {
        setTrackingData(payload);
        setOrderId(payload.order.id);
        setMobile(payload.order.customer_mobile);
      }
    } catch (err: any) {
      setError("Server communications failed. Please verify your internet connection or retry shortly.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Gather recent orders cache offline registry
    try {
      const stored = localStorage.getItem("sne_my_orders");
      if (stored) {
        setRecentOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Local storage lookup failed:", e);
    }

    // 2. Scan hash query variables for deep track triggers
    try {
      const hash = window.location.hash;
      const searchIndex = hash.indexOf('?');
      if (searchIndex !== -1) {
        const searchParams = new URLSearchParams(hash.slice(searchIndex));
        const urlId = searchParams.get('id') || searchParams.get('orderId');
        const urlMobile = searchParams.get('mobile') || "";
        if (urlId) {
          setOrderId(urlId);
          setMobile(urlMobile);
          handleTrack(undefined, urlId, urlMobile);
          return;
        }
      }
    } catch (e) {
      console.error("Deep link tracker parsing failed:", e);
    }

    if (initialOrderId && initialMobile) {
      setOrderId(initialOrderId);
      setMobile(initialMobile);
      handleTrack(undefined, initialOrderId, initialMobile);
    }
  }, [initialOrderId, initialMobile]);

  // Helper to compute stage details and highlight current progress
  const getStageIndex = (status: string) => {
    const s = String(status).toLowerCase();
    return STAGES.indexOf(s);
  };

  const currentStageIdx = trackingData ? getStageIndex(trackingData.order.status) : -1;

  // Compute estimated delivery date (Order Date + 3 working days)
  const getEstimatedDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      d.setDate(d.getDate() + 3);
      return d.toLocaleDateString("en-IN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    } catch {
      return "Calculated upon dispatch";
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 font-sans" id="track-order-portal">
      {/* Head section */}
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
            Order Shipment Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time status, packaging schedules, and transporter coordinates for Sri Narayana Enterprises dispatches.
          </p>
        </div>
        <div className="bg-[#003366]/5 px-4 py-2 border border-[#003366]/10 rounded-xl text-[11px] font-mono font-bold text-[#003366] flex items-center gap-1.5 self-start md:self-auto">
          <Truck size={14} className="text-[#FF7A00]" />
          <span>Track Any Consignment Instantly</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Entry Form & Recents */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-6">
            <h3 className="text-sm font-bold uppercase text-slate-800 tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Search size={14} className="text-[#FF7A00]" />
              <span>Lookup Credentials</span>
            </h3>

            <form onSubmit={handleTrack} className="space-y-4">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  SNE Order ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. SNE-10001"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 focus:border-[#003366] focus:bg-white rounded-xl text-xs font-bold tracking-wider placeholder-slate-400 focus:outline-none transition-all"
                  id="tracking-order-id-input"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Registered Mobile Number <span className="text-[10px] text-slate-400 font-normal lowercase font-sans">(optional)</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9848742012"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 focus:border-[#003366] focus:bg-white rounded-xl text-xs font-bold tracking-wider placeholder-slate-400 focus:outline-none transition-all"
                  id="tracking-mobile-input"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-xs font-medium text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-2 bg-[#FF7A00] hover:bg-orange-500 disabled:bg-slate-300 text-slate-950 font-black uppercase text-xs tracking-wider rounded-xl cursor-pointer active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                id="submit-tracking-btn"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    <span>Locating Shipment...</span>
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    <span>Track Order Shipment</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick instructions */}
            <div className="bg-slate-50 rounded-xl p-4 mt-6 text-[11px] text-slate-500 leading-relaxed border border-slate-100">
              <span className="font-bold text-slate-700 block mb-1">Logistics Verification:</span>
              Once placed, our dispatch center will phone you to finalize flatbeds before moving order timeline through the progress checklist.
            </div>
          </div>

          {/* Dynamic Recent Orders Listing */}
          {recentOrders.length > 0 && (
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-4">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2.5 border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-emerald-500" />
                <span>Your Recent Orders</span>
              </h4>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {recentOrders.map((ro) => (
                  <button
                    key={ro.id}
                    type="button"
                    onClick={() => {
                      setOrderId(ro.id);
                      setMobile(ro.mobile);
                      handleTrack(undefined, ro.id, ro.mobile);
                    }}
                    className="w-full text-left p-2.5 hover:bg-slate-50 border rounded-xl flex justify-between items-center transition-all cursor-pointer hover:border-slate-300 group"
                  >
                    <div>
                      <span className="font-mono text-xs font-black text-[#003366] block group-hover:text-[#FF7A00] transition-colors">{ro.id}</span>
                      <span className="text-[9px] text-slate-400 font-medium">
                        {new Date(ro.date).toLocaleDateString("en-IN", { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                    <span className="text-xs font-black text-slate-700 bg-slate-100 rounded-lg px-2 py-0.5">
                      ₹{ro.total}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Results View */}
        <div className="lg:col-span-7 space-y-6">
          {!trackingData ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400 select-none flex flex-col items-center justify-center h-full min-h-[300px]">
              <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-[#FF7A00]/60">
                <Truck size={32} />
              </div>
              <h4 className="text-slate-700 font-bold text-sm mb-1">Provide Credentials</h4>
              <p className="text-xs max-w-xs text-slate-500 leading-relaxed mx-auto">
                Enter your SNE reference number and register phone credentials to construct your live packaging timeline.
              </p>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Overview Header Card */}
              <div className="bg-[#003366] text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
                <div className="absolute right-0 top-0 translate-x-12 -translate-y-6 h-40 w-40 rounded-full bg-white/5 pointer-events-none" />
                
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4 relative z-10">
                  <div>
                    <span className="bg-white/15 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-widest font-black uppercase">
                      ACTIVE SHIPMENT
                    </span>
                    <h2 className="text-xl font-mono font-extrabold mt-1">{trackingData.order.id}</h2>
                    <p className="text-[10px] text-orange-200/80 mt-0.5">
                      Placed on {new Date(trackingData.order.created_at || trackingData.order.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-center self-start border border-white/5">
                    <span className="block text-[9px] uppercase tracking-wider text-orange-200 font-bold">Today's Status</span>
                    <span className="text-xs font-black uppercase tracking-wider text-[#FF7A00]">
                      {STAGE_LABELS[String(trackingData.order.status).toLowerCase()] || trackingData.order.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2 text-xs text-slate-200 relative z-10">
                  <div className="space-y-1.5">
                    <span className="text-orange-200/70 font-bold block text-[10px] uppercase">Recipient Profile:</span>
                    <p className="font-bold text-white text-sm">{trackingData.order.customer_name}</p>
                    <p className="font-mono text-[11px] opacity-90">{trackingData.order.customer_mobile}</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-orange-200/70 font-bold block text-[10px] uppercase">Destination Location:</span>
                    <p className="flex items-start gap-1 leading-relaxed text-[11px]">
                      <MapPin size={12} className="text-[#FF7A00] shrink-0 mt-0.5" />
                      <span>{trackingData.order.customer_address}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Stepper Tracking representation */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-6">
                  Delivery Progress Timeline
                </h4>

                <div className="relative">
                  {/* Progress Line Connector */}
                  <div className="hidden md:block absolute left-4 right-4 top-[14px] h-[3px] bg-slate-100" />
                  <div 
                    className="hidden md:block absolute left-4 top-[14px] h-[3px] bg-emerald-500 transition-all duration-500" 
                    style={{ 
                      width: `${currentStageIdx >= 0 ? (currentStageIdx / (STAGES.length - 1)) * 100 : 0}%` 
                    }}
                  />

                  {/* Vertical line fallback for Mobile screens */}
                  <div className="md:hidden absolute left-5 top-4 bottom-4 w-[2px] bg-slate-100" />
                  <div 
                    className="md:hidden absolute left-5 top-4 w-[2px] bg-emerald-500 transition-all duration-500" 
                    style={{ 
                      height: `${currentStageIdx >= 0 ? (currentStageIdx / (STAGES.length - 1)) * 100 : 0}%` 
                    }}
                  />

                  {/* Stepper items */}
                  <div className="flex flex-col md:flex-row md:justify-between gap-6 md:gap-2 relative z-10">
                    {STAGES.map((stage, idx) => {
                      const isActive = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;
                      const label = STAGE_LABELS[stage];

                      return (
                        <div key={stage} className="flex md:flex-col items-center md:text-center gap-3 md:gap-2 flex-1 relative">
                          {/* Circle Icon */}
                          <div 
                            className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 ${
                              isActive 
                                ? "bg-emerald-50 border-emerald-500 text-emerald-600" 
                                : "bg-white border-slate-200 text-slate-300"
                            } ${isCurrent ? "ring-4 ring-emerald-500/20 scale-110 shadow-md" : ""}`}
                          >
                            {isActive ? (
                              <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-50" />
                            ) : (
                              <span className="text-xs font-mono font-bold">{idx + 1}</span>
                            )}
                          </div>

                          {/* Label Texts */}
                          <div className="md:text-center text-left">
                            <p className={`text-[11px] font-black uppercase tracking-wider ${isActive ? "text-slate-800" : "text-slate-400"}`}>
                              {stage}
                            </p>
                            <p className="text-[10px] text-slate-500 leading-tight">
                              {label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimation box */}
                <div className="mt-8 bg-slate-50 rounded-xl p-4 flex items-center gap-3 border border-slate-100">
                  <Calendar className="text-[#FF7A00] shrink-0" size={18} />
                  <div className="text-xs">
                    <span className="text-slate-500 font-bold block text-[10px] uppercase">Estimated Materials Arrival:</span>
                    <span className="text-slate-800 font-extrabold text-xs">
                      {getEstimatedDate(trackingData.order.created_at || trackingData.order.date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ordered items listing summary inside Tracking portal */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-4 flex items-center gap-1.5">
                  <Package size={14} className="text-[#FF7A00]" />
                  <span>Consignment Package Summary</span>
                </h4>

                <div className="divide-y divide-slate-100 text-xs">
                  {trackingData.order.items.map((item: any, idx: number) => (
                    <div key={idx} className="py-3 flex justify-between items-center gap-4">
                      <div>
                        <p className="font-extrabold text-slate-800">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Size: {item.size} {item.colorName ? `| Shade: ${item.colorName} (${item.shadeCode})` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-slate-700">QTY: {item.quantity}</p>
                        <p className="text-[10px] text-slate-500 font-mono">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 flex justify-between items-center font-bold text-[#003366] text-sm">
                    <span>Outstanding Invoice Value</span>
                    <span className="text-[#FF7A00] font-mono text-base font-black">₹{trackingData.order.total}</span>
                  </div>
                </div>
              </div>

              {/* Direct Help Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`tel:+919848742012`}
                  className="flex-1 h-11 bg-[#003366] hover:bg-[#002244] text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2"
                >
                  <Phone size={13} />
                  <span>Call Showroom Direct</span>
                </a>
                <a
                  href={`https://wa.me/${shopWhatsAppNumber.replace(/\D/g, "")}?text=${encodeURIComponent(`*Status Inquiry for Order ${trackingData.order.id}*\n\nHello Sri Narayana Enterprises, I am checking status updates on my consignment reference ${trackingData.order.id}.`)}`}
                  target="_blank"
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase text-xs tracking-wider rounded-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.19 1.01 11.999 1.01c-5.444 0-9.866 4.372-9.87 9.802 0 1.814.504 3.59 1.46 5.162l-1.02 3.725 3.832-1.002h.156zm10.744-6.496c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  <span>Inquire via WhatsApp</span>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
