import React, { useState, useMemo } from "react";
import { Hammer, ShoppingCart, Send, Info, Eye, CheckCircle2, Calculator, ShieldCheck, Check } from "lucide-react";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface SteelRodsPageProps {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onWhatsAppOrder: (item: Omit<CartItem, "id">) => void;
  prices: Record<string, number>;
}

export default function SteelRodsPage({ onAddToCart, onWhatsAppOrder, prices }: SteelRodsPageProps) {
  // Quantities states
  const [quantities, setQuantities] = useState<Record<string, number>>({
    "6mm": 10,
    "8mm": 12,
    "10mm": 10,
    "12mm": 10,
    "16mm": 5,
    "20mm": 5,
    "25mm": 2,
    "32mm": 2
  });

  const [notif, setNotif] = useState<Record<string, boolean>>({});

  // Dynamic Rebar Column Calculator States
  const [pillarCount, setPillarCount] = useState<number>(8);
  const [pillarHeight, setPillarHeight] = useState<number>(12); // default 12-foot column heights

  const rodSizes = [
    { size: "6mm", weight: "2.64 kg", grade: "FE 550D", useCase: "Stirrups matrix wire loops, spacing rings, and secondary concrete meshes." },
    { size: "8mm", weight: "4.74 kg", grade: "FE 550D", useCase: "Structural slabs, secondary columns, staircase plaster support, and stirrups bonds." },
    { size: "10mm", weight: "7.40 kg", grade: "FE 550D", useCase: "Roof slab reinforcements, structural stairs overlay, and lightweight brick lintels." },
    { size: "12mm", weight: "10.66 kg", grade: "FE 550D", useCase: "Main load beams, heavy home Columns, foundational wall structures, and footings." },
    { size: "16mm", weight: "18.96 kg", grade: "FE 550D", useCase: "Multi-story house pillars, heavy concrete slabs, and industrial framing." },
    { size: "20mm", weight: "29.62 kg", grade: "FE 550D", useCase: "Heavy piling cage columns, deep foundations, shear walls, and factory portal pillars." },
    { size: "25mm", weight: "46.28 kg", grade: "FE 550D", useCase: "High load foundational structural meshes, heavy highway retaining dams." },
    { size: "32mm", weight: "75.83 kg", grade: "FE 550D", useCase: "Industrial bridges, mega pillars, dam structures, and extreme-load casting blocks." }
  ];

  const handleQtyChange = (size: string, amount: number) => {
    setQuantities(prev => ({ ...prev, [size]: Math.max(1, (prev[size] || 0) + amount) }));
  };

  const getPrice = (size: string) => {
    return prices[size] || 350; // Use database price or default
  };

  const handleAdd = (size: string, weight: string) => {
    const qty = quantities[size] || 5;
    const price = getPrice(size);

    onAddToCart({
      type: "rod",
      name: `TMT Steel Rod ${size}`,
      size: `${size} Bar (12m Length)`,
      quantity: qty,
      price: price,
      weight: `${(parseFloat(weight) * qty).toFixed(1)} kg total`
    });

    setNotif(prev => ({ ...prev, [size]: true }));
    setTimeout(() => {
      setNotif(prev => ({ ...prev, [size]: false }));
    }, 1200);
  };

  const handleWhatsApp = (size: string, weight: string) => {
    const qty = quantities[size] || 5;
    const price = getPrice(size);

    onWhatsAppOrder({
      type: "rod",
      name: `TMT Steel Rod ${size}`,
      size: `${size} Bar (12m)`,
      quantity: qty,
      price: price,
      weight: `${(parseFloat(weight) * qty).toFixed(1)} kg total`
    });
  };

  // Compute calculated values
  // Rule of thumb for standard residential pillar (4 bars of 12mm and stirrups of 8mm every 6 inches):
  // 1 Pillar requires approx 4 rods of 12mm (cut to height) and 8 rods of 8mm for stirrups.
  const computedSteelBundle = useMemo(() => {
    const mainRods12mm = pillarCount * 4;
    const stirrupRods8mm = Math.ceil(pillarCount * (pillarHeight / 0.5) * 0.15); // ~0.15 rods of 8mm per Stirrup at 6 inches spacing
    
    const weightMain = mainRods12mm * 10.66;
    const weightStirrups = stirrupRods8mm * 4.74;
    const totalKg = weightMain + weightStirrups;

    return {
      rods12: mainRods12mm,
      rods8: stirrupRods8mm,
      totalKg: Math.round(totalKg),
      totalTons: (totalKg / 1000).toFixed(2)
    };
  }, [pillarCount, pillarHeight]);

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-20 font-sans">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-[#030E1E] to-[#071A35] text-white py-14 px-4 md:px-8 border-b border-[#FF7A00]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-3 text-left">
            <span className="bg-[#FF7A00]/20 text-[#FFC857] text-[10px] px-3.5 py-1 rounded-full font-mono font-bold tracking-widest uppercase">
              METALLURGICAL STRUCTURAL REBARS
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight">
              TMT Steel Rods
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Equip housing concrete with extreme tensile ductility. We supply premium FE 550D structural rebars spanning 6mm to 32mm in standard **12-meter** cut sizes.
            </p>
          </div>
          
          <div className="flex bg-white/5 border border-white/10 rounded-[24px] p-5 items-center gap-4 text-left max-w-md">
            <Hammer className="text-[#FF7A00] shrink-0" size={24} />
            <div>
              <h5 className="text-xs font-bold text-white uppercase font-sans">FE 550D SEISMIC STANDARD</h5>
              <p className="text-[10px] text-white/60">Certified bending tolerance and high-yield physical load checklists.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
        
        {/* Interactive Seismic Pillar Load Estimator */}
        <section className="glass-panel rounded-[32px] p-6 lg:p-10 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#FF7A00] font-bold font-mono">
              <Calculator size={14} />
              <span>SEISMIC PILLAR STEEL BUNDLE ESTIMATOR</span>
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tight text-[#071A35]">
              Estimate Foundation Rebars
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              Define the number of structural column pillars and heights designated for your home construction model to instantly evaluate recommended rebar loads.
            </p>

            <form className="space-y-4 font-sans text-xs">
              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">Target Column Pillars Count</label>
                <input 
                  type="number"
                  value={pillarCount}
                  onChange={(e) => setPillarCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-200 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono text-[10px] font-bold text-slate-400 uppercase">Average Column Height (Feet)</label>
                <input 
                  type="number"
                  value={pillarHeight}
                  onChange={(e) => setPillarHeight(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-200 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] focus:outline-none transition-colors"
                />
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#071A35] text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden">
            {/* Visual backdrop blueprint grid lines as background */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]" />
            <div className="absolute right-[-10px] bottom-[-20px] text-white/[0.04] font-black text-9xl select-none font-mono">
              STEEL
            </div>

            <div className="relative z-10 space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#FFC857] uppercase tracking-widest">
                Structural Bundle Recommendations (M20 Proportions)
              </h4>
              <p className="text-xs text-slate-300">
                Primary estimated reinforcement steel counts matching Indian residential building code parameters:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6 relative z-10">
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Main 12mm Rebars</span>
                <strong className="text-xl sm:text-2xl font-black text-white font-mono">{computedSteelBundle.rods12} rods</strong>
                <p className="text-[8px] text-slate-450 mt-1">12m lengths (FE 550D)</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Stirrups 8mm Rebars</span>
                <strong className="text-xl sm:text-2xl font-black text-[#FF7A00] font-mono">{computedSteelBundle.rods8} rods</strong>
                <p className="text-[8px] text-slate-450 mt-1">For ties wrapping</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                <span className="text-[9px] font-mono text-slate-400 uppercase block">Total Weight Mass</span>
                <strong className="text-xl sm:text-2xl font-black text-[#FFC857] font-mono">{computedSteelBundle.totalKg} KG</strong>
                <p className="text-[8px] text-slate-450 mt-1">~{computedSteelBundle.totalTons} Metric Tons</p>
              </div>
            </div>

            <div className="relative z-10 text-[10px] text-white/50 border-t border-white/10 pt-4 flex items-center gap-2">
              <Info size={12} className="text-[#FFC857]" />
              <span>Select these diameters directly in the catalog list details below to fill your cart!</span>
            </div>
          </div>
        </section>

        {/* Grid of sizes */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8" id="steel-rods-grid">
          {rodSizes.map((rod) => {
            const qty = quantities[rod.size] ?? 5;
            const price = getPrice(rod.size);
            const total = price * qty;
            const isAdded = notif[rod.size];

            // Render a custom structural circle matching the size diameter for excellent visual quality!
            const circleSizes: Record<string, string> = {
              "6mm": "h-8 w-8 border-[3px]",
              "8mm": "h-10 w-10 border-[4px]",
              "10mm": "h-12 w-12 border-[5px]",
              "12mm": "h-14 w-14 border-[6px]",
              "16mm": "h-16 w-16 border-[8px]",
              "20mm": "h-20 w-20 border-[10px]",
              "25mm": "h-24 w-24 border-[12px]",
              "32mm": "h-28 w-28 border-[15px]"
            };

            return (
              <motion.div 
                key={rod.size}
                whileHover={{ 
                  y: -8,
                  borderColor: "#f43f5e",
                  boxShadow: "0 25px 45px -12px rgba(244, 63, 94, 0.22)"
                }}
                className="bg-white rounded-[32px] border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between text-left"
              >
                {/* Visual Circle Block */}
                <div className="bg-[#071A35] p-6 flex flex-col items-center justify-center h-44 relative border-b border-slate-200/5 select-none">
                  {/* Glowing hot-strip ribbon header */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400" />
                  
                  {/* Grid backdrop */}
                  <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_14px]" />
                  
                  <div className="flex flex-col items-center relative z-10 font-sans">
                    <div className={`rounded-full border-slate-300 ring-4 ring-[#FF7A00]/25 bg-slate-900 flex items-center justify-center font-black text-white text-xs ${circleSizes[rod.size] || "h-14 w-14 border-[6px]"}`}>
                      {rod.size}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono font-bold tracking-widest mt-2">
                      CROSS-SECTION METRIC
                    </span>
                  </div>

                  <span className="absolute top-4 right-4 bg-white/5 border border-white/10 text-slate-300 text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    12 METERS
                  </span>
                </div>

                {/* Content Details */}
                <div className="p-6 space-y-5 flex-grow flex flex-col justify-between bg-white">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-[#071A35] uppercase tracking-wide">{rod.size} Diameter</span>
                      <span className="text-[9px] font-mono bg-orange-500/10 text-[#FF7A00] font-black px-2 py-0.5 rounded-full uppercase">{rod.grade}</span>
                    </div>
                    
                    {/* Weight badge and usecase info */}
                    <div className="flex items-center gap-3 bg-[#FF7A00]/5 px-2.5 py-1.5 rounded-xl border border-[#FF7A00]/10 w-fit">
                      <span className="text-[10px] font-mono font-bold text-[#FF7A00] uppercase">Unit Weight:</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">{rod.weight}</span>
                    </div>

                    <p className="text-xs text-slate-500 leading-normal min-h-[44px]">
                      {rod.useCase}
                    </p>
                  </div>

                  {/* Quantity and Price layout */}
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-450 uppercase">
                      <span>Rods Required</span>
                      <span>₹{price} / Bar</span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQtyChange(rod.size, -1)}
                          className="h-8 w-8 bg-white border border-slate-250 text-slate-700 font-bold rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold font-mono text-[#071A35]">
                          {qty}
                        </span>
                        <button
                          onClick={() => handleQtyChange(rod.size, 1)}
                          className="h-8 w-8 bg-white border border-slate-250 text-slate-700 font-bold rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          +
                        </button>
                        <span className="text-[10px] font-mono font-bold text-slate-400">Bars</span>
                      </div>
                      
                      <div className="text-right leading-none">
                        <strong className="text-[#071A35] font-black font-mono text-sm">₹{total}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Operational actions */}
                  <div className="space-y-1.5 pt-4 border-t border-slate-100">
                    <AnimatePresence mode="wait">
                      {isAdded ? (
                        <motion.div 
                          initial={{ scale: 0.95 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0.95 }}
                          className="bg-emerald-50 text-emerald-600 border border-emerald-100 font-bold py-3 text-center rounded-2xl text-xs flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={15} />
                          <span>Added to Cart!</span>
                        </motion.div>
                      ) : (
                        <button
                          onClick={() => handleAdd(rod.size, rod.weight)}
                          className="w-full bg-gradient-to-r from-[#071A35] to-slate-900 hover:from-slate-900 hover:to-[#071A35] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md text-xs uppercase tracking-widest cursor-pointer hover:scale-[1.01]"
                        >
                          <ShoppingCart size={14} />
                          <span>Add steel rods to cart</span>
                        </button>
                      )}
                    </AnimatePresence>

                    <button
                      onClick={() => handleWhatsApp(rod.size, rod.weight)}
                      className="w-full bg-gradient-to-r from-[#FF7A00] to-amber-500 hover:from-amber-500 hover:to-[#FF7A00] text-white font-bold py-3.5 rounded-2xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5 text-xs uppercase tracking-widest cursor-pointer hover:scale-[1.01]"
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
