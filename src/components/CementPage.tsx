import React, { useState, useMemo } from "react";
import { HardHat, ShoppingCart, Send, Info, Layers, CheckCircle2, Calculator, ShieldCheck, Check } from "lucide-react";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import kcpCementBagImg from "../assets/images/kcp_cement_bag_1780307331661.png";

interface CementPageProps {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onWhatsAppOrder: (item: Omit<CartItem, "id">) => void;
  prices: Record<string, number>;
}

export default function CementPage({ onAddToCart, onWhatsAppOrder, prices }: CementPageProps) {
  // Quantities states
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "KCP OPC 53 Grade": 10,
    "KCP PPC Cement": 10
  });

  const [notif, setNotif] = useState<Record<string, boolean>>({});

  // Dynamic Slab Cement Volume Estimator State
  const [slabArea, setSlabArea] = useState<number>(500);
  const [slabThickness, setSlabThickness] = useState<number>(4); // default 4-inch standard roofing slab

  const products = [
    {
      id: "opc",
      name: "KCP OPC 53 Grade",
      grade: "53 Grade - Heavy RCC structures",
      bagName: "KCP OPC 53 Grade",
      recommendedFor: "Reinforced cement concrete frames, heavy foundation pilings, high-stress structural columns, beams, girders, and high-tensile slab casting.",
      bannerColor: "from-[#071A35] via-slate-900 to-[#FF7A00]/40",
      description: "KCP Ordinary Portland Cement (OPC) 53 Grade delivers ultimate hydration compressive strength, quick hardening performance, and superior density properties.",
      pros: ["Exceptional 28-day strength (53 MPa)", "Faster primary structural setting rate", "Certified high-load structural tolerance", "Low limestone clinker shrinkage ratio"]
    },
    {
      id: "ppc",
      name: "KCP PPC Cement",
      grade: "Pozzolana - Plastering & General Masonry",
      bagName: "KCP PPC Cement",
      recommendedFor: "General brick laying mortar, fine interior plaster overlaying, wet structural sub-foundations, floor tiling bases, and protective chemical coatings.",
      bannerColor: "from-amber-600 via-[#FF7A00] to-orange-850",
      description: "KCP Portland Pozzolana Cement (PPC) offers highly adhesive hydraulic bondings, premium resistance to acidic/sulphate attacks, and uniform water sealing.",
      pros: ["Prevents post-curing shrinkage cracks", "High chemical and marine sulphate defense", "Superior plastic retention for butter-smooth plastering", "Eco-friendly pozzolanic micro-filler blending"]
    }
  ];

  const handleQuickQuantity = (prodBagName: string, bags: number) => {
    setQuantities(prev => ({ ...prev, [prodBagName]: bags }));
  };

  const handleCustomQuantity = (prodBagName: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 1) {
      setQuantities(prev => ({ ...prev, [prodBagName]: num }));
    }
  };

  const handleIncrement = (prodBagName: string, amount: number) => {
    setQuantities(prev => ({ ...prev, [prodBagName]: Math.max(1, prev[prodBagName] + amount) }));
  };

  const getPrice = (prodBagName: string) => {
    return prices[prodBagName] || (prodBagName.includes("OPC") ? 480 : 440);
  };

  const handleAdd = (prodBagName: string) => {
    const qty = quantities[prodBagName];
    const price = getPrice(prodBagName);

    onAddToCart({
      type: "cement",
      name: prodBagName,
      size: `${qty} ${qty === 1 ? 'Bag' : 'Bags'} (50kg ea)`,
      quantity: qty,
      price: price
    });

    setNotif(prev => ({ ...prev, [prodBagName]: true }));
    setTimeout(() => {
      setNotif(prev => ({ ...prev, [prodBagName]: false }));
    }, 1200);
  };

  const handleWhatsApp = (prodBagName: string) => {
    const qty = quantities[prodBagName];
    const price = getPrice(prodBagName);

    onWhatsAppOrder({
      type: "cement",
      name: prodBagName,
      size: `${qty} ${qty === 1 ? 'Bag' : 'Bags'} (50kg)`,
      quantity: qty,
      price: price
    });
  };

  // Indian concrete standard rule-of-thumb:
  // For standard M20 mix (1:1.5:3 cement:sand:aggregate):
  // 100 sqft with 4-inch thickness requires roughly 12-14 bags of 50kg cement.
  const computedCementBags = useMemo(() => {
    const totalVolumeCuFt = (slabArea * (slabThickness / 12));
    const factorM20Bags = totalVolumeCuFt * 0.32; // ~0.32 bags per cu ft of finished M20 concrete
    return Math.max(1, Math.ceil(factorM20Bags));
  }, [slabArea, slabThickness]);

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-20 font-sans">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#030E1E] to-[#071A35] text-white py-14 px-4 md:px-8 border-b border-[#FF7A00]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 text-left">
            <span className="bg-[#FF7A00]/20 text-[#FFC857] text-[10px] px-3.5 py-1 rounded-full font-mono font-bold tracking-widest uppercase">
              HEAVY FOUNDATIONS CORE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight">
              KCP Factory Cement
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Fulfill bulk housing site quotes instantly. We stock genuine OPC 53 Grade concrete anchors and premium waterproof Pozzolana (PPC) 50KG bags direct from mills.
            </p>
          </div>
          
          <div className="flex bg-white/5 border border-white/10 rounded-[24px] p-5 items-center gap-4 text-left max-w-md">
            <ShieldCheck className="text-[#FF7A00] shrink-0" size={24} />
            <div>
              <h5 className="text-xs font-bold text-white uppercase font-sans">FACTORY DIRECT SUPPLY</h5>
              <p className="text-[10px] text-white/60">Fully tracked bulk dispatch lists with live logistics metrics.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        
        {/* Interactive Cement Slab Estimator Box */}
        <section className="glass-panel rounded-[32px] p-6 lg:p-10 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#FF7A00] font-bold font-mono">
              <Calculator size={14} />
              <span>ROOF SLAB & COATED CONCRETE VOLUME ESTIMATOR</span>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#071A35]">
              Calculate Concrete Curing Bags
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Plan concrete ratios smoothly. Supply slab floor dimensions in square feet with your targeted structural thickness in inches to get the exact KCP Bag count.
            </p>

            <form className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">Target Slab Floor Area (Sq. Ft)</label>
                <input 
                  type="number"
                  value={slabArea}
                  onChange={(e) => setSlabArea(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-200 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">Slab Thickness Ratio (Inches)</label>
                <div className="flex gap-2">
                  {[3, 4, 5, 6].map((inchValue) => (
                    <button
                      key={inchValue}
                      type="button"
                      onClick={() => setSlabThickness(inchValue)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        slabThickness === inchValue 
                          ? "bg-[#071A35] text-white shadow-md"
                          : "bg-slate-100 text-[#071A35]/70 hover:bg-slate-200"
                      }`}
                    >
                      {inchValue}" Thickness
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#071A35] text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Visual backdrop graphic */}
            <div className="absolute right-[-10px] bottom-[-20px] text-white/[0.04] font-black text-9xl select-none font-mono">
              CEMENT
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#FFC857] uppercase tracking-widest">
                Recommended Standard Dispatch Quote
              </h4>
              <p className="text-xs text-white/70">
                Calculated on Indian M20 structural grade cement casting standards (1 : 1.5 : 3 concrete proportions):
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-left">
                <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">Calculated Cement Bags</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#FF7A00] font-mono">{computedCementBags} Bags</strong>
                <p className="text-[8px] text-white/40 mt-1">Approximate mass count of 50KG ea</p>
              </div>
              <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-left">
                <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">Total Metric Mass Weight</span>
                <strong className="text-2xl sm:text-3xl font-black text-[#FFC857] font-mono">{computedCementBags * 50} KG</strong>
                <p className="text-[8px] text-white/40 mt-1">~{( (computedCementBags * 50) / 1000).toFixed(2)} Metric Tons</p>
              </div>
            </div>

            <div className="text-[10px] text-white/50 border-t border-white/10 pt-4 flex items-center gap-2">
              <Info size={12} className="text-[#FFC857]" />
              <span>Select this quantum of bags directly in our product cards below for your site transport!</span>
            </div>
          </div>
        </section>

        {/* Cement Products List */}
        <section className="space-y-12 max-w-5xl mx-auto" id="cement-cards-panel">
          {products.map((product) => {
            const qty = quantities[product.bagName] || 10;
            const price = getPrice(product.bagName);
            const total = price * qty;
            const isAdded = notif[product.bagName];

            return (
              <motion.div 
                key={product.id}
                whileHover={{ 
                  y: -8,
                  borderColor: "#10b981",
                  boxShadow: "0 25px 45px -12px rgba(16, 185, 129, 0.22)"
                }}
                className="bg-white rounded-[32px] border border-slate-200/80 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row text-left"
              >
                {/* Left Visual Area */}
                <div className="bg-[#071A35] text-white p-8 md:w-2/5 flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 pointer-events-none" />
                  
                  {/* Glowing thin ribbon in emerald */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-yellow-400" />

                  <div className="relative z-10">
                    <span className="inline-block bg-[#FF7A00] text-white text-[9px] font-mono font-bold uppercase px-3 py-1 rounded-full mb-3 tracking-widest border border-orange-600/35">
                      {product.grade}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase font-sans">
                      KCP {product.id.toUpperCase()}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                      {product.description}
                    </p>
                  </div>

                  {/* KCP Official Cement Bag Mockup Image */}
                  <div className="relative z-10 my-6 flex justify-center">
                    <div className="bg-white p-2 rounded-2xl shadow-xl max-w-[140px] overflow-hidden transform hover:rotate-2 hover:scale-105 transition-all">
                      <img 
                        src={kcpCementBagImg} 
                        alt="Official KCP Cement 50KG Bag Packing" 
                        className="w-full h-auto object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4 mt-auto relative z-10">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Target Structural Area
                    </span>
                    <p className="text-xs text-[#FFC857] font-semibold leading-relaxed font-sans">
                      {product.recommendedFor}
                    </p>
                  </div>
                </div>

                {/* Right Selection details */}
                <div className="p-8 flex-1 flex flex-col justify-between space-y-6 bg-white">
                  {/* Pros list */}
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                      Physical Lab Merit Checklist
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {product.pros.map((pro, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-2 text-xs text-slate-600 font-sans">
                          <Check size={14} className="text-[#FF7A00] shrink-0 mt-0.5" />
                          <span>{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Quantity Buttons */}
                  <div className="border-t border-slate-100 pt-5 text-left">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        Quick Quantum Select (Save Bulk Order)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono text-right">Standard 50kg Bags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[10, 20, 50, 100, 200].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleQuickQuantity(product.bagName, num)}
                          className={`py-2.5 px-3.5 text-xs font-bold font-mono border rounded-xl transition-all cursor-pointer ${
                            qty === num
                              ? "bg-[#071A35] border-[#071A35] text-white shadow-xl scale-[1.02]"
                              : "border-slate-200 text-[#071A35]/70 hover:bg-slate-50"
                          }`}
                        >
                          {num} Bag{num > 1 ? 's' : ''} ({(num * 50 / 1000).toFixed(1)} MT)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom quantities adjustment section */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/60 font-sans">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">
                        Manual bags adjustment
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleIncrement(product.bagName, -5)}
                          className="h-9 w-9 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                        >
                          -5
                        </button>
                        
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) => handleCustomQuantity(product.bagName, e.target.value)}
                          className="w-16 h-9 text-center font-bold text-[#071A35] border border-slate-200 rounded-lg bg-white outline-none focus:border-[#FF7A00] font-mono text-sm"
                          min="1"
                        />

                        <button
                          onClick={() => handleIncrement(product.bagName, 5)}
                          className="h-9 w-9 bg-white border border-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                        >
                          +5
                        </button>
                        <span className="text-xs text-slate-400 font-mono ml-2">Bags total</span>
                      </div>
                    </div>

                    <div className="text-right leading-tight">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">
                        Price Valuation
                      </span>
                      <span className="text-2xl font-black text-[#071A35] font-mono">
                        ₹{total}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">₹{price} / individual Bag</p>
                    </div>
                  </div>

                  {/* Actions line */}
                  <div className="flex flex-col sm:flex-row gap-3.5 border-t border-slate-100 pt-5">
                    <AnimatePresence mode="wait">
                      {isAdded ? (
                        <motion.div 
                          key="cementAdded"
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0.95 }}
                          className="flex-1 bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold py-3.5 text-center rounded-2xl text-xs flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          <span>Successfully Added to Cart!</span>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => handleAdd(product.bagName)}
                          className="flex-1 bg-gradient-to-r from-[#071A35] to-slate-900 hover:from-slate-900 hover:to-[#071A35] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer hover:scale-[1.01]"
                        >
                          <ShoppingCart size={14} />
                          <span>Add Cement Bags</span>
                        </button>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => handleWhatsApp(product.bagName)}
                      className="flex-1 bg-gradient-to-r from-[#FF7A00] to-amber-500 hover:from-amber-500 hover:to-[#FF7A00] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest cursor-pointer hover:scale-[1.01]"
                    >
                      <Send size={12} />
                      <span>Order via WhatsApp</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

      </div>
    </div>
  );
}
