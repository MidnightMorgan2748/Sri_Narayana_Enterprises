import React, { useState } from "react";
import { 
  ShoppingCart, Menu, X, Zap, LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";
import BrandLogo from "./BrandLogo";

interface HeaderProps {
  cart: CartItem[];
  currentTab: string;
  setTab: (tab: string) => void;
  openCart: () => void;
  openBot: () => void;
  loggedInRole: string | null;
  onLogout: () => void;
  designConfig: {
    primaryColor: string;
    accentColor: string;
    showHeroGlow: boolean;
    showHeroGrid: boolean;
    headerStyle: "standard" | "compact" | "accented";
    aiBotEnabled: boolean;
  };
}

export default function Header({ 
  cart, 
  currentTab, 
  setTab, 
  openCart, 
  openBot,
  loggedInRole,
  onLogout,
  designConfig
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const mainTabs = [
    { id: "home", label: "Home" },
    { id: "paints", label: "JSW Paints" },
    { id: "putty", label: "Wall Putty" },
    { id: "cement", label: "KCP Cement" },
    { id: "rods", label: "Steel Rods" },
    { id: "track-order", label: "Track Order" },
    { id: "my-orders", label: "My Orders" }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm transition-all duration-300">
      {/* Main Premium Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex justify-between items-center relative">
        {/* Company Brand Logo aligned perfectly with navigation items */}
        <div 
          onClick={() => { setTab("home"); setMobileMenuOpen(false); }} 
          className="cursor-pointer group flex items-center transition-all shrink-0 select-none"
          id="header-brand-logo"
        >
          <BrandLogo variant="horizontal" className="h-9 md:h-10 hover:scale-[1.01] transition-transform duration-300" lightBg={true} />
        </div>

        {/* Navigation Tabs - Desktop (Clean and Premium) */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-3 z-10" id="desktop-nav-menu">
          {mainTabs.map((tb) => {
            const isTabActive = currentTab === tb.id;
            return (
              <button
                key={tb.id}
                onClick={() => { setTab(tb.id); }}
                className={`relative px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer ${
                  isTabActive
                    ? "text-[#FF7A00]"
                    : "text-slate-600 hover:text-[#003366]"
                }`}
              >
                <span className="relative z-10">{tb.label}</span>
                {isTabActive && (
                  <motion.span
                    layoutId="headerTabIndicator"
                    className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-[#FF7A00] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}

          {/* View Cart as requested explicitly in the single clean navigation header */}
          <button
            onClick={openCart}
            className={`relative px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
              cartCount > 0 ? "text-[#FF7A00]" : "text-slate-600 hover:text-[#003366]"
            }`}
          >
            <ShoppingCart size={13} className="shrink-0" />
            <span>View Cart</span>
            {cartCount > 0 && (
              <span className="ml-1 bg-[#FF7A00] text-white text-[10px] font-black rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Widgets Area (AI Estimator and Session Indicators) */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Admin Session Indicator Pill (Subtle & clean) */}
          {loggedInRole && (
            <div className="hidden lg:flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-[10px] font-mono text-slate-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="uppercase font-bold">
                {loggedInRole === 'owner' ? 'Admin' : 'Dev'}
              </span>
              <button
                onClick={onLogout}
                className="hover:text-red-600 text-slate-500 font-bold ml-1.5 pl-1.5 border-l border-slate-200 flex items-center gap-1"
                title="Logout session"
              >
                <LogOut size={10} />
                <span>EXIT</span>
              </button>
            </div>
          )}

          {/* AI Advisor Badge */}
          {designConfig?.aiBotEnabled && (
            <button
              onClick={openBot}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#003366]/5 border border-[#003366]/10 hover:bg-[#003366]/10 text-[#003366] rounded-full text-[10px] font-bold font-mono transition-all uppercase tracking-wide cursor-pointer"
              title="Ask Materials AI Assistant"
            >
              <Zap size={11} className="text-[#FF7A00] animate-pulse" />
              <span>AI Estimator</span>
            </button>
          )}

          {/* Mobile view cart shortcut */}
          <button
            onClick={openCart}
            className="md:hidden relative p-2 text-slate-700 hover:text-[#FF7A00] transition-colors"
            title="Cart"
          >
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#FF7A00] text-white text-[9px] font-extrabold rounded-full h-4 w-4 flex items-center justify-center shadow-md animate-bounce">
                {cartCount}
              </span>
            )}
          </button>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-700 hover:text-[#FF7A00] transition-colors rounded-lg hover:bg-slate-50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} className="text-[#FF7A00]" /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile navigation drop-down menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-slate-100 overflow-hidden shadow-inner font-sans"
          >
            <div className="flex flex-col py-3 px-4 space-y-1">
              {mainTabs.map((tb) => {
                const isTabActive = currentTab === tb.id;
                return (
                  <button
                    key={tb.id}
                    onClick={() => {
                      setTab(tb.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                      isTabActive
                        ? "bg-[#FF7A00]/10 text-[#FF7A00]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {tb.label}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCart();
                }}
                className="w-full text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center justify-between border-t border-slate-100 mt-1 pt-3"
              >
                <div className="flex items-center gap-2">
                  <ShoppingCart size={15} className="text-[#FF7A00]" />
                  <span>View Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className="bg-[#FF7A00] text-white text-[10px] font-black rounded-full h-5 px-2 flex items-center justify-center">
                    {cartCount} Items
                  </span>
                )}
              </button>

              {designConfig?.aiBotEnabled && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openBot();
                  }}
                  className="w-full text-left py-2.5 px-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-100 flex items-center gap-2 bg-slate-50 rounded-lg mt-1"
                >
                  <Zap size={14} className="text-[#FF7A00]" />
                  <span>AI Estimator Assistant</span>
                </button>
              )}

              {loggedInRole && (
                <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between px-3 text-[10px] font-mono text-slate-500">
                  <span className="uppercase">Logged in: {loggedInRole}</span>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-red-500 font-extrabold"
                  >
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
