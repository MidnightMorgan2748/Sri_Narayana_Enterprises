import React, { useState, useMemo } from "react";
import { Info, ShoppingCart, Send, ShieldCheck, CheckCircle2, Calculator, HelpCircle, Layers, Check } from "lucide-react";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PuttyPageProps {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onWhatsAppOrder: (item: Omit<CartItem, "id">) => void;
  prices: Record<string, number>;
}

export default function PuttyPage({ onAddToCart, onWhatsAppOrder, prices }: PuttyPageProps) {
  // Selection states
  const [selectedSize, setSelectedSize] = useState<Record<string, string>>({
    "White Wall Putty": "40 KG",
    "Waterproof Wall Putty": "40 KG"
  });
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "White Wall Putty": 1,
    "Waterproof Wall Putty": 1
  });

  const [notif, setNotif] = useState<Record<string, boolean>>({});

  // Dynamic Calculator states
  const [wallArea, setWallArea] = useState<number>(1000);
  const [calcCoats, setCalcCoats] = useState<number>(2);

  const products = [
    {
      id: "white",
      name: "White Wall Putty",
      tagline: "Fine White Alabaster Finished Undercoat",
      bannerColor: "from-[#071A35] via-slate-900 to-indigo-950",
      description: "Our premium finely pulverized white cement-based base undercoat, custom engineered for superior cohesive strength, excellent tensile adhesion, and standard whiteness metrics. Smooths out raw wall anomalies seamlessly.",
      benefits: ["Superior Whiteness metric (94%+ reflectivity)", "Provides highly uniform level finishes", "Minimal hydration water absorption", "Ensures high-gloss emulsion bindings"]
    },
    {
      id: "waterproof",
      name: "Waterproof Wall Putty",
      tagline: "Dampness Resistance Silicone Formula",
      bannerColor: "from-amber-600 via-[#FF7A00] to-orange-850",
      description: "Advanced silicone-modified and hydrophobically polymer-stabilized base putty. Seals concrete surfaces to construct a solid dampness defense wall, preventing humidity leakage, flaking, and paint loss.",
      benefits: ["Silicone water-repellent barrier", "Zero moisture seepage or salting", "Anti-fungal & anti-pest guarantee", "Long-term paint peeling buffer"]
    }
  ];

  const handleSizeChange = (prodName: string, size: string) => {
    setSelectedSize(prev => ({ ...prev, [prodName]: size }));
  };

  const handleQtyChange = (prodName: string, amount: number) => {
    setQuantities(prev => ({ ...prev, [prodName]: Math.max(1, prev[prodName] + amount) }));
  };

  const getPrice = (prodName: string) => {
    const size = selectedSize[prodName];
    const key = `${prodName}_${size}`;
    return prices[key] || 1150;
  };

  const handleAdd = (prodName: string) => {
    const size = selectedSize[prodName];
    const qty = quantities[prodName];
    const price = getPrice(prodName);

    onAddToCart({
      type: "putty",
      name: prodName,
      size: size,
      quantity: qty,
      price: price
    });

    setNotif(prev => ({ ...prev, [prodName]: true }));
    setTimeout(() => {
      setNotif(prev => ({ ...prev, [prodName]: false }));
    }, 1200);
  };

  const handleWhatsApp = (prodName: string) => {
    const size = selectedSize[prodName];
    const qty = quantities[prodName];
    const price = getPrice(prodName);

    onWhatsAppOrder({
      type: "putty",
      name: prodName,
      size: size,
      quantity: qty,
      price: price
    });
  };

  // Compute calculated bags needed
  // Rule of thumb: 1kg covers approx 12 sqft for 2 coats standard putty.
  const computedBagsNeeded = useMemo(() => {
    const totalKgNeeded = (wallArea * calcCoats) / 12; // total KG
    return {
      kg: Math.round(totalKgNeeded),
      bags20: Math.ceil(totalKgNeeded / 20),
      bags40: Math.ceil(totalKgNeeded / 40)
    };
  }, [wallArea, calcCoats]);

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-20 font-sans">
      
      {/* Premium Header banner */}
      <div className="bg-gradient-to-r from-[#030E1E] to-[#071A35] text-white py-14 px-4 md:px-8 border-b border-[#FF7A00]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 text-left">
            <span className="bg-[#FF7A00]/20 text-[#FFC857] text-[10px] px-3.5 py-1 rounded-full font-mono font-bold tracking-widest uppercase">
              PREMIUM UNDERCOAT SEGMENT
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight">
              Elite Wall Putty
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Construct silky flawless interior profiles. Our ultra-white specialized putties block hydration moisture paths, seal structural cracks, and layout elite bases for JSW paint applications.
            </p>
          </div>
          
          <div className="flex bg-white/5 border border-white/10 rounded-[24px] p-5 items-center gap-4 text-left max-w-md">
            <ShieldCheck className="text-[#FF7A00] shrink-0" size={24} />
            <div>
              <h5 className="text-xs font-bold text-white uppercase font-sans">100% Genuine Certified</h5>
              <p className="text-[10px] text-white/60">Factory sealed bags dispatched directly to site locations.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        
        {/* Interactive Wall Putty Coverage Calculator */}
        <section className="glass-panel rounded-[32px] p-6 lg:p-10 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#FF7A00] font-bold font-mono">
              <Calculator size={14} />
              <span>WALL AREA PUTTY CALCULATOR</span>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#071A35]">
              Estimate Putty Bags Instantly
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Input your target room wall plaster dimension in Square Feet, choose the coat density, and see the exact SNE Bag count parameters needed instantly.
            </p>

            <form className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">Target Wall Surface (Sq. Ft)</label>
                <input 
                  type="number"
                  value={wallArea}
                  onChange={(e) => setWallArea(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-200 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">Number of Coats</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((ct) => (
                    <button
                      key={ct}
                      type="button"
                      onClick={() => setCalcCoats(ct)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        calcCoats === ct 
                          ? "bg-[#071A35] text-white shadow-md"
                          : "bg-slate-100 text-[#071A35]/70 hover:bg-slate-200"
                      }`}
                    >
                      {ct} {ct === 1 ? 'Coat' : 'Coats'}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#071A35] text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Visual backdrop graphic */}
            <div className="absolute right-[-10px] bottom-[-20px] text-white/[0.04] font-black text-9xl select-none font-mono">
              BAGS
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-mono font-bold text-[#FFC857] uppercase tracking-widest">
                Procurement Recommendation List
              </h4>
              <p className="text-xs text-white/70">
                Based on standard regional coverage parameters for modern structural plasters:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">Total Putty Mass</span>
                <strong className="text-xl sm:text-2xl font-black text-[#FFC857] font-mono">{computedBagsNeeded.kg} KG</strong>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">If using 40KG Bags</span>
                <strong className="text-xl sm:text-2xl font-black text-[#FF7A00] font-mono">{computedBagsNeeded.bags40} bags</strong>
                <p className="text-[8px] text-white/40 mt-1">Recommended scale</p>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-[9px] font-mono font-bold text-slate-450 block uppercase">If using 20KG Bags</span>
                <strong className="text-xl sm:text-2xl font-black text-white font-mono">{computedBagsNeeded.bags20} bags</strong>
              </div>
            </div>

            <div className="text-[10px] text-white/50 border-t border-white/10 pt-4 flex items-center gap-2">
              <Info size={12} className="text-[#FFC857]" />
              <span>Select these bag parameters under the corresponding putty cards below!</span>
            </div>
          </div>
        </section>

        {/* Putty Products List */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" id="putty-selection-grid">
          {products.map((product) => {
            const currentSelectedSize = selectedSize[product.name];
            const currentQuantity = quantities[product.name];
            const singleItemPrice = getPrice(product.name);
            const totalItemCost = singleItemPrice * currentQuantity;
            const isAdded = notif[product.name];

            return (
              <motion.div 
                key={product.id}
                whileHover={{ 
                  y: -8,
                  borderColor: "#0ea5e9",
                  boxShadow: "0 25px 45px -12px rgba(14, 165, 233, 0.25)"
                }}
                className="bg-white rounded-[32px] border border-slate-200/80 shadow-md overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300 relative text-left"
              >
                {/* Product Title Banner */}
                <div className={`bg-gradient-to-r ${product.bannerColor} p-6 pb-8 text-white relative`}>
                  {/* Decorative mesh circle */}
                  <div className="absolute right-[-10%] top-[-20%] h-36 w-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  
                  {/* Neon top line accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-300 to-indigo-400" />
                  
                  <div className="bg-white/10 text-slate-200 text-[9px] uppercase font-mono font-bold w-fit px-2.5 py-0.5 rounded-full tracking-wider mb-2">
                    JSW-COMPATIBLE UNDERCOATING
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight uppercase leading-none">
                    {product.name}
                  </h3>
                  <p className="text-xs text-white/80 font-medium italic mt-1 font-sans">
                    {product.tagline}
                  </p>
                </div>

                {/* Product content box */}
                <div className="p-6 space-y-6 flex-grow flex flex-col justify-between bg-gradient-to-b from-white to-slate-50/50 text-left">
                  <div className="space-y-4">
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      {product.description}
                    </p>

                    {/* Benefit checklist badges */}
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-1.5">
                        Certified Specifications
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {product.benefits.map((benefit, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2 text-xs text-slate-600 font-sans">
                            <Check size={14} className="text-[#FF7A00] shrink-0 mt-0.5" />
                            <span>{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Size Config choices */}
                  <div className="border-t border-slate-100 pt-5">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Pack Scale Selection (Select Bag Weight)
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {["20 KG", "25_KG", "40 KG"].map((size) => {
                        // Standardize string matches
                        const sizeForVal = size === "25_KG" ? "25 KG" : size;
                        const labelText = size === "25_KG" ? "25 KG" : size;
                        
                        return (
                          <button
                            key={size}
                            onClick={() => handleSizeChange(product.name, sizeForVal)}
                            className={`py-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                              currentSelectedSize === sizeForVal
                                ? "bg-gradient-to-r from-[#071A35] to-slate-850 border-[#071A35] text-white shadow-xl"
                                : "border-slate-200 text-[#071A35]/70 bg-white hover:bg-slate-50"
                            }`}
                          >
                            {labelText}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Quantity selector / prices box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/60 flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-1">
                        Bags Quantity
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.name, -1)}
                          className="h-9 w-9 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900 text-sm font-mono">
                          {currentQuantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product.name, 1)}
                          className="h-9 w-9 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right leading-tight">
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase block mb-0.5">
                        Price Valuation
                      </span>
                      <span className="text-2xl font-extrabold text-[#071A35] font-mono">
                        ₹{totalItemCost}
                      </span>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5">₹{singleItemPrice} per bag</p>
                    </div>
                  </div>

                  {/* Buttons line */}
                  <div className="space-y-2 pt-2">
                    <AnimatePresence mode="wait">
                      {isAdded ? (
                        <motion.div 
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0.95 }}
                          className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold py-3.5 text-center rounded-2xl text-xs flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={16} />
                          <span>Added to Site Cart!</span>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => handleAdd(product.name)}
                          className="w-full bg-gradient-to-r from-[#071A35] to-slate-900 hover:from-slate-900 hover:to-[#071A35] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 text-xs uppercase tracking-widest cursor-pointer"
                        >
                          <ShoppingCart size={14} />
                          <span>Add bags to cart</span>
                        </button>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => handleWhatsApp(product.name)}
                      className="w-full bg-gradient-to-r from-[#FF7A00] to-amber-500 hover:from-amber-500 hover:to-[#FF7A00] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest cursor-pointer"
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
