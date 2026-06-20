import React, { useState, useEffect } from "react";
import { 
  ArrowRight, ShieldCheck, Star, Users, Briefcase, Award, 
  HelpCircle, Sparkles, Send, Flame, Zap, CheckCircle, MapPin, 
  Phone, Mail, CheckCircle2, ChevronDown, Truck, Percent, MessageSquare,
  Building, ChevronRight, HardHat, Layers, ShieldAlert, BadgeCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BrandLogo from "./BrandLogo";
import PremiumContactSection from "./PremiumContactSection";

interface HomePageProps {
  onSelectTab: (tab: string) => void;
  onFooterLogoTap?: () => void;
  designConfig?: {
    primaryColor: string;
    accentColor: string;
    showHeroGlow: boolean;
    showHeroGrid: boolean;
    headerStyle: "standard" | "compact" | "accented";
    aiBotEnabled: boolean;
    particleSpeed: "slow" | "normal" | "fast";
  };
}

// Interactive Construction Material Categories
const catalogCategories = [
  {
    id: "paints",
    title: "JSW Paints",
    tagline: "Authorized computerized color mixing center",
    bgImage: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=650&q=80",
    glowColor: "group-hover:shadow-[0_20px_50px_rgba(20,184,166,0.3)]",
    badge: "Strategic Outlet",
    borderColor: "group-hover:border-teal-500",
    ribbonColor: "from-teal-400 to-emerald-500",
    desc: "Experience JSW’s premium range. Choose from 1,000+ computerized shades with instant mechanical tinting on our state-of-the-art mixing deck."
  },
  {
    id: "putty",
    title: "Wall Putty",
    tagline: "Professional Nippon & Birla white base coats",
    bgImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=650&q=80",
    glowColor: "group-hover:shadow-[0_20px_50px_rgba(56,189,248,0.3)]",
    badge: "Ultra Base Support",
    borderColor: "group-hover:border-sky-500",
    ribbonColor: "from-sky-400 to-indigo-500",
    desc: "Give your walls a flawless, humidity-resistant foundation. Optimized for damp protection and smooth plaster finishes."
  },
  {
    id: "cement",
    title: "KCP Cement",
    tagline: "Ultra-high compression structural foundation bags",
    bgImage: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=650&q=80",
    glowColor: "group-hover:shadow-[0_20px_50px_rgba(16,185,129,0.3)]",
    badge: "Direct Factory Stock",
    borderColor: "group-hover:border-emerald-500",
    ribbonColor: "from-emerald-400 to-teal-500",
    desc: "Engineered for maximum concrete durability. Standard OPC 53 & premium PPC bags shipped straight from regional mills to your site location."
  },
  {
    id: "rods",
    title: "Steel Rods",
    tagline: "IS 1786 certified FE 550D TMT reinforcement bars",
    bgImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=650&q=80",
    glowColor: "group-hover:shadow-[0_20px_50px_rgba(244,63,94,0.3)]",
    badge: "Grade FE 550D TMT",
    borderColor: "group-hover:border-rose-500",
    ribbonColor: "from-rose-500 to-orange-500",
    desc: "Seismic-resistant, highly ductile thermal reinforcement rods spanning 8mm to 32mm with certified factory yield credentials."
  }
];

export default function HomePage({ onSelectTab, onFooterLogoTap, designConfig }: HomePageProps) {
  // Frequently Asked Questions state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  // Dynamic reviews state linked with database
  const [fetchedReviews, setFetchedReviews] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRole, setReviewRole] = useState("Contractor Partner");
  const [reviewQuote, setReviewQuote] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  // --- SNE PREMIUM MODULES: REAL-TIME PRICING & CALLER DETAILS STATES ---
  const [materialRates, setMaterialRates] = useState<any[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState("All Works");
  const [selectedLightboxImg, setSelectedLightboxImg] = useState<any | null>(null);

  const loadMaterialRates = async () => {
    try {
      const resp = await fetch("/api/price-updates");
      if (resp.ok) {
        const payload = await resp.json();
        if (payload.success) {
          setMaterialRates(payload.updates);
        }
      }
    } catch (err) {
      console.error("Failed to load live price board:", err);
    } finally {
      setRatesLoading(false);
    }
  };

  const fetchGallery = async () => {
    try {
      const resp = await fetch("/api/gallery");
      if (resp.ok) {
        const payload = await resp.json();
        if (payload.success) {
          setGalleryImages(payload.gallery);
        }
      }
    } catch (e) {
      console.error("Failed loading corporate project gallery:", e);
    }
  };

  const loadReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        setFetchedReviews(data);
      }
    } catch (err) {
      console.error("Failed loading remote customer reviews:", err);
    }
  };

  useEffect(() => {
    loadReviews();
    loadMaterialRates();
    fetchGallery();

    // Setup active fast-refresh interval for instant dealer-side changes
    const interval = setInterval(() => {
      loadMaterialRates();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewQuote) {
      setReviewMessage("Please provide your name and endorsement comment.");
      return;
    }
    setSubmittingReview(true);
    setReviewMessage("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: reviewName,
          role: reviewRole,
          quote: reviewQuote,
          rating: reviewRating
        })
      });
      if (res.ok) {
        setReviewMessage("Success! Your endorsement has been saved and is live in the registers.");
        setReviewName("");
        setReviewQuote("");
        loadReviews();
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewMessage("");
        }, 2200);
      } else {
        const d = await res.json();
        setReviewMessage(d.error || "Failed submitting feedback. Please retry.");
      }
    } catch (err: any) {
      setReviewMessage("Error connecting to server registers.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Smooth scroll helper
  const scrollToId = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const stats = [
    { label: "Authorized SNE Trust", value: "24+", suffix: "Years Supplier" },
    { label: "Construction Footprints", value: "1,850+", suffix: "AP Sites Served" },
    { label: "Automated Tint Colors", value: "1,000+", suffix: "Shades Available" },
    { label: "Project Site Dispatch", value: "99.8%", suffix: "Ontime Logistics" },
  ];

  // Wholesales brand certifications
  const brandPartners = [
    { name: "JSW Paints", badge: "Computerized Station", label: "Regional Outlet" },
    { name: "KCP Cement", badge: "OPC & PPC Strength", label: "Stockist" },
    { name: "Birla Putty", badge: "Weather Guard Base", label: "Direct Distributor" },
    { name: "Certified Steel", badge: "IS 1786 Quality", label: "Trade Agent" },
  ];

  const valueProps = [
    {
      title: "100% Genuine Materials",
      desc: "Straight from KCP Cement mills and official JSW depots with batch certifications.",
      icon: ShieldCheck,
      color: "from-emerald-500 to-teal-600 animate-pulse",
      glowBg: "rgba(16,185,129,0.15)"
    },
    {
      title: "Best Regional Wholesale Pricing",
      desc: "Transparent rates calculated daily based on wholesale factory margins. No middlemen price gouging.",
      icon: Percent,
      color: "from-orange-500 to-amber-600",
      glowBg: "rgba(249,115,22,0.15)"
    },
    {
      title: "Direct-To-Site Delivery",
      desc: "Equipped with dedicated transport mini-trucks for rapid, offloaded delivery across Bestavaripeta.",
      icon: Truck,
      color: "from-sky-500 to-indigo-600",
      glowBg: "rgba(14,165,223,0.15)"
    },
    {
      title: "Expert Tinting & Civil Support",
      desc: "In-house civil material engineers and computerized paint consultants to analyze CAD blueprints & shades.",
      icon: MessageSquare,
      color: "from-pink-500 to-rose-600",
      glowBg: "rgba(244,63,94,0.15)"
    }
  ];

  const featuredProducts = [
    {
      name: "JSW Halo Premium exterior Emulsion",
      type: "paints",
      desc: "Luxury anti-fungal outer protection coating with dynamic silicone base. Resists harsh Deccan heat and monsoon showers.",
      spec: "10L & 20L Buckets",
      rating: 5,
      isBest: true,
      badge: "Silicone Shield"
    },
    {
      name: "KCP premium PPC cement bag",
      type: "cement",
      desc: "Superior Portland Pozzolana Cement optimized for initial strength & heavy structures. High crack-resistance factor.",
      spec: "Standard 50KG Bags",
      rating: 5,
      isBest: true,
      badge: "High Grade"
    },
    {
      name: "Birla Aerocon Wall Shield Putty",
      type: "putty",
      desc: "Premium white cement-based putty base. Minimizes absorption, ensuring smooth paint application and maximum coverage.",
      spec: "40KG Heavy Sack",
      rating: 5,
      isBest: false,
      badge: "Flawless Base"
    },
    {
      name: "Fe 550D TMT Reinbar (12mm)",
      type: "rods",
      desc: "Thermo-mechanically treated high tensile steel bar. Supreme bendability and rib grip properties for column foundations.",
      spec: "12 Meter Standard Bar",
      rating: 5,
      isBest: true,
      badge: "Seismic Guard"
    }
  ];

  const swatchesPalette = [
    { name: "Alabaster Aura", hex: "#F2F0EA", code: "JSW-1002", label: "Srinagar Royal" },
    { name: "Kashmir Ivory Sand", hex: "#FFFDF6", code: "JSW-1004", label: "Classic Warmth" },
    { name: "Bestavaripeta Amber Glow", hex: "#FFF5E5", code: "JSW-1015", label: "Deccan Gold" },
    { name: "Andhra Monsoon Skies", hex: "#DBEAFE", code: "JSW-3011", label: "Cool Pastel Blue" },
    { name: "Deccan Saffron Clay", hex: "#F59E0B", code: "JSW-2015", label: "Earthy Terracotta" },
    { name: "Teal Lagoon", hex: "#14B8A6", code: "JSW-5042", label: "Lively Accents" },
  ];

  const prepopulatedWhatsApp = (topic: string) => {
    const text = `*New Material Inquiry for Sri Narayana Enterprises*\n\n` +
      `*Focus Area:* ${topic}\n` +
      `*Client Location:* Bestavaripeta / Andhra Pradesh\n` +
      `*Query:* Hello, I am viewing your premium website catalog and would like a wholesale price quote estimate for high-grade products. Please guide me through current booking slot rates.`;
    return `https://wa.me/919848742012?text=${encodeURIComponent(text)}`;
  };

  const defaultTestimonials = [
    {
      name: "T. Venkat Rao",
      role: "Lead Structural Contractor & Designer",
      quote: "Sri Narayana Enterprises supplies raw cement bags and metallurgical Fe 550D rods direct to our sites in Sri Nagar Colony. Their billing transparency is unmatched.",
      rating: 5,
    },
    {
      name: "Sujana Reddy",
      role: "Interior Decorator & Custom Consultant",
      quote: "The JSW computerized color cloning workstation is stunningly precise. Their team helps match absolute shade specs on spot in seconds.",
      rating: 5,
    },
    {
      name: "K. Satish Kumar",
      role: "Heavy Residential Build Partner",
      quote: "No middle-man overheads or unexpected delays. Bestavaripeta engineers highly value SNE's premium factory-direct distribution loop.",
      rating: 5,
    }
  ];  return (
    <div className="bg-white min-h-screen text-slate-800 relative overflow-hidden font-sans">
      
      {/* 1. PREMIUM HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center justify-center pt-36 pb-24 px-4 md:px-8 overflow-hidden text-center border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        {/* Full-width image background under transparent overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80" 
            alt="Modern Construction Site under golden rays" 
            className="w-full h-full object-cover opacity-8 scale-102"
          />
          {/* Subtle light offsets for clean commercial feel */}
          <div className="absolute inset-0 bg-white/70" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 w-full space-y-6">
          
          {/* Company Brand Logo for Mobile (Preceding everything else in Hero) */}
          <div className="md:hidden flex justify-center mb-2">
            <BrandLogo variant="horizontal" className="h-9 w-auto filter drop-shadow-sm" />
          </div>

          {/* Verified Badge */}
          <div className="inline-flex items-center gap-2 bg-[#FF7A00]/10 border border-[#FF7A00]/30 px-3.5 py-1.5 rounded-full text-[#FF7A00]">
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
              SRI NAGAR COLONY &bull; BESTAVARIPETA&apos;S AUTHORIZED SUPPLIER
            </span>
          </div>

          {/* Elegant Commercial Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-[#003366] uppercase">
              BUILD WITH THE <span className="text-[#FF7A00]">GOLD STANDARD</span> <br />
              OF CIVIL MATERIALS
            </h1>

            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed">
              Sri Narayana Enterprises is Bestavaripeta&apos;s certified regional stocking outlet. Partner with Andhra&apos;s direct distributor of JSW Paints custom tint finishes, Birla Wall Putty protection coats, high-strength KCP cement bags, and premium FE 550D TMT reinforcement rebars.
            </p>
          </div>

          {/* Hero Quick Trust Indicators */}
          <div className="flex flex-wrap justify-center gap-2 text-[9px] font-mono font-bold tracking-wider pt-1">
            <span className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl uppercase text-slate-700 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={11} className="text-[#FF7A00]" />
              KCP OPC/PPC Grade Mill Certified
            </span>
            <span className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl uppercase text-slate-700 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={11} className="text-[#FF7A00]" />
              JSW Tinting Station Partner
            </span>
            <span className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl uppercase text-slate-700 flex items-center gap-1.5 shadow-sm">
              <CheckCircle2 size={11} className="text-[#FF7A00]" />
              IS 1786 Tensile Compliance
            </span>
          </div>

          {/* Highlighted Call-to-Actions */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-3">
            <button 
              id="btn-hero-order-materials"
              type="button"
              onClick={() => scrollToId("product-categories-id")}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#FF7A00] hover:bg-orange-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-orange-500/10 cursor-pointer flex items-center justify-center gap-2 group font-sans border-0"
            >
              <span>Explore Materials</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <a 
              id="btn-hero-whatsapp-order"
              href={prepopulatedWhatsApp("General Inquiry")}
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <MessageSquare size={13} fill="currentColor" stroke="none" />
              <span>WhatsApp Inquiries</span>
            </a>

            <button 
              id="btn-hero-view-catalogue"
              type="button"
              onClick={() => scrollToId("product-categories-id")}
              className="hidden sm:flex w-full sm:w-auto px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#003366] font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer items-center justify-center border-0"
            >
              <span>View Products</span>
            </button>
          </div>

          {/* High Contrast Clean Stats Strip */}
          <div className="hidden md:block pt-8 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-white border border-slate-250/70 p-6 rounded-2xl shadow-sm">
              {stats.map((st) => (
                <div key={st.label} className="text-center space-y-0.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#FF7A00] font-mono leading-none">{st.value}</h3>
                  <p className="text-[10px] uppercase font-bold text-[#003366] tracking-tight">{st.label}</p>
                  <p className="text-[8px] font-mono text-slate-500 capitalize">{st.suffix}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* REAL-TIME MATERIAL PRICE BOARD */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 -mt-6 mb-8 relative z-20">
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[#003366]">Today's Live Material Rates</h3>
                <p className="text-[10px] text-slate-500 font-medium">Synced with Bestavaripeta wholesale depot indices</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "JSW Paints Tinting", category: "paint", info: "Computerized Premium Base (1 Litre)", val: 1050, oldVal: 1050, desc: "Stable rate index" },
              { label: "Birla Wall Putty", category: "putty", info: "White Premium base (40 KG)", val: 1150, oldVal: 1150, desc: "Bulk margins ready" },
              { label: "KCP OPC 53 Cement", category: "cement", info: "50 KG high strength bag", val: 480, oldVal: 480, desc: "Factory stock direct" },
              { label: "TMT Steel Rods", category: "steel", info: "FE 550D TMT reinforcement (Per Ton)", val: 65000, oldVal: 65000, desc: "IS certified ductile" },
            ].map((material) => {
              // Extract matching updates from the state database
              const dbMatches = materialRates.filter(r => r.category === material.category);
              let latestPrice = material.val;
              let previousPrice = material.oldVal;

              if (dbMatches.length > 0) {
                // Find latest update
                const sorted = [...dbMatches].sort((a, b) => b.id - a.id);
                latestPrice = sorted[0].new_price;
                previousPrice = sorted[0].old_price;
              }

              const hasUpTrend = latestPrice > previousPrice;
              const isFlat = latestPrice === previousPrice;

              return (
                <div key={material.label} className="bg-slate-50/50 border border-slate-150 p-4 rounded-xl flex flex-col justify-between hover:border-[#FF7A00]/40 transition-all">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start gap-1">
                      <span className="text-xs font-black uppercase text-slate-700 leading-tight">{material.label}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider py-0.5 px-2 rounded-md whitespace-nowrap shrink-0 ${
                        isFlat ? "bg-slate-100 text-slate-500" : hasUpTrend ? "bg-amber-50 text-amber-700 font-bold" : "bg-emerald-50 text-emerald-700 font-bold"
                      }`}>
                        {isFlat ? "Stable" : hasUpTrend ? "▲ Upward" : "▼ Downward"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">{material.info}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline justify-between">
                    <div>
                      <span className="block text-[8px] uppercase tracking-wider text-slate-400">Current Unit Base</span>
                      <span className="text-lg font-mono font-black text-[#003366]">₹{latestPrice.toLocaleString()}</span>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 font-mono tracking-tight">{material.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. PRODUCT CATEGORIES SECTION (4 Premium Cards) */}
      <section id="product-categories-id" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center bg-white">
        <div className="mb-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 border border-[#FF7A00]/30 px-3 py-1 rounded-full">
            <Building size={11} />
            AUTHORIZED DIRECT DIVISION
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-[#003366] tracking-tight">
            Our Certified <span className="text-[#FF7A00]">Product Lines</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Regional dealer stock pipelines. Select a product division to load exact measurements, customize metric requests, and calculate dynamic checkout costs.
          </p>
        </div>

        {/* 4 Premium Cards Grid with ENHANCED IMAGE SIZE as requested */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {catalogCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectTab(cat.id)}
              className="bg-white border-2 border-slate-100 hover:border-[#FF7A00]/50 rounded-2xl overflow-hidden cursor-pointer group flex flex-col justify-between transition-all duration-300 relative select-none shadow-sm hover:shadow-lg rounded-t-3xl"
            >
              {/* Product Card Image Banner - ENHANCED IMAGE HEIGHT */}
              <div className="relative h-64 sm:h-72 overflow-hidden bg-slate-100 border-b border-slate-100">
                <img 
                  src={cat.bgImage} 
                  alt={cat.title} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300 brightness-100 filter ease-out" 
                />
                {/* Visual Ribbon Overlay */}
                <span className="absolute top-4 right-4 text-[9px] font-mono font-black uppercase bg-[#003366] text-white px-3 py-1.5 rounded-lg shadow-md tracking-wider">
                  {cat.badge}
                </span>
                
                {/* Accent line */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF7A00]" />
              </div>

              {/* Text Container */}
              <div className="p-6 md:p-8 space-y-3 flex-grow flex flex-col justify-between text-left bg-white">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider block">
                    {cat.tagline}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#003366] uppercase tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {cat.desc}
                  </p>
                </div>

                {/* Micro Actions Panel */}
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest pt-4 border-t border-slate-100">
                  <span className="text-[#FF7A00] group-hover:text-orange-600 transition-colors cursor-pointer font-extrabold text-[11px] font-mono">
                    {cat.id === "paints" 
                      ? "Browse JSW Catalogue &rarr;" 
                      : cat.id === "rods" 
                        ? "Order Structural Steel &rarr;" 
                        : "Order Materials &rarr;"}
                  </span>
                  <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-[#003366] border border-slate-200 group-hover:bg-[#FF7A00] group-hover:text-white group-hover:border-transparent transition-all">
                    <ArrowRight size={13} />
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* District Civil Quick-Order Matrix */}
        <div className="hidden md:block mt-12 bg-slate-50 border border-slate-200 rounded-2xl p-6 max-w-5xl mx-auto text-left">
          <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-3">
            <div>
              <h4 className="text-xs font-black uppercase text-[#003366] tracking-wider">
                Direct Materials Link Shortcut
              </h4>
              <p className="text-[10px] uppercase font-mono text-slate-500 mt-0.5">
                Authorized Quick-Jump Catalog Counters
              </p>
            </div>
            <span className="text-[9px] font-mono text-slate-500">
              Verified Links
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              id="quick-order-paints"
              onClick={() => onSelectTab("paints")}
              className="flex flex-col items-center justify-between p-4 bg-white hover:bg-orange-55/40 border border-slate-200 hover:border-[#FF7A00]/40 rounded-xl cursor-pointer text-center group transition-all duration-300 min-h-[80px]"
            >
              <span className="text-xs font-bold text-slate-700 group-hover:text-[#FF7A00] uppercase tracking-wider block">
                Quick Order JSW Paints
              </span>
              <span className="text-[8px] font-mono text-slate-400 mt-1">
                Route: /paints
              </span>
            </button>

            <button
              id="quick-order-putty"
              onClick={() => onSelectTab("putty")}
              className="flex flex-col items-center justify-between p-4 bg-white hover:bg-orange-55/40 border border-slate-200 hover:border-[#FF7A00]/40 rounded-xl cursor-pointer text-center group transition-all duration-300 min-h-[80px]"
            >
              <span className="text-xs font-bold text-slate-700 group-hover:text-[#FF7A00] uppercase tracking-wider block">
                Quick Order Birla Putty
              </span>
              <span className="text-[8px] font-mono text-slate-400 mt-1">
                Route: /putty
              </span>
            </button>

            <button
              id="quick-order-cement"
              onClick={() => onSelectTab("cement")}
              className="flex flex-col items-center justify-between p-4 bg-white hover:bg-orange-55/40 border border-slate-200 hover:border-[#FF7A00]/40 rounded-xl cursor-pointer text-center group transition-all duration-300 min-h-[80px]"
            >
              <span className="text-xs font-bold text-slate-700 group-hover:text-[#FF7A00] uppercase tracking-wider block">
                Quick Order KCP Cement
              </span>
              <span className="text-[8px] font-mono text-slate-400 mt-1">
                Route: /cement
              </span>
            </button>

            <button
              id="quick-order-rods"
              onClick={() => onSelectTab("rods")}
              className="flex flex-col items-center justify-between p-4 bg-white hover:bg-orange-55/40 border border-slate-200 hover:border-[#FF7A00]/40 rounded-xl cursor-pointer text-center group transition-all duration-300 min-h-[80px]"
            >
              <span className="text-xs font-bold text-slate-700 group-hover:text-[#FF7A00] uppercase tracking-wider block">
                Quick Order FE 550D TMT
              </span>
              <span className="text-[8px] font-mono text-slate-400 mt-1">
                Route: /rods
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. WHY CHOOSE US */}
      <section className="relative py-12 md:py-16 px-4 md:px-8 bg-slate-50 border-t border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto text-center space-y-10">
          
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3 py-1.5 rounded-full">
              BUILDER COOPERATIVE ADVANTAGES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-[#003366]">
              Why Civil Partners Choose <span className="text-[#FF7A00]">SNE</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto leading-relaxed">
              We leverage direct manufacturer partnerships to avoid transport delay buffers, maintain grade compliance, and secure lower mill prices.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {valueProps.map((prop) => {
              const IconComp = prop.icon;
              return (
                <div
                  key={prop.title}
                  className="bg-white border border-slate-200/80 p-6 rounded-2xl relative transition-all duration-300 shadow-sm"
                >
                  {/* Subtle color label */}
                  <div className="w-10 h-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-[#FF7A00] mb-4">
                    <IconComp size={20} />
                  </div>

                  <h3 className="text-sm font-extrabold uppercase text-[#003366] tracking-tight mb-2">
                    {prop.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {prop.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 4. FEATURED PRODUCTS (Popular materials with specs) */}
      <section id="featured-products-id" className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center">
        <div className="mb-10 space-y-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 px-3 py-1 rounded-full border border-orange-200">
            POPULAR CIVIL SELECTIONS
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-[#003366] tracking-tight">
            High-Request <span className="text-[#FF7A00]">Build Essentials</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Order top-tier materials in custom bulk allocations. Get certified dispatch metrics and seamless factory supply credentials instantly.
          </p>
        </div>

        {/* Product Cards Grid with Minimalist Premium Design */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto text-left">
          {featuredProducts.map((p) => (
            <div
              key={p.name}
              className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[#FF7A00] transition-colors relative shadow-sm hover:shadow-md"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-700 rounded-md px-2 py-1">
                    {p.badge}
                  </span>
                  
                  {p.isBest && (
                    <span className="text-[8px] font-mono uppercase bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-md font-bold">
                      Regional Best seller
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                    {p.type.toUpperCase()} DIVISION
                  </h4>
                  <h3 className="text-sm font-extrabold text-[#003366] uppercase tracking-tight leading-snug min-h-[44px] flex items-center">
                    {p.name}
                  </h3>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed min-h-[44px]">
                  {p.desc}
                </p>

                {/* Rating & Size Spec */}
                <div className="flex items-center justify-between text-[10px] font-mono uppercase pt-2 border-t border-slate-100">
                  <span className="text-[#FF7A00] font-bold font-mono">
                    {p.spec}
                  </span>
                  <div className="flex gap-0.5 text-amber-500">
                    {[...Array(p.rating)].map((_, i) => (
                      <Star key={i} size={10} fill="currentColor" stroke="none" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => onSelectTab(p.type)}
                className="w-full py-2.5 bg-slate-50 hover:bg-[#FF7A00] text-[#003366] hover:text-white border border-slate-250 hover:border-transparent font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Select & Customize</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PAINT SHADE SHOWCASE */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-12 md:py-16 px-4 md:px-8 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3 py-1 rounded-full">
              JSW SPEC SHADES
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-[#003366]">
              Trending Paint <span className="text-[#FF7A00]">Shade Showcase</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Explore dynamic computerized color formulas matched on-site. Select a shade to test color compatibility in the physical Paints laboratory.
            </p>
          </div>

          {/* Color Palettes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {swatchesPalette.map((sw) => (
              <div
                key={sw.code}
                onClick={() => onSelectTab("paints")}
                className="bg-white border border-slate-200 rounded-xl p-4 text-left cursor-pointer space-y-3 hover:border-[#FF7A00] transition-colors shadow-sm"
              >
                <div 
                  className="w-full h-16 rounded-lg relative overflow-hidden border border-slate-100"
                  style={{ backgroundColor: sw.hex }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                </div>

                <div className="space-y-0.5">
                  <p className="text-[8px] font-mono text-[#FF7A00] font-bold uppercase tracking-wider leading-none">
                    {sw.label}
                  </p>
                  <h4 className="text-[11px] font-extrabold text-slate-700 uppercase tracking-tight leading-tight truncate">
                    {sw.name}
                  </h4>
                  <p className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                    {sw.code}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSelectTab("paints")}
              className="px-6 py-3 bg-[#003366] hover:bg-[#FF7A00] text-white font-bold tracking-wider uppercase text-[10px] rounded-xl transition-colors border-0 cursor-pointer"
            >
              Open Complete Shade Swatch Lab &rarr;
            </button>
          </div>

        </div>
      </section>

      {/* --- FEATURE 4: PROJECT GALLERY & COMPLETED WORKS --- */}
      <section className="bg-slate-50 border-t border-b border-slate-200 py-12 md:py-16 px-4 md:px-8 text-center" id="completed-works-gallery">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3 py-1 rounded-full">
              REAL SITE FOOTY & PORTFOLIO
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-[#003366]">
              Our Projects & Completed <span className="text-[#FF7A00]">Works</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Real-time dispatches, finished custom paintings, and reinforced civil foundations built with materials from Sri Narayana Enterprises.
            </p>
          </div>

          {/* Filter Categories Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
            {["All Works", "House Painting", "Commercial Projects", "Cement Deliveries", "Steel Deliveries", "Shop Photos"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-4 py-2 border rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  filterCategory === cat
                    ? "bg-[#003366] text-white border-transparent shadow"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtered Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto text-left">
            {(() => {
              const defaultGallery = [
                {
                  id: "def-1",
                  title: "Luxury Home Painting Color Tinting",
                  category: "House Painting",
                  image_url: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80",
                  description: "SNE computerized JSW paint shade mixed for Andhra residencies."
                },
                {
                  id: "def-2",
                  title: "Corporate Landmark Structural Foundation",
                  category: "Commercial Projects",
                  image_url: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
                  description: "Multi-ton Fe 550D structural build with direct site transport."
                },
                {
                  id: "def-3",
                  title: "KCP Cement Consignment Dispatch",
                  category: "Cement Deliveries",
                  image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                  description: "Fresh high-grade concrete sacks offloaded at Bestavaripeta."
                },
                {
                  id: "def-4",
                  title: "Seismic Steel TMT Reinforcement Rods",
                  category: "Steel Deliveries",
                  image_url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
                  description: "Premium high ductility metal rounds stacked safely in builder grid packs."
                },
                {
                  id: "def-5",
                  title: "Authorized Bestavaripeta Showroom Depot",
                  category: "Shop Photos",
                  image_url: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80",
                  description: "Our main computerized showroom interior and mechanical tint center."
                },
                {
                  id: "def-6",
                  title: "Duplex Residence Finishing Base Coat",
                  category: "House Painting",
                  image_url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
                  description: "Flawless Birla Wall Putty white base coat applied before paints."
                }
              ];

              // Combine DB gallery items with fallback defaults
              const combinedList = [...galleryImages, ...defaultGallery];
              const filteredMatches = combinedList.filter(item => 
                filterCategory === "All Works" || item.category === filterCategory
              );

              return filteredMatches.map((item, idx) => (
                <motion.div
                  layout
                  key={item.id || idx}
                  className="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelectedLightboxImg(item)}
                >
                  <div className="relative aspect-video bg-slate-100 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-[#003366] text-[#FF7A00] font-mono font-bold text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-md">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4 space-y-1">
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#FF7A00] transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description || "Official site materials delivered from Bestavaripeta showroom stack yards."}
                    </p>
                  </div>
                </motion.div>
              ));
            })()}
          </div>
        </div>

        {/* Lightbox Preview Modal overlay */}
        <AnimatePresence>
          {selectedLightboxImg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
                onClick={() => setSelectedLightboxImg(null)}
              />
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full relative z-10 border border-white/10 shadow-2xl"
              >
                <div className="relative aspect-video bg-slate-900">
                  <img 
                    src={selectedLightboxImg.image_url} 
                    alt={selectedLightboxImg.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain"
                  />
                  <button 
                    onClick={() => setSelectedLightboxImg(null)}
                    className="absolute top-4 right-4 h-8 w-8 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white flex items-center justify-center font-bold text-sm select-none border-0 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
                <div className="p-6 bg-[#003366] text-white">
                  <span className="text-[9px] font-mono font-black text-orange-400 bg-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedLightboxImg.category}
                  </span>
                  <h3 className="text-sm font-extrabold text-white mt-3 uppercase tracking-tight">
                    {selectedLightboxImg.title}
                  </h3>
                  <p className="text-xs text-orange-100/70 mt-1 lines-clamp-3 leading-relaxed">
                    {selectedLightboxImg.description || "Genuine wholesale construction materials manufactured and supplied direct to site build zones under SNE strict quality protocols."}
                  </p>
                  <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center text-[10px]">
                    <span className="text-slate-300 font-mono">Location: Prakasam District</span>
                    <a 
                      href={`https://wa.me/919848742012?text=${encodeURIComponent(`*Gallery Inquiry: ${selectedLightboxImg.title}*\n\nHello Sri Narayana Enterprises, I support your work portfolio and would like quotes for materials used in this project.`)}`}
                      target="_blank"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold uppercase tracking-wider text-white"
                    >
                      Inquire About This Work
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* 6. CUSTOMER REVIEWS & ENDORSEMENTS LISTING */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-16 text-center bg-white">
        <div className="mb-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3 py-1.5 rounded-full">
            <Users size={11} />
            REAL CONTRACTOR EXPERIENCES
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-[#003366] tracking-tight">
            Verified Site <span className="text-[#FF7A00]">Endorsements</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Direct customer reviews on SNE&apos;s trade operations, JSW tint accuracy, Fe 550D structural certificates, and district logistic offloading schedules.
          </p>
        </div>

        {/* Flat simple cards grid - replaced fancy scaling for minimalist commercial looks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto text-left">
          {[...fetchedReviews.slice(0, 3), ...defaultTestimonials].slice(0, 3).map((test, index) => (
            <div 
              key={index}
              className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-4 flex flex-col justify-between hover:border-[#FF7A00] transition-colors shadow-sm"
            >
              <div className="space-y-2">
                {/* 5 gold rating stars */}
                <div className="flex gap-0.5 text-amber-500">
                  {[...Array(Number(test.rating || 5))].map((_, i) => (
                    <Star key={i} size={11} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <p className="text-xs text-slate-600 italic leading-relaxed">
                  &ldquo;{test.quote || test.comment}&rdquo;
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wide">{test.name}</h5>
                <p className="text-[10px] text-[#FF7A00] font-mono font-semibold uppercase">{test.role}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Submit Review CTA */}
        <div className="mt-8">
          <button
            type="button"
            onClick={() => {
              setShowReviewModal(true);
              setReviewMessage("");
            }}
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-[#003366] border border-slate-200 hover:border-slate-350 rounded-xl text-[10px] uppercase tracking-wider font-bold transition-all duration-300 cursor-pointer shadow-sm"
          >
            ✍&nbsp; Submit Material Review
          </button>
        </div>
      </section>

      {/* Testimonial Submission Modal Overlay */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              onClick={() => setShowReviewModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-left font-sans">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-base font-extrabold uppercase text-[#003366] tracking-tight">
                    Submit Material Review
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your direct feedback maintains high supply quality standards across civil projects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-0"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitReview} className="space-y-4">
                {reviewMessage && (
                  <div className={`p-4 rounded-xl text-xs font-semibold ${reviewMessage.includes("Success") ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-orange-50 text-orange-700 border border-orange-200"}`}>
                    {reviewMessage}
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    Your Name / Contractor Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., K. Satish / Sai Structural Builders"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">
                      Business Designation / Role
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Concrete Subcontractor"
                      value={reviewRole}
                      onChange={(e) => setReviewRole(e.target.value)}
                      className="w-full bg-slate-55 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">
                      Ratings (1 to 5 Stars)
                    </label>
                    <div className="flex gap-1 pt-1.5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setReviewRating(num)}
                          className="cursor-pointer hover:scale-105 transition-transform border-0 bg-transparent"
                        >
                          <Star
                            size={16}
                            fill={num <= reviewRating ? "#F59E0B" : "none"}
                            stroke={num <= reviewRating ? "#F59E0B" : "#94A3B8"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">
                    Verified Endorsement Note *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details about warehouse dispatch rates, pricing genuineness, JSW shades quality..."
                    value={reviewQuote}
                    onChange={(e) => setReviewQuote(e.target.value)}
                    className="w-full bg-slate-55 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#FF7A00] leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full bg-[#FF7A00] hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50 border-0"
                >
                  {submittingReview ? "Submitting Review..." : "Publish Customer Endorsement"}
                </button>
              </form>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. CONTACT & WHATSAPP CTA BANNER (DARK BLUE ONLY AS ALLOWED) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 mb-16 relative z-10">
        <div className="bg-[#003366] text-white border border-blue-900 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="max-w-2xl mx-auto space-y-5 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[9px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">
              <HardHat size={11} className="text-[#FF7A00]" />
              ESTABLISHED REGIONAL SUPPLIER
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold uppercase text-white tracking-tight">
              Ready to Secure Today&apos;s <span className="text-[#FF7A00]">Wholesale Price Quote?</span>
            </h2>
            <p className="text-xs sm:text-sm text-blue-100">
              Submit architectural CAD specifications, apply for volume project pricing, or inquire about daily cement loading slots and physical reinforcement steel stock levels.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <a 
                href="tel:+919848742012"
                className="w-full sm:w-auto px-6 py-3.5 bg-[#FF7A00] hover:bg-orange-500 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <Phone size={13} fill="currentColor" />
                <span>Call Material Desk</span>
              </a>

              <a 
                href={prepopulatedWhatsApp("Bulk materials")}
                target="_blank" 
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
              >
                <MessageSquare size={13} fill="currentColor" stroke="none" />
                <span>WhatsApp Materials</span>
              </a>

              <button
                type="button"
                onClick={() => scrollToId("homepage-contact")}
                className="w-full sm:w-auto px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border-0 rounded-xl text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
              >
                Request Quote Layout
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURE 5: GOOGLE MAPS & REVIEWS --- */}
      <section className="bg-white border-t border-b border-slate-200 py-12 md:py-16 px-4 md:px-8" id="visit-showroom-locator">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 border border-[#FF7A00]/20 px-3 py-1 rounded-full">
              LOCAL DISTRIBUTOR VISIT
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-[#003366]">
              Visit Our <span className="text-[#FF7A00]">Showroom</span> & Depot
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Inspect our automated JSW computerized color deck and premium grade reinforcement steel rounds directly in outer Bestavaripeta.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto">
            
            {/* Left Box: Google Maps Embed */}
            <div className="lg:col-span-7 bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[350px] lg:min-h-auto">
              <iframe
                title="Sri Narayana Enterprises Bestavaripeta Dealer Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15367.668582733973!2d79.08889145!3d15.55114775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bb4ba235e982181%3A0x6b63d76b4a39b0d3!2sBestavaripeta%2C%20Andhra%20Pradesh!5e0!3m2!1sen!2sin!4v1717000000000!5m2!1sen!2sin"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* Right Box: Location coordinates & hours */}
            <div className="lg:col-span-5 bg-[#003366] text-white rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 shadow-md border border-white/5 relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 h-32 w-32 rounded-full bg-white/5 pointer-events-none" />
              
              <div className="space-y-4 relative z-10">
                <h3 className="text-xs font-mono font-black tracking-widest text-[#FF7A00] uppercase">
                  Showroom Headquarters & Stockyard
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-orange-200/70 font-bold mb-1">Corporate Address</span>
                    <p className="text-sm font-bold text-white">Sri Nagar Colony, Bestavaripeta,</p>
                    <p className="opacity-90">Prakasam District, Andhra Pradesh - 523334</p>
                    <p className="text-[10px] text-orange-300 font-mono mt-1">Plus Code: G4X2+8MV Prakasam AP</p>
                  </div>

                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-orange-200/70 font-bold mb-1">Business Hours</span>
                    <p className="text-sm font-bold text-white">Mon - Sat: 8:30 AM - 8:30 PM</p>
                    <p className="text-slate-300">Sunday closed, Emergency dispatches by scheduling only.</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-white/10 relative z-10 text-xs">
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=Sri+Narayana+Enterprises+Bestavaripeta+Andhra+Pradesh"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-11 bg-[#FF7A00] hover:bg-orange-500 text-slate-950 font-black uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99]"
                >
                  <MapPin size={14} className="text-slate-950" />
                  <span>Get Directions on Maps</span>
                </a>

                <div className="grid grid-cols-2 gap-3">
                  <a
                    href="tel:+919848742012"
                    className="h-11 bg-white/10 hover:bg-white/15 text-white border border-white/10 font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Phone size={13} />
                    <span>Call Desk</span>
                  </a>
                  <a
                    href={`https://wa.me/919848742012?text=${encodeURIComponent("*Directions & Visit Inquiry*\n\nHello Sri Narayana Enterprises, I am checking your Bestavaripeta showroom location coordinates to visit. Are you open for computerized tint color mixing today?")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-all"
                  >
                    <MessageSquare size={13} fill="currentColor" stroke="none" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Google Reviews and Leave Feedback Integration */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 md:p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Stars Score Panel */}
            <div className="md:col-span-4 text-center space-y-2 border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
              <div className="inline-flex items-center gap-1.5 bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full border border-[#FF7A00]/20">
                ⭐ Google Rated
              </div>
              <h4 className="text-4xl md:text-5xl font-mono font-black text-[#003366] leading-none">4.9 / 5.0</h4>
              
              <div className="flex items-center justify-center gap-1 text-yellow-500 py-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" stroke="none" />
                ))}
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wide">
                Based on 128 verified customer reports
              </p>
            </div>

            {/* Testimonials Ticker Sample */}
            <div className="md:col-span-5 text-left space-y-4">
              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm text-xs space-y-1.5">
                <div className="flex gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <p className="text-slate-600 italic">
                  "SNE has the most sophisticated JSW computer tint mixers in Bestavaripeta. Their wholesale pricing transparency saved my layout plastering budget over 15%."
                </p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Naveen K. (Architect)</span>
                  <span className="text-[#FF7A00] font-mono">1 Weeks Ago</span>
                </div>
              </div>

              <div className="bg-white border border-slate-150 p-4 rounded-2xl shadow-sm text-xs space-y-1.5">
                <div className="flex gap-0.5 text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} fill="currentColor" stroke="none" />
                  ))}
                </div>
                <p className="text-slate-600 italic">
                  "Unloaded 300 sacks KCP PPC Concrete bags and grade Fe 550D metallurgy rods at our Sri Nagar site inside 12 hours. Best dealer in Prakasam District."
                </p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase">
                  <span>Ramanjaneyulu T. (Contractor)</span>
                  <span className="text-[#FF7A00] font-mono">2 Weeks Ago</span>
                </div>
              </div>
            </div>

            {/* Leave a review block */}
            <div className="md:col-span-3 text-center md:text-left space-y-3">
              <h5 className="text-sm font-black text-[#003366] uppercase leading-tight">
                Support Our Bestavaripeta Depot!
              </h5>
              <p className="text-xs text-slate-500 leading-relaxed">
                Had a great materials experience with our computer paint mixer or steel delivery? Rate us on Google Maps!
              </p>
              <a
                href="https://search.google.com/local/writereview?placeid=ChIJmUxtuI9DzzoR_Q0U_hBf2E0"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 px-5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-bold uppercase text-[10px] tracking-wider rounded-xl items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                📝 Write Google Review
              </a>
            </div>

          </div>

        </div>
      </section>

      {/* Corporate FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pb-16 text-center">
        <div className="mb-8 space-y-1">
          <span className="text-[10px] font-mono font-bold text-[#FF7A00] uppercase tracking-wider">
            TECHNICAL DIRECTORY
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold uppercase text-[#003366] tracking-tight">Technical FAQ</h2>
        </div>

        <div className="text-left space-y-3">
          {[
            {
              q: "Are the cement and steel TMT prices direct from manufacturers?",
              a: "Yes. Sri Narayana Enterprises operates as an authorized dealer and stock supplier of KCP Cement bags and premium grade Fe 550D reinforcement steel. Wholesale cost indexes update daily based on factory mill notifications, keeping your project layout budget fully optimized and genuine with no middleman overhead charges."
            },
            {
              q: "Can I verify JSW paint shades before computerized mixing?",
              a: "Yes. Our physical Bestavaripeta showroom is equipped with certified JSW spectrum card selectors and computerized tint units. Customers can choose their base shades on visual cards, and our automated tint workstation dispenses the exact formulation in three minutes."
            },
            {
              q: "What is the dispatch protocol and transport duration?",
              a: "We arrange delivery via our SNE regional commercial vehicle fleet. Structural volume (such as high-grade steel rods or concrete sacks) is dispatched straight to site yards within 12 to 24 hours. Free distance coordinates are verified directly over phone or WhatsApp channels."
            }
          ].map((faq, idx) => {
            const isFaqActive = activeFaq === idx;
            return (
              <div 
                key={faq.q}
                className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isFaqActive ? null : idx)}
                  className="w-full px-5 py-3.5 flex justify-between items-center text-left hover:bg-slate-100 transition-colors cursor-pointer border-0 bg-transparent"
                >
                  <span className="text-xs sm:text-sm font-bold uppercase tracking-tight text-[#003366] leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown 
                    size={14} 
                    className={`text-[#FF7A00] transition-transform duration-200 ${isFaqActive ? 'rotate-180' : ''}`} 
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isFaqActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-200 bg-white"
                      transition={{ duration: 0.15 }}
                    >
                      <div className="px-5 py-3.5 text-xs text-slate-600 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* Authorized Desk Contact Segment */}
      <PremiumContactSection />

    </div>
  );
}
