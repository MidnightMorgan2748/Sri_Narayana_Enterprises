import React, { useState, useMemo, useEffect } from "react";
import { Search, ShoppingBag, Eye, X, Check, HelpCircle, Sparkles, Paintbrush, Calculator, AlertCircle, Bookmark } from "lucide-react";
import { PAINT_SHADES, PAINT_CATEGORIES, PaintShade } from "../paintsData";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface PaintsPageProps {
  onAddToCart: (item: Omit<CartItem, "id">) => void;
  onWhatsAppOrder: (item: Omit<CartItem, "id">) => void;
  paintPacks: Record<string, number>;
}

const JSW_PRODUCTS = [
  { id: "pixa", name: "JSW Pixa Silk Emulsion", description: "Smooth high-sheen luxurious classic cover.", multiplier: 1.0 },
  { id: "halo", name: "JSW Halo Majestic Interior", description: "Super-washable anti-bacterial velvet coating.", multiplier: 1.2 },
  { id: "aurus", name: "JSW Aurus Premium Exterior", description: "Weather-proof silicon shielding with anti-algal guarantee.", multiplier: 1.25 },
  { id: "ipaint", name: "JSW I-Paint Interior Emulsion", description: "Smart economical eco-friendly high-hiding coat.", multiplier: 0.9 }
];

const COLOR_FAMILIES = ["All", "White", "Yellow", "Orange", "Pink", "Red", "Blue", "Green", "Grey", "Violet", "Brown"];

// Helper to dynamically calculate color family based on category, name, or hex code
function determineColorFamily(category: string, hex: string, name: string): string {
  const cat = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();
  
  if (cat.includes("white") || cat.includes("cream")) return "White";
  if (cat.includes("blue")) return "Blue";
  if (cat.includes("green")) return "Green";
  if (cat.includes("yellow") || cat.includes("orange")) {
    if (n.includes("orange") || n.includes("peach") || n.includes("apricot") || n.includes("tangerine") || n.includes("rust")) return "Orange";
    return "Yellow";
  }
  if (cat.includes("red") || cat.includes("pink")) {
    if (n.includes("pink") || n.includes("rose") || n.includes("baby") || n.includes("magenta") || n.includes("coral")) return "Pink";
    return "Red";
  }
  if (cat.includes("brown") || cat.includes("grey") || cat.includes("gray")) {
    if (n.includes("grey") || n.includes("gray") || n.includes("slate") || n.includes("silver") || n.includes("steel")) return "Grey";
    return "Brown";
  }
  
  // High-fidelity fallback based on hex-code colorimetry if we want to guess
  if (hex && hex.startsWith("#")) {
    try {
      const r = parseInt(hex.substring(1, 3), 16);
      const g = parseInt(hex.substring(3, 5), 16);
      const b = parseInt(hex.substring(5, 7), 16);
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      if (max - min < 15) {
        if (max > 220) return "White";
        return "Grey";
      }
      
      if (r > g * 1.2 && r > b * 1.2) {
        if (g > b * 1.2) return "Orange";
        return "Red";
      }
      if (g > r * 1.1 && g > b * 1.1) return "Green";
      if (b > r * 1.1 && b > g * 1.1) return "Blue";
      if (r > b * 1.2 && g > b * 1.2 && Math.abs(r - g) < 40) return "Yellow";
    } catch (e) {}
  }
  
  return "White";
}

const FAMILY_COLORS: Record<string, string> = {
  All: "bg-gradient-to-r from-red-500 via-yellow-400 via-green-500 via-blue-500 to-indigo-500",
  White: "bg-white border border-slate-300",
  Yellow: "bg-yellow-400",
  Orange: "bg-orange-500",
  Pink: "bg-pink-400",
  Red: "bg-red-600",
  Blue: "bg-blue-600",
  Green: "bg-green-600",
  Grey: "bg-slate-400",
  Violet: "bg-violet-500",
  Brown: "bg-[#8B4513]"
};

