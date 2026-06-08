import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import PaintsPage from "./components/PaintsPage";
import PuttyPage from "./components/PuttyPage";
import CementPage from "./components/CementPage";
import SteelRodsPage from "./components/SteelRodsPage";
import TrackOrderPage from "./components/TrackOrderPage";
import MyOrdersPage from "./components/MyOrdersPage";
import CartModal from "./components/CartModal";
import AdminPortal from "./components/AdminPortal";
import AdminDashboard from "./components/AdminDashboard";
import ConsultationBot from "./components/ConsultationBot";
import { CartItem, Order } from "./types";
import { HashRouter as Router, useLocation, useNavigate } from "react-router-dom";
import { Phone, ShoppingCart, Truck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import BrandLogo from "./components/BrandLogo";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tab = (() => {
    const path = location.pathname;
    if (path === "/paints") return "paints";
    if (path === "/putty") return "putty";
    if (path === "/cement") return "cement";
    if (path === "/rods") return "rods";
    if (path === "/track-order") return "track-order";
    if (path === "/my-orders") return "my-orders";
    if (path === "/admin" || path === "/owner-panel") return "owner-panel";
    return "home";
  })();

  const setTab = (newTab: string) => {
    // Force callback to prevent router updates during active render pass
    setTimeout(() => {
      if (newTab === "home") {
        navigate("/");
      } else {
        navigate("/" + newTab);
      }
    }, 0);
  };

  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [botOpen, setBotOpen] = useState(false);

  // Prefilled tracking coordinates
  const [trackOrderId, setTrackOrderId] = useState("");
  const [trackMobile, setTrackMobile] = useState("");

  // Hidden Owner Access Trigger & Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logoTaps, setLogoTaps] = useState<number[]>([]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleFooterLogoTap = () => {
    const now = Date.now();
    setLogoTaps((prev) => {
      // Keep only taps in the last 5 seconds
      const filtered = [...prev, now].filter((t) => now - t <= 5000);
      if (filtered.length >= 5) {
        setToastMessage("Owner Access Activated");
        setTab("owner-panel");
        return [];
      }
      return filtered;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Shift + O
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "o") {
        e.preventDefault();
        setToastMessage("Owner Access Activated");
        setTab("owner-panel");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Secure Authentication & Role based states
  const [loggedInRole, setLoggedInRole] = useState<string | null>(
    localStorage.getItem("sne_auth_role") || null
  );

  // Website design variables controlled by developers
  const [designConfig, setDesignConfig] = useState({
    primaryColor: "#003366",
    accentColor: "#FF8C00",
    showHeroGlow: true,
    showHeroGrid: true,
    headerStyle: "standard" as "standard" | "compact" | "accented",
    aiBotEnabled: true,
    particleSpeed: "normal" as "slow" | "normal" | "fast"
  });

  // Simulated live workspace debug logger for developers
  const [systemLogs, setSystemLogs] = useState<string[]>([
    "System: Sri Narayana Enterprises Web Workspace Initialized.",
    "System: Core assets cached (paints, cement catalogs).",
    "System: Secured port gateway 3000 running behind sandbox proxy ingress."
  ]);

  const addSystemLog = (log: string) => {
    setSystemLogs((prev) => [...prev, log]);
  };

  // Shop Owner configurable metadata (persisted in local state, configurable in admin)
  const [shopWhatsAppNumber, setShopWhatsAppNumber] = useState("+91 98487 42012");

  // Server loaded configs
  const [inventoryConfig, setInventoryConfig] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch Inventory and Orders context on mount
  const fetchInventory = async () => {
    try {
      const res = await fetch("/api/inventory");
      if (res.ok) {
        const data = await res.json();
        if (data) setInventoryConfig(data);
      }
    } catch (err) {
      console.error("Failed to connect to API inventory configuration:", err);
    }
  };

  const fetchOrders = async (roleOverride?: string) => {
    const activeRole = roleOverride || loggedInRole || "";
    if (activeRole !== "owner" && activeRole !== "Super Admin" && activeRole !== "Staff") {
      setOrders([]);
      return;
    }
    try {
      const res = await fetch("/api/orders", {
        headers: { 
          "X-Access-Role": activeRole === "Super Admin" ? "super_admin" : "staff",
          "X-Admin-Email": localStorage.getItem("sne_auth_email") || "Super Admin"
        }
      });
      if (res.status === 401 || res.status === 403) {
        console.warn("Administrative access revoked/denied. Syncing redirect on client side.");
        handleLogout();
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        console.warn("Authorization Denied fetching business records.");
      }
    } catch (err) {
      console.error("Failed to connect to order logs API:", err);
    }
  };

  useEffect(() => {
    fetchInventory();
    if (loggedInRole === "owner" || loggedInRole === "Super Admin" || loggedInRole === "Staff") {
      fetchOrders(loggedInRole);
      // Real-time automatic polling to retrieve newly submitted orders instantly
      const interval = setInterval(() => {
        fetchOrders(loggedInRole);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setOrders([]);
    }
  }, [loggedInRole]);

  // Sync state actions
  const handleAddToCart = (item: Omit<CartItem, "id">) => {
    setCart((prevCart) => {
      // Form unique cart item id: (paints: type+color+size | others: type+name+size)
      const modifiers = item.colorName ? `_${item.colorName}` : "";
      const itemId = `${item.type}${modifiers}_${item.size}`;

      const existingItemIdx = prevCart.findIndex((i) => i.id === itemId);
      if (existingItemIdx > -1) {
        const updated = [...prevCart];
        updated[existingItemIdx].quantity += item.quantity;
        return updated;
      } else {
        return [...prevCart, { ...item, id: itemId }];
      }
    });
  };

  const handleUpdateQty = (itemId: string, qty: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + qty;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const handleRemoveItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Admin states actions
  const handleDeleteOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, { 
        method: "DELETE",
        headers: {
          "X-Access-Role": loggedInRole === "Super Admin" ? "super_admin" : "staff",
          "X-Admin-Email": localStorage.getItem("sne_auth_email") || "Super Admin"
        }
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const errInfo = await res.json();
        alert(errInfo.error || "Failed to delete order entry.");
      }
    } catch (err) {
      console.error("Failed to delete order item:", err);
    }
  };

  const handleUpdateStatus = async (id: string, status: "pending" | "dispatched" | "delivered") => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "X-Access-Role": loggedInRole === "Super Admin" ? "super_admin" : "staff",
          "X-Admin-Email": localStorage.getItem("sne_auth_email") || "Super Admin"
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchOrders();
      } else {
        const errInfo = await res.json();
        alert(errInfo.error || "Failed to update status.");
      }
    } catch (err) {
      console.error("Failed to modify order status:", err);
    }
  };

  const handleSaveInventory = async (updated: any) => {
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-Access-Role": loggedInRole === "Super Admin" ? "super_admin" : "staff",
          "X-Admin-Email": localStorage.getItem("sne_auth_email") || "Super Admin"
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        const payload = await res.json();
        setInventoryConfig(payload.data);
        addSystemLog("System: Inventory pricing matrix updated successfully in database.");
      } else {
        const errInfo = await res.json();
        alert(errInfo.error || "Failed to preserve live updates.");
      }
    } catch (err) {
      console.error("Failed to update inventory price matrices:", err);
    }
  };

  // Auth Operations
  const handleLoginSuccess = (role: string, email: string) => {
    localStorage.setItem("sne_auth_role", role);
    localStorage.setItem("sne_auth_email", email);
    setLoggedInRole(role);
    fetchOrders(role);
    addSystemLog(`System: Identity authenticated as [${role.toUpperCase()}]. Dashboard sync completed.`);
  };

  const handleLogout = () => {
    localStorage.removeItem("sne_auth_role");
    localStorage.removeItem("sne_auth_email");
    setTimeout(() => {
      setLoggedInRole(null);
      setOrders([]);
      addSystemLog("System: Closed active role session safely.");
      setTab("home");
      if (
        window.location.pathname.includes("admin") || 
        window.location.pathname.includes("owner-panel") ||
        window.location.hash.includes("admin") ||
        window.location.hash.includes("owner-panel")
      ) {
        window.location.href = "/";
      }
    }, 0);
  };

  // Immediate Single Item WhatsApp Checkout Handler
  const handleSingleWhatsAppOrder = (item: Omit<CartItem, "id">) => {
    let text = `*SRI NARAYANA ENTERPRISES FAST ORDER*\n`;
    text += `-----------------------------------------\n`;
    text += `*Request Category:* ${item.type.toUpperCase()}\n`;
    text += `*Material Name:* ${item.name}\n`;
    if (item.colorName) {
      text += `*JSW Color shade:* ${item.colorName} (${item.shadeCode})\n`;
    }
    text += `*Requested Size:* *${item.size}*\n`;
    text += `*Quantity Required:* *${item.quantity}*\n`;
    text += `*Estimated rate:* ₹${item.price * item.quantity}\n`;
    text += `-----------------------------------------\n`;
    text += `_Please arrange transport quotation and dispatch details._\n`;

    const encoded = encodeURIComponent(text);
    const sanitizedPhone = shopWhatsAppNumber.replace(/\D/g, "");
    const url = `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encoded}`;
    window.open(url, "_blank");
  };

  // Fallback defaults if inventoryconfig isn't initialized yet
  const paintsPrices = inventoryConfig?.paintPacks || {
    "1L": 280,
    "4L": 1050,
    "10L": 2450,
    "20L": 4700,
    "50L": 11000
  };

  const puttyPrices = inventoryConfig?.puttyPrices || {
    "White Wall Putty_20 KG": 620,
    "White Wall Putty_25 KG": 760,
    "White Wall Putty_40 KG": 1150,
    "Premium Wall Putty_20 KG": 750,
    "Premium Wall Putty_25 KG": 910,
    "Premium Wall Putty_40 KG": 1380,
    "Waterproof Wall Putty_20 KG": 880,
    "Waterproof Wall Putty_25 KG": 1080,
    "Waterproof Wall Putty_40 KG": 1650
  };

  const cementPrices = inventoryConfig?.cementPrices || {
    "KCP OPC 53 Grade": 480,
    "KCP PPC Cement": 440
  };

  const rodPrices = inventoryConfig?.rodPrices || {
    "6mm": 210,
    "8mm": 350,
    "10mm": 520,
    "12mm": 750,
    "16mm": 1320,
    "20mm": 2070,
    "25mm": 3350,
    "32mm": 5400
  };

  const isAdminRoute = 
    location.pathname === "/admin" || 
    location.pathname === "/owner-panel" || 
    tab === "owner-panel";

  if (isAdminRoute) {
    if (isMobile) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#071A35] p-6 text-center select-none" id="mobile-admin-access-restricted">
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-8 max-w-sm space-y-6 shadow-2xl">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <span className="text-xl font-bold">⚠️</span>
            </div>
            <h2 className="text-sm font-black uppercase text-white tracking-tight">Administrative Terminal Restricted</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Sri Narayana Enterprises security protocols isolate dispatch logs, inventory price adjusters, and customer details to secure desktop register terminals only.
            </p>
            <button
              onClick={() => {
                setTab("home");
              }}
              className="w-full bg-[#FF7A00] hover:bg-orange-500 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              Return to Catalog
            </button>
          </div>
        </div>
      );
    }

    return (
      <AdminPortal
        loggedInRole={loggedInRole}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        orders={orders}
        onDeleteOrder={handleDeleteOrder}
        onUpdateStatus={handleUpdateStatus}
        inventoryConfig={inventoryConfig || {
          paintPacks: paintsPrices,
          puttyPrices: puttyPrices,
          cementPrices: cementPrices,
          rodPrices: rodPrices
        }}
        onSaveInventory={handleSaveInventory}
        shopWhatsAppNumber={shopWhatsAppNumber}
        onUpdateWhatsAppConfig={(num) => setShopWhatsAppNumber(num)}
      >
        <AdminDashboard
          orders={orders}
          onDeleteOrder={handleDeleteOrder}
          onUpdateStatus={handleUpdateStatus}
          inventoryConfig={inventoryConfig || {
            paintPacks: paintsPrices,
            puttyPrices: puttyPrices,
            cementPrices: cementPrices,
            rodPrices: rodPrices
          }}
          onSaveInventory={handleSaveInventory}
          shopWhatsAppNumber={shopWhatsAppNumber}
          onUpdateWhatsAppConfig={(num) => setShopWhatsAppNumber(num)}
          loggedInRole={loggedInRole}
          onLogout={handleLogout}
        />
      </AdminPortal>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7F9] text-slate-950 selection:bg-[#FF8C00] selection:text-white font-sans animate-fade-in animate-duration-300">
      {/* Subtle floating Owner Access activation toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] bg-[#030E1E] border border-[#FF7A00]/40 text-orange-400 font-sans font-bold px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
            id="owner-access-toast"
          >
            <span className="h-2.5 w-2.5 rounded-full bg-[#FF7A00] animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dynamic Style injection overriding default colors and styles globally as requested by developers */}
      <style>{`
        /* Dynamic theme colors */
        .bg-\\[\\#003366\\] { background-color: ${designConfig.primaryColor} !important; }
        .text-\\[\\#003366\\] { color: ${designConfig.primaryColor} !important; }
        .border-\\[\\#003366\\] { border-color: ${designConfig.primaryColor} !important; }
        .bg-\\[\\#FF8C00\\] { background-color: ${designConfig.accentColor} !important; }
        .text-\\[\\#FF8C05\\] { color: ${designConfig.accentColor} !important; }
        .text-\\[\\#FF8C00\\] { color: ${designConfig.accentColor} !important; }
        .border-\\[\\#FF8C00\\] { border-color: ${designConfig.accentColor} !important; }
        .selection\\:bg-\\[\\#FF8C00\\]::selection { background-color: ${designConfig.accentColor} !important; }
        
        /* Compact Header styling rule override if requested by developer */
        ${designConfig.headerStyle === "compact" ? `
          header .py-3\\.5 { padding-top: 0.5rem !important; padding-bottom: 0.5rem !important; }
          header .max-w-7xl h1 { font-size: 1.1rem !important; }
          header svg { scale: 0.8 !important; }
        ` : ""}
      `}</style>

      {/* Universal Sticky Header Navigation */}
      <Header
        cart={cart}
        currentTab={tab}
        setTab={setTab}
        openCart={() => setCartOpen(true)}
        openBot={() => setBotOpen(true)}
        loggedInRole={loggedInRole}
        onLogout={handleLogout}
        designConfig={designConfig}
      />

      {/* Horizontal Swipeable Category Bar for Mobile (below 768px, hidden on desktop and admin) */}
      {!isAdminRoute && (
        <div className="md:hidden sticky top-[56px] z-30 bg-[#071A35]/95 border-b border-white/5 backdrop-blur-md py-3 px-4 overflow-x-auto scrollbar-none flex gap-2.5 select-none shrink-0" id="mobile-categories-chips">
          {[
            { id: "home", label: "Home", icon: "🏠" },
            { id: "paints", label: "JSW Paints", icon: "🎨" },
            { id: "putty", label: "Wall Putty", icon: "🧱" },
            { id: "cement", label: "KCP Cement", icon: "🪨" },
            { id: "rods", label: "Steel Rods", icon: "⚔️" },
          ].map((item) => {
            const isActive = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border duration-200 cursor-pointer ${
                  isActive
                    ? "bg-[#FF7A00] text-slate-950 border-[#FF7A00]"
                    : "bg-white/5 text-white/80 border-white/10 hover:bg-white/10"
                }`}
                style={{ height: "36px" }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Primary Tab content panel */}
      <main className="flex-1 w-full relative pb-24 md:pb-0">
        {tab === "home" && (
          <HomePage 
            onSelectTab={(selectedTab) => setTab(selectedTab)} 
            onFooterLogoTap={handleFooterLogoTap}
            designConfig={designConfig}
          />
        )}

        {tab === "paints" && (
          <PaintsPage
            onAddToCart={handleAddToCart}
            onWhatsAppOrder={handleSingleWhatsAppOrder}
            paintPacks={paintsPrices}
          />
        )}

        {tab === "putty" && (
          <PuttyPage
            onAddToCart={handleAddToCart}
            onWhatsAppOrder={handleSingleWhatsAppOrder}
            prices={puttyPrices}
          />
        )}

        {tab === "cement" && (
          <CementPage
            onAddToCart={handleAddToCart}
            onWhatsAppOrder={handleSingleWhatsAppOrder}
            prices={cementPrices}
          />
        )}

        {tab === "rods" && (
          <SteelRodsPage
            onAddToCart={handleAddToCart}
            onWhatsAppOrder={handleSingleWhatsAppOrder}
            prices={rodPrices}
          />
        )}

        {tab === "track-order" && (
          <TrackOrderPage
            onBackToHome={() => setTab("home")}
            shopWhatsAppNumber={shopWhatsAppNumber}
            initialOrderId={trackOrderId}
            initialMobile={trackMobile}
          />
        )}

        {tab === "my-orders" && (
          <MyOrdersPage
            onBackToHome={() => setTab("home")}
            onTrackOrder={(orderId, mobile) => {
              setTrackOrderId(orderId);
              setTrackMobile(mobile);
              setTab("track-order");
            }}
          />
        )}
      </main>

      {/* Cart Modal Slide Over */}
      {cartOpen && (
        <CartModal
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          shopWhatsAppNumber={shopWhatsAppNumber}
          onOrderPlaced={() => {
            if (loggedInRole === "owner" || loggedInRole === "Super Admin" || loggedInRole === "Staff") {
              fetchOrders(loggedInRole);
            }
          }}
          onTrackOrder={(orderId, mobile) => {
            setTrackOrderId(orderId);
            setTrackMobile(mobile);
            setTab("track-order");
            setCartOpen(false);
          }}
        />
      )}

      {/* AI Estimator Floating Panel Bot - Guided by design config switch */}
      {botOpen && designConfig.aiBotEnabled && (
        <ConsultationBot onClose={() => setBotOpen(false)} />
      )}

      {/* Footer credits bar */}
      <footer className="bg-[#003366] text-slate-100/90 text-xs pt-12 pb-8 border-t-4 border-[#FF8C00] select-none font-sans">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 mb-8 border-b border-white/10 pb-8">
          {/* Column 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div 
              onClick={handleFooterLogoTap}
              className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-95 inline-block"
              id="app-footer-logo-trigger"
              title="Click 5 times for Owner Access"
            >
              <BrandLogo variant="horizontal" className="h-6 md:h-7 opacity-95 hover:opacity-100" />
            </div>
            <p className="text-xs text-orange-100/70 leading-relaxed max-w-sm">
              Sri Narayana Enterprises is Bestavaripeta's certified regional outlet, providing automated JSW Paints mixing, Birla Wall Putty, high-strength KCP Cement, and premium TMT steel bars.
            </p>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono">
              Authorized Materials
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button onClick={() => setTab("paints")} className="hover:text-[#FF7A00] transition-colors cursor-pointer text-left">
                  &bull; JSW Paints Tinting
                </button>
              </li>
              <li>
                <button onClick={() => setTab("putty")} className="hover:text-[#FF7A00] transition-colors cursor-pointer text-left">
                  &bull; Premium Wall Putty
                </button>
              </li>
              <li>
                <button onClick={() => setTab("cement")} className="hover:text-[#FF7A00] transition-colors cursor-pointer text-left">
                  &bull; KCP OPC & PPC Cement
                </button>
              </li>
              <li>
                <button onClick={() => setTab("rods")} className="hover:text-[#FF7A00] transition-colors cursor-pointer text-left">
                  &bull; Fe 550D TMT Steel Rods
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Showroom Helpdesk */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-orange-400 font-mono">
              Contact & Showroom Hub
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <p className="flex items-start gap-1.5">
                <span className="text-[#FF7A00] font-bold shrink-0">Tel:</span>
                <a href="tel:+919848742012" className="hover:text-[#FF7A00] transition-colors text-white font-mono font-bold">+91 98487 42012</a>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-[#FF7A00] font-bold shrink-0">Email:</span>
                <a href="mailto:venkateshkarnati16@gmail.com" className="hover:text-[#FF7A00] transition-colors text-white font-mono break-all">venkateshkarnati16@gmail.com</a>
              </p>
              <p className="flex items-start gap-1.5">
                <span className="text-[#FF7A00] font-bold shrink-0">Showroom:</span>
                <span className="text-white">Sri Nagar Colony, Bestavaripeta, Prakasam Dist, Andhra Pradesh - 523334</span>
              </p>
              <p className="flex items-start gap-1.5 text-[11px] text-orange-100/60 font-mono">
                <span>Hours: Mon - Sat: 8:30 AM - 8:30 PM</span>
              </p>
            </div>
          </div>
        </div>

        {/* Sub-footer Area */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-orange-100/50 text-[11px]">
          <span>&copy; {new Date().getFullYear()} Sri Narayana Enterprises. All Rights Reserved.</span>
          <div className="text-[10px] font-mono uppercase tracking-widest flex flex-wrap gap-x-4 gap-y-1 justify-center text-orange-300/40 font-medium">
            <span>IS 1786 Metal standards</span>
            <span>•</span>
            <span>JSW computerized tinting</span>
            <span>•</span>
            <span>KCP Factory pricing dealer</span>
          </div>
        </div>
      </footer>

      {/* Sticky Bottom Action Bar for Mobile Screens (<768px/md) */}
      {!isAdminRoute && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#030E1E]/95 border-t border-white/10 backdrop-blur-md py-3 px-4 flex justify-between items-center gap-3.5 z-50 shadow-2xl h-[72px]">
          <a
            id="mobile-sticky-call"
            href="tel:+919848742012"
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-[#FF7A00] text-[#030E1E] font-sans font-black uppercase text-[9px] tracking-wider rounded-xl h-[48px] active:scale-95 transition-all shadow-md"
          >
            <Phone size={13} className="text-[#030E1E]" />
            <span>Call</span>
          </a>

          <a
            id="mobile-sticky-whatsapp"
            href={`https://wa.me/919848742012?text=${encodeURIComponent("*New Material Inquiry for Sri Narayana Enterprises*\n\n*Source:* Mobile App Action Bar\n*Query:* Hello, I am viewing your mobile catalog and would like to get quotes and place an order.")}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-emerald-600 text-white font-sans font-black uppercase text-[9px] tracking-wider rounded-xl h-[48px] active:scale-95 transition-all shadow-md"
          >
            <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.01 14.19 1.01 11.999 1.01c-5.444 0-9.866 4.372-9.87 9.802 0 1.814.504 3.59 1.46 5.162l-1.02 3.725 3.832-1.002h.156zm10.744-6.496c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            <span>Ask</span>
          </a>

          <button
            id="mobile-sticky-cart"
            onClick={() => setCartOpen(true)}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-900 border border-white/10 hover:border-white/20 text-white font-sans font-black uppercase text-[9px] tracking-wider rounded-xl h-[48px] active:scale-95 transition-all shadow-md relative cursor-pointer"
          >
            <ShoppingCart size={13} className="text-[#FF7A00]" />
            <span>Cart ({cart.reduce((acc, item) => acc + item.quantity, 0)})</span>
          </button>

          <button
            id="mobile-sticky-track"
            onClick={() => setTab("track-order")}
            className="flex-1 flex flex-col items-center justify-center gap-1 bg-slate-850 border border-white/10 text-orange-400 font-sans font-black uppercase text-[9px] tracking-wider rounded-xl h-[48px] active:scale-95 transition-all shadow-md relative cursor-pointer"
          >
            <Truck size={13} className="text-orange-400" />
            <span>Track</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