export default function PaintsPage({ onAddToCart, onWhatsAppOrder, paintPacks }: PaintsPageProps) {
  const [shades, setShades] = useState<PaintShade[]>(PAINT_SHADES);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFamily, setSelectedFamily] = useState("All");
  const [activeColor, setActiveColor] = useState<PaintShade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  // Selection states inside modal/drawer
  const [selectedProduct, setSelectedProduct] = useState(JSW_PRODUCTS[0]);
  const [selectedSize, setSelectedSize] = useState<string>("4L");
  const [quantity, setQuantity] = useState<number>(1);
  const [justAdded, setJustAdded] = useState(false);
  const [wishlistCodes, setWishlistCodes] = useState<string[]>([]);

  // Room Wall Color Tint Simulator state starts with a safe fallback shade
  const [simulatorColor, setSimulatorColor] = useState<PaintShade>(PAINT_SHADES[5] || PAINT_SHADES[0]);

  // Dynamic fetch of paint_colors from database
  useEffect(() => {
    async function loadColors() {
      setIsLoading(true);
      setErrorStatus(null);
      try {
        const res = await fetch("/api/paint-colors");
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            // Automatically enrich any shade with dynamic color family mapping
            const enriched = data.map((shade: any) => {
              const cat = shade.category || "";
              const hex = shade.hex || shade.hex_color || "";
              const name = shade.name || shade.shade_name || "";
              const family = shade.color_family && shade.color_family !== "White"
                ? shade.color_family
                : determineColorFamily(cat, hex, name);
              
              return {
                ...shade,
                color_family: family
              };
            });
            setShades(enriched);
          } else {
            setShades(PAINT_SHADES);
          }
        } else {
          setShades(PAINT_SHADES);
          setErrorStatus(`Database catalog offline (Code ${res.status}). Loaded 150+ offline registers.`);
        }
      } catch (err: any) {
        console.warn("Using local fallback shade registers:", err);
        setShades(PAINT_SHADES);
        setErrorStatus("Using robust offline paint shades catalog.");
      } finally {
        setIsLoading(false);
      }
    }
    loadColors();
  }, []);

  // Dynamically extract categories from current loaded shades, preserving ordering where possible
  const activeCategories = useMemo(() => {
    const cats = new Set<string>();
    shades.forEach(s => {
      if (s.category && s.category.trim() !== "") {
        cats.add(s.category);
      }
    });
    // Add default fallbacks if somehow empty
    if (cats.size === 0) {
      return ["All", ...PAINT_CATEGORIES];
    }
    return ["All", ...Array.from(cats)];
  }, [shades]);

  // Dynamically check color families present
  const activeFamilies = useMemo(() => {
    const fams = new Set<string>();
    shades.forEach(s => {
      if (s.color_family && s.color_family.trim() !== "") {
        fams.add(s.color_family);
      }
    });
    if (fams.size <= 1) {
      return ["All", "White", "Yellow", "Orange", "Pink", "Red", "Blue", "Green", "Grey", "Violet", "Brown"];
    }
    return ["All", ...Array.from(fams)];
  }, [shades]);

  // Update simulator color when shades load if active simulator color is missing
  useEffect(() => {
    if (shades && shades.length > 0) {
      const currentCode = simulatorColor ? (simulatorColor.code || simulatorColor.shade_code) : "";
      const exists = shades.find(s => (s.code || s.shade_code) === currentCode);
      if (!exists && shades[0]) {
        setSimulatorColor(shades[0]);
      }
    }
  }, [shades]);

  const toggleWishlist = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlistCodes(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Safe and ultra-reliable multi-tiered filtering logic
  const filteredShades = useMemo(() => {
    return shades.filter((shade) => {
      const name = shade.name || shade.shade_name || "";
      const code = shade.code || shade.shade_code || "";
      const category = shade.category || "";
      const family = shade.color_family || "";

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || category.toLowerCase() === selectedCategory.toLowerCase();

      const matchesFamily =
        selectedFamily === "All" || family.toLowerCase() === selectedFamily.toLowerCase();

      return matchesSearch && matchesCategory && matchesFamily;
    });
  }, [shades, searchQuery, selectedCategory, selectedFamily]);

  const handleColorClick = (shade: PaintShade) => {
    setActiveColor(shade);
    setSimulatorColor(shade); // Immediately render on preview wall
    setSelectedProduct(JSW_PRODUCTS[0]);
    setSelectedSize("4L");
    setQuantity(1);
    setJustAdded(false);
  };

  const getProductPrice = (size: string) => {
    return Math.round((paintPacks[size] || 280) * selectedProduct.multiplier);
  };

  const handleAdd = () => {
    if (!activeColor) return;
    
    const actName = activeColor.name || activeColor.shade_name || "Unknown Paint Shade";
    const actCode = activeColor.code || activeColor.shade_code || "N/A";
    const actHex = activeColor.hex || activeColor.hex_color || "#CCCCCC";

    onAddToCart({
      type: "paint",
      name: `${selectedProduct.name} - ${actName}`,
      colorName: actName,
      shadeCode: actCode,
      colorHex: actHex,
      size: selectedSize,
      quantity: quantity,
      price: getProductPrice(selectedSize)
    });

    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setActiveColor(null);
    }, 1200);
  };

  const handleWhatsApp = () => {
    if (!activeColor) return;
    
    const actName = activeColor.name || activeColor.shade_name || "Unknown Paint Shade";
    const actCode = activeColor.code || activeColor.shade_code || "N/A";
    const actHex = activeColor.hex || activeColor.hex_color || "#CCCCCC";

    onWhatsAppOrder({
      type: "paint",
      name: `${selectedProduct.name} - ${actName}`,
      colorName: actName,
      shadeCode: actCode,
      colorHex: actHex,
      size: selectedSize,
      quantity: quantity,
      price: getProductPrice(selectedSize)
    });
  };

  const currentWallHex = simulatorColor ? (simulatorColor.hex || simulatorColor.hex_color || "#F3EFE0") : "#F3EFE0";

  return (
    <div className="bg-[#F5F7FA] min-h-screen pb-20 font-sans">
      
      {/* Premium Asian-paints style Interactive Banner */}
      <div className="bg-gradient-to-r from-[#030E1E] to-[#071A35] text-white py-14 px-4 md:px-8 border-b border-[#FF7A00]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <span className="bg-[#FF7A00]/20 text-[#FFC857] text-[10px] px-3 py-1 rounded-full font-mono font-bold tracking-widest uppercase">
              JSW PAINTS STAR SHADES LAB
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight">
              Aesthetic Color Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Sri Narayana Enterprises presents the ultimate computerized tinting pavilion. Explore 150+ exquisite digital shades across diverse categories. Try them inside our live interior wall visualizer, and order elite high-hiding emulsion finishes immediately.
            </p>
          </div>
          
          <div className="lg:col-span-5 flex justify-end">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 flex items-center gap-4 text-left max-w-sm">
              <div className="w-10 h-10 bg-[#FF7A00]/20 rounded-full flex items-center justify-center text-[#FFC857]">
                <Sparkles size={18} />
              </div>
              <div className="leading-tight">
                <span className="text-[9px] font-mono font-bold tracking-widest block text-slate-400">STATUS DIAGNOSTICS</span>
                <span className="text-xs font-bold text-white uppercase">Automated Tinting Cabinet: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-12">
        
        {/* Interactive Living Room Wall Tone Simulator (Visual Wow-Factor) */}
        <section className="bg-white border border-slate-200/80 rounded-[32px] p-6 lg:p-10 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-left">
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#FF7A00] font-bold font-mono">
              <Paintbrush size={14} />
              <span>LIVE WALL TINT PREVIEW SYSTEM</span>
            </div>
            
            <div>
              <span className="text-[10px] font-mono bg-[#071A35]/10 border border-[#071A35]/20 text-[#071A35] px-2.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                {simulatorColor ? (simulatorColor.code || simulatorColor.shade_code) : "N/A"}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#071A35] mt-2">
                {simulatorColor ? (simulatorColor.name || simulatorColor.shade_name) : "Loading Shade..."}
              </h3>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-mono">
                Category: {simulatorColor ? (simulatorColor.category) : "All-Family"} Shade
              </p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Select any of our 150+ live JSW emulsion colors in the grid underneath. Watch our interactive render space colorize the room in real time to pick the perfect mood.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
              <Calculator size={18} className="text-[#FF7A00] shrink-0 mt-0.5" />
              <div>
                <h5 className="text-[11px] font-bold uppercase text-[#071A35] tracking-wide">Standard JSW Wall Coverage</h5>
                <p className="text-[10px] text-slate-400 leading-normal mt-0.5">
                  1 Liter double-coated generally finishes 80 sq.ft beautifully. Computerized tinting formulation is complete within 3 minutes at our warehouse.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-[#071A35] rounded-3xl p-6 relative overflow-hidden flex flex-col items-center justify-center min-h-[350px]">
            {/* Simulated wall colored layer */}
            <div 
              className="absolute inset-0 transition-colors duration-500" 
              style={{ backgroundColor: currentWallHex }}
            />
            {/* Soft lighting overlay to give 3D depth to the wall */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-white/10 pointer-events-none" />

            {/* Illustrated living room furniture SVGs overlay */}
            <div className="relative z-10 w-full max-w-md mx-auto space-y-4">
              {/* Back Wall Artwork Mock */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-24 border-2 border-white/60 bg-black/30 backdrop-blur-md rounded flex items-center justify-center text-white/50 text-[10px] font-mono">
                SNE Color Lab
              </div>

              {/* Floor Baseboard & Modern Couch Vector illustration */}
              <div className="h-44 flex flex-col justify-end mt-24 relative select-none">
                {/* Modern Sofa */}
                <div className="bg-slate-100 border-2 border-slate-300 w-full h-20 rounded-t-3xl relative p-3 shadow-2xl">
                  {/* Cushions */}
                  <div className="grid grid-cols-3 gap-1 h-full">
                    <div className="bg-slate-200 rounded" />
                    <div className="bg-slate-200 rounded" />
                    <div className="bg-slate-200 rounded" />
                  </div>
                  {/* Left Armrest */}
                  <div className="absolute left-[-10px] top-6 w-5 h-14 bg-slate-100 border-2 border-slate-300 rounded-lg" />
                  {/* Right Armrest */}
                  <div className="absolute right-[-10px] top-6 w-5 h-14 bg-slate-100 border-2 border-slate-300 rounded-lg" />
                </div>
                {/* Wood Floor overlay */}
                <div className="bg-amber-800 h-6 border-t-4 border-amber-950 w-full relative z-0 mt-1 flex justify-center text-[8px] text-white/40 font-mono items-center uppercase">
                  Polished Floor Plank
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Animated Swatches (Aesthetic Choice Palettes) */}
        <section className="bg-white border border-slate-200/80 rounded-[32px] p-6 lg:p-8 shadow-xl text-left space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-bold tracking-widest text-[#FF7A00] uppercase bg-orange-100/60 border border-[#FF7A00]/25 px-2.5 py-1 rounded-full">
                <Sparkles size={11} className="animate-spin-slow text-[#FF7A00]" />
                JSW TINT-LAB EXCLUSIVE
              </span>
              <h3 className="text-xl font-black uppercase text-[#071A35] tracking-tight">
                Trending Designer Paint Swatches
              </h3>
              <p className="text-xs text-slate-500 max-w-xl">
                Quick-test curated local aesthetic collections. Click any color swatch to automatically tint the live simulation wall above!
              </p>
            </div>
            
            <div className="hidden md:block self-center">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block text-right">AUTOMATED STATIONS</span>
              <span className="text-[11px] font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 block mt-1 animate-pulse">
                ● TINTING ENGINE LIVE
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Srinagar Royal Heritage",
                desc: "Clean, warm whites & traditional palace ivory",
                shades: [
                  { name: "Alabaster Aura", hex: "#F2F0EA", code: "JSW-1002" },
                  { name: "Srinagar Ivory Silk", hex: "#FFFDF6", code: "JSW-1004" },
                  { name: "Sandalwood Glow", hex: "#F5ECD5", code: "JSW-1011" },
                  { name: "Bestavaripeta Cream", hex: "#FFF7EA", code: "JSW-1015" }
                ]
              },
              {
                name: "Cool Andhra Monsoon Sky",
                desc: "Cool blues & deep ocean slate for relaxing spaces",
                shades: [
                  { name: "Monsoon Teal", hex: "#1D4ED8", code: "JSW-3042" },
                  { name: "Ocean Breeze", hex: "#DBEAFE", code: "JSW-3011" },
                  { name: "Midnight Shadow", hex: "#1E3A8A", code: "JSW-3091" },
                  { name: "Light Air Mist", hex: "#93C5FD", code: "JSW-3004" }
                ]
              },
              {
                name: "Deccan Earth & Terracotta",
                desc: "Sunset saffrons & organic copper clay vibes",
                shades: [
                  { name: "Tangerine Silk", hex: "#EA580C", code: "JSW-2041" },
                  { name: "Deccan Ochre", hex: "#F59E0B", code: "JSW-2015" },
                  { name: "Saffron Spun", hex: "#D97706", code: "JSW-2022" },
                  { name: "Terracotta Clay", hex: "#C2410C", code: "JSW-2013" }
                ]
              }
            ].map((palette) => (
              <div 
                key={palette.name} 
                className="bg-slate-50/50 border border-slate-200/50 hover:bg-slate-50 rounded-[24px] p-5 space-y-4 hover:shadow-md transition-all duration-300"
              >
                <div className="space-y-1 text-left">
                  <h4 className="text-xs font-black uppercase text-[#071A35] tracking-tight">{palette.name}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-tight">{palette.desc}</p>
                </div>

                {/* Swatches List with Animation */}
                <div className="flex items-center gap-3 py-1">
                  {palette.shades.map((sw, sIdx) => {
                    const isSelected = simulatorColor && (simulatorColor.code === sw.code);
                    return (
                      <motion.button
                        key={sw.code}
                        type="button"
                        onClick={() => {
                          const swatchShade: PaintShade = {
                            name: sw.name,
                            code: sw.code,
                            hex: sw.hex,
                            shade_name: sw.name,
                            shade_code: sw.code,
                            hex_color: sw.hex,
                            category: "Designer Palette",
                            color_family: "Premium"
                          };
                          handleColorClick(swatchShade);
                        }}
                        className={`w-10 h-10 rounded-full relative shadow-md transition-all shrink-0 cursor-pointer ${
                          isSelected ? "ring-2 ring-[#FF7A00] ring-offset-2 scale-110" : "hover:scale-110"
                        }`}
                        style={{ backgroundColor: sw.hex }}
                        whileHover={{ y: -4 }}
                        title={`${sw.name} (${sw.code})`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10 rounded-full" />
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center text-white text-[9px] drop-shadow font-black">
                            ✓
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters and search area */}
        <section className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md space-y-5" id="paints-search-block">
          
          {errorStatus && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-[11px] font-medium flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>{errorStatus}</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-5 items-center justify-between">
            <div className="relative w-full lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search color name (e.g. Alabaster, Rose) or code (e.g. 1093, 2043)..."
                className="w-full bg-white border border-slate-250 focus:border-[#FF7A00] text-[#071A35] pl-11 pr-4 py-3 rounded-2xl outline-none text-xs focus:ring-1 focus:ring-[#FF7A00] transition-colors"
              />
            </div>
            
            <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Filtered <span className="font-extrabold text-[#FF7A00]">{filteredShades.length}</span> / {shades.length} shades
            </div>
          </div>

          <div className="h-px bg-slate-200/50" />

          {/* Color Categories Slider */}
          <div className="flex items-center gap-2 flex-wrap text-left">
            <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase pr-2">CATEGORY:</span>
            {activeCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === category
                    ? "bg-[#FF7A00] text-white shadow-lg hover:bg-orange-600 scale-[1.02]"
                    : "bg-slate-100 text-[#071A35]/80 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-200/50" />

          {/* Color Hues / Families slider (circular palette previews) */}
          <div className="flex items-center gap-2 flex-wrap text-left">
            <span className="text-[10px] font-mono tracking-wider font-extrabold text-slate-400 uppercase pr-2">COLOR HUE:</span>
            {activeFamilies.map((family) => (
              <button
                key={family}
                onClick={() => setSelectedFamily(family)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  selectedFamily === family
                    ? "bg-[#071A35] text-white shadow-md scale-[1.01]"
                    : "bg-slate-100 text-[#071A35]/80 hover:bg-slate-200"
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-full shadow-inner ${FAMILY_COLORS[family] || "bg-slate-300"}`} />
                <span>{family}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Loading Skeletons while colors load */}
        {isLoading ? (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6" id="shades-catalog-skeletons">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-3 shadow-sm animate-pulse flex flex-col justify-between h-[210px]">
                <div className="w-full h-28 bg-slate-200 rounded-2xl" />
                <div className="pt-3 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-12" />
                  <div className="h-3 bg-slate-200 rounded w-24" />
                  <div className="h-2 bg-slate-200 rounded w-16" />
                </div>
              </div>
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6" id="shades-catalog-grid">
            <AnimatePresence>
              {filteredShades.map((shade) => {
                const sCode = shade.code || shade.shade_code;
                const sName = shade.name || shade.shade_name;
                const sHex = shade.hex || shade.hex_color || "#CCCCCC";
                const isSaved = wishlistCodes.includes(sCode);
                
                // Highlight the active preview color card with a ring-4 outline
                const isSelected = simulatorColor && (simulatorColor.code === sCode || simulatorColor.shade_code === sCode);

                return (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    key={sCode}
                    onClick={() => handleColorClick(shade)}
                    style={{
                      boxShadow: isSelected 
                        ? `0 12px 28px -4px ${sHex}80` 
                        : undefined
                    }}
                    className={`group bg-white border rounded-3xl p-3 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                      isSelected 
                        ? "border-[#FF7A00] ring-2 ring-[#FF7A00]/40 scale-[1.02]" 
                        : "border-slate-200/60 hover:border-[#FF7A00]/30 hover:-translate-y-1 hover:shadow-lg"
                    }`}
                  >
                    {/* Color box layer */}
                    <div 
                      className="w-full h-28 rounded-2xl relative transition-transform duration-300 group-hover:scale-[1.02] overflow-hidden"
                      style={{ backgroundColor: sHex }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-white/10 pointer-events-none" />
                      
                      {/* Hover Tint preview overlay */}
                      <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-white/95 text-[#071A35] p-2 rounded-full shadow-lg">
                          <Eye size={14} />
                        </div>
                      </div>

                      {/* Wishlist button */}
                      <button
                        onClick={(e) => toggleWishlist(sCode, e)}
                        className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-colors z-10 ${
                          isSaved ? "bg-[#FF7A00] text-white" : "bg-white/40 hover:bg-white text-slate-800"
                        }`}
                      >
                        <Bookmark size={11} fill={isSaved ? "currentColor" : "none"} />
                      </button>

                      {isSelected && (
                        <span className="absolute bottom-2 left-2 bg-[#FF7A00] text-white font-mono font-black text-[8px] uppercase px-2 py-0.5 rounded-full shadow-sm">
                          Active preview
                        </span>
                      )}
                    </div>

                    {/* Shade Text description */}
                    <div className="pt-3 text-left">
                      <span className="text-[9px] font-mono font-bold text-[#071A35]/65 bg-[#071A35]/5 border border-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider block w-fit mb-1">
                        Code {sCode}
                      </span>
                      <h4 className="text-xs font-bold text-[#071A35] group-hover:text-[#FF7A00] transition-colors truncate">
                        {sName}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400 font-medium block truncate">
                          {shade.category || "Emulsion"}
                        </span>
                        <span className="text-[9px] text-[#FF7A00] font-mono uppercase tracking-widest font-extrabold pr-1">
                          {shade.color_family}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </section>
        )}

        {/* Empty status check */}
        {!isLoading && filteredShades.length === 0 && (
          <div className="text-center py-20 bg-white border border-slate-200/80 rounded-[32px] p-8 max-w-md mx-auto">
            <HelpCircle size={44} className="mx-auto text-slate-300 mb-4 animate-bounce" />
            <h4 className="text-sm font-extrabold uppercase text-[#071A35]">No matches found</h4>
            <p className="text-xs text-slate-400 mt-2">
              We couldn't find any shade matching your criteria. Try resetting the hue family, category filters, or search term to discover JSW Star Shades.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedFamily("All");
              }}
              className="mt-5 px-6 py-2.5 bg-[#071A35] hover:bg-[#FF7A00] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* OVERLAY TINT SPECIFICATIONS MODAL */}
      <AnimatePresence>
        {activeColor && (
          <div className="fixed inset-0 bg-[#030E1E]/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl border border-slate-100 overflow-hidden relative"
            >
              {/* Top Close */}
              <button
                onClick={() => setActiveColor(null)}
                className="absolute right-5 top-5 hover:bg-slate-100 p-2 text-slate-400 hover:text-slate-900 rounded-full transition-colors z-20 cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-12">
                {/* Left Colored Block (Tesla Style Accent Block) */}
                <div 
                  className="md:col-span-5 h-48 md:h-auto relative flex flex-col justify-end p-8 text-white text-left"
                  style={{ backgroundColor: activeColor.hex || activeColor.hex_color || "#CCCCCC" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
                  
                  <div className="relative z-10 space-y-1">
                    <span className="text-[9px] font-mono bg-white/20 px-3 py-0.5 rounded-full uppercase tracking-wider font-bold">
                      Code {activeColor.code || activeColor.shade_code}
                    </span>
                    <h3 className="text-2xl font-black leading-tight uppercase font-sans">
                      {activeColor.name || activeColor.shade_name}
                    </h3>
                    <p className="text-[10px] text-white/75 uppercase tracking-widest font-mono">
                      JSW {activeColor.category || "Emulsion"} Emulsion
                    </p>
                    <span className="text-[9px] text-[#FFC857] font-bold block uppercase tracking-wider font-mono">
                      Hex: {activeColor.hex || activeColor.hex_color}
                    </span>
                  </div>
                </div>

                {/* Right Specification and Ordering Panel */}
                <div className="md:col-span-7 p-8 text-left space-y-6">
                  <div className="space-y-2">
                    <span className="text-[10px] text-[#FF7A00] font-mono font-bold uppercase tracking-wider">Configure Mixture</span>
                    <h4 className="text-md font-bold text-[#071A35] uppercase tracking-tight">JSW Blending Formulation</h4>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Select your desired base formula and container packaging scale. Fresh pigments will be integrated inside store automatically.
                    </p>
                  </div>

                  {/* 1. Base Product selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase">Base Emulsion Option</label>
                    <div className="grid grid-cols-1 gap-2.5">
                      {JSW_PRODUCTS.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => setSelectedProduct(prod)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${
                            selectedProduct.id === prod.id
                              ? "bg-[#FF7A00]/5 border-[#FF7A00]"
                              : "bg-white border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <div className="text-left leading-tight">
                            <h5 className="text-xs font-bold text-[#071A35]">{prod.name}</h5>
                            <p className="text-[9px] text-slate-400 font-medium">{prod.description}</p>
                          </div>
                          {selectedProduct.id === prod.id && <Check size={14} className="text-[#FF7A00] shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Sizing Select buttons */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-slate-400 font-extrabold uppercase block">Container Scale</label>
                    <div className="flex flex-wrap gap-2">
                      {["1L", "4L", "10L", "20L", "50L"].map((sz) => (
                        <button
                          key={sz}
                          onClick={() => setSelectedSize(sz)}
                          className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedSize === sz
                              ? "bg-[#071A35] text-white"
                              : "bg-slate-100 text-[#071A35]/70 hover:bg-slate-200"
                          }`}
                        >
                          {sz} Pack (₹{getProductPrice(sz)})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Quantity selection */}
                  <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-base hover:bg-slate-200 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-mono text-sm font-black w-6 text-center">{quantity}</span>
                      <button 
                        onClick={() => setQuantity(prev => prev + 1)}
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-base hover:bg-slate-200 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right leading-none">
                      <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest block mb-1">Estimated Total</span>
                      <strong className="text-xl font-bold text-[#071A35] font-mono">₹{getProductPrice(selectedSize) * quantity}</strong>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <button
                      onClick={handleAdd}
                      className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-orange-500 hover:from-orange-500 hover:to-[#FF7A00] text-white rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer shadow-lg shadow-[#FF7A00]/20 flex items-center justify-center gap-1.5 transition-transform hover:scale-[1.01] active:scale-95"
                    >
                      {justAdded ? (
                        <>
                          <Check size={14} />
                          <span>Successfully Added!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={14} />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleWhatsApp}
                      className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-[#071A35] border rounded-2xl text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
                    >
                      Direct WhatsApp Quote
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
