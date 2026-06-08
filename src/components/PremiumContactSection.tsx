import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Phone, Mail, MapPin, CheckCircle2, 
  MessageSquare, Clock, ShieldCheck
} from "lucide-react";

interface PremiumContactSectionProps {
  onSuccessSubmit?: (data: any) => void;
}

export default function PremiumContactSection({ onSuccessSubmit }: PremiumContactSectionProps) {
  // Simple form state
  const [name, setName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [interest, setInterest] = useState("JSW Paints");
  const [message, setMessage] = useState("");
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Simple and professional validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Please enter your name.";
    if (!emailOrPhone.trim()) {
      newErrors.emailOrPhone = "Please enter your email or phone number.";
    }
    if (!message.trim()) newErrors.message = "Please write a brief message of interest.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setIsSuccess(true);
      if (onSuccessSubmit) {
        onSuccessSubmit({ name, emailOrPhone, interest, message });
      }
    }, 1000);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setName("");
    setEmailOrPhone("");
    setInterest("JSW Paints");
    setMessage("");
  };

  // Modern WhatsApp link
  const getWhatsAppLink = () => {
    const text = `*New Inquiry for Sri Narayana Enterprises*\n\n` +
      `*Name:* ${name || "Client"}\n` +
      `*Contact:* ${emailOrPhone || "N/A"}\n` +
      `*Product:* ${interest}\n` +
      `*Message:* ${message || "Query about paint/putty/cement/steel."}`;
    return `https://wa.me/919848742012?text=${encodeURIComponent(text)}`;
  };

  return (
    <section 
      id="homepage-contact" 
      className="relative text-white py-20 px-4 md:px-8 bg-[#020C1B] overflow-hidden border-t border-[#FF7A00]/10"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#ff7a00_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-1/2 left-[-100px] w-80 h-80 bg-gradient-to-tr from-[#FF7A00]/5 to-transparent rounded-full filter blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Simplified Section Heading */}
        <div className="text-center mb-12 space-y-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-black text-[#FF7A00] uppercase tracking-widest bg-[#FF7A00]/10 border border-[#FF7A00]/25 px-4 py-1.5 rounded-full shadow-md">
            <ShieldCheck size={12} />
            CONSOLIDATED ENQUIRY HUB
          </span>
          <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white animate-fade-in">
            Connect With Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A00] to-amber-400 font-extrabold animate-pulse">Authorized Desk</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Get instant quotes, stock availability, and official pricing structures for our core product catalog directly dispatched to your billing point.
          </p>
        </div>

        {/* Dynamic Multi-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Corporate Contact Info Desk */}
          <div className="lg:col-span-12 xl:col-span-5 bg-slate-950/60 border border-white/5 rounded-3xl p-6 md:p-8 flex flex-col justify-between space-y-6 relative overflow-hidden backdrop-blur-md">
            <div className="absolute -top-12 -left-12 w-40 h-40 bg-sky-500/5 rounded-full filter blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-black tracking-wider text-slate-400 uppercase">
                Sri Narayana Enterprises Desk
              </h3>
              
              <div className="space-y-3 font-sans">
                <p className="text-xs text-slate-300 leading-relaxed">
                  We operate as the certified regional distributor and stocking agent in Bestavaripeta, Andhra Pradesh (Plus Code: G4X2+8MV).
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Contact our dedicated dealer counter to unlock trade volume margins for builders, plastering squads, contractor partners, and premium paint tinting workshops.
                </p>
              </div>

              {/* Verified Product Tags */}
              <div className="flex flex-wrap gap-2 pt-2">
                {["JSW Paints", "Wall Putty", "KCP Cement", "Steel Rods"].map((tag, i) => (
                  <span key={i} className="text-[10px] font-mono font-bold bg-white/5 border border-white/10 hover:border-[#FF7A00]/30 text-slate-300 px-3 py-1 rounded-lg transition-all select-none">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
              
              <a 
                href="tel:+919848742012" 
                className="flex items-center gap-3.5 group p-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="p-2.5 bg-gradient-to-tr from-[#FF7A00] to-orange-500 text-white rounded-xl shadow-md">
                  <Phone size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-mono font-black tracking-wider text-slate-400 uppercase">Call Toll Free HQ</p>
                  <p className="text-xs font-extrabold text-white font-mono group-hover:text-[#FF7A00] transition-colors">
                    +91 98487 42012
                  </p>
                </div>
              </a>

              <a 
                href="mailto:venkateshkarnati16@gmail.com" 
                className="flex items-center gap-3.5 group p-2 rounded-xl hover:bg-white/5 transition-all"
              >
                <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-indigo-500 text-white rounded-xl shadow-md">
                  <Mail size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-mono font-black tracking-wider text-slate-400 uppercase">Dealer Desk Email</p>
                  <p className="text-xs font-extrabold text-white font-mono group-hover:text-sky-400 transition-colors truncate max-w-[200px] sm:max-w-none">
                    venkateshkarnati16@gmail.com
                  </p>
                </div>
              </a>

              <div className="flex items-center gap-3.5 p-2">
                <div className="p-2.5 bg-gradient-to-tr from-teal-500 to-emerald-500 text-white rounded-xl shadow-md">
                  <Clock size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-mono font-black tracking-wider text-slate-400 uppercase">Operating Hours</p>
                  <p className="text-xs font-extrabold text-[#FFC857] font-mono">
                    Mon - Sat: 08:30 AM - 08:30 PM
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-2">
                <div className="p-2.5 bg-gradient-to-tr from-pink-500 to-rose-500 text-white rounded-xl shadow-md">
                  <MapPin size={15} />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-mono font-black tracking-wider text-slate-400 uppercase">HQ Showroom Location</p>
                  <p className="text-xs font-extrabold text-slate-200">
                    Sri Nagar Colony, Bestavaripeta, AP 523334
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Simple and Clean Inquiry Form Desk */}
          <div className="lg:col-span-12 xl:col-span-7 bg-slate-950/60 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-md relative overflow-hidden">
            <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#FF7A00]/5 rounded-full filter blur-2xl pointer-events-none" />
            
            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-12 flex flex-col items-center justify-center text-center space-y-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 filter blur-xl animate-ping" />
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-400 text-emerald-400 rounded-full flex items-center justify-center relative z-10">
                      <CheckCircle2 size={36} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xl font-black uppercase text-white tracking-tight">
                      Thank You! Inquiry Received
                    </h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      Dear <span className="font-bold text-white">{name}</span>, your inquiry about our premium <span className="text-emerald-400 font-bold">{interest}</span> has been noted securely. Our representatives will touch base shortly.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-4 w-full justify-center">
                    <a 
                      href={getWhatsAppLink()}
                      target="_blank" 
                      rel="noreferrer"
                      className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      <span>Proceed with WhatsApp</span>
                    </a>
                    
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-5 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all"
                    >
                      Submit Another Inquiry
                    </button>
                  </div>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white uppercase">
                      Inquire Direct
                    </h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      Fast Desk Submission Channel
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wide">
                        Your Full Name *
                      </label>
                      <input 
                        type="text"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors(prev => ({ ...prev, name: "" }));
                        }}
                        placeholder="e.g. Ramesh Reddy"
                        className={`w-full bg-slate-900 border ${errors.name ? "border-red-500" : "border-white/10 focus:border-[#FF7A00]"} rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all`}
                      />
                      {errors.name && <p className="text-[10px] text-red-400 mt-0.5">{errors.name}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wide">
                        Email or Mobile Phone *
                      </label>
                      <input 
                        type="text"
                        required
                        value={emailOrPhone}
                        onChange={(e) => {
                          setEmailOrPhone(e.target.value);
                          if (errors.emailOrPhone) setErrors(prev => ({ ...prev, emailOrPhone: "" }));
                        }}
                        placeholder="e.g. +91 99887 76655"
                        className={`w-full bg-slate-900 border ${errors.emailOrPhone ? "border-red-500" : "border-white/10 focus:border-[#FF7A00]"} rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all`}
                      />
                      {errors.emailOrPhone && <p className="text-[10px] text-red-400 mt-0.5">{errors.emailOrPhone}</p>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wide block">
                      Product Catalog Interest
                    </label>
                    <select
                      value={interest}
                      onChange={(e) => setInterest(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none transition-all"
                    >
                      <option value="JSW Paints">JSW Paints (Computerized Tinting & Mixing)</option>
                      <option value="Wall Putty">Wall Putty (Ultra Protective Foundation Base)</option>
                      <option value="KCP Cement">KCP Cement (Premium OPC / PPC Strength)</option>
                      <option value="Steel Rods">Fe 550D TMT Reinforcement Steel Rods</option>
                      <option value="General Bundle">General Comprehensive Project Estimate</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wide">
                      Scope of Your Materials Scope / Message *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors(prev => ({ ...prev, message: "" }));
                      }}
                      placeholder="e.g. Looking to lock bulk prices for KCP Cement and premium protective Wall Putty. Please send standard quote options."
                      className={`w-full bg-slate-900 border ${errors.message ? "border-red-500" : "border-white/10 focus:border-[#FF7A00]"} rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none transition-all`}
                    />
                    {errors.message && <p className="text-[10px] text-red-400 mt-0.5">{errors.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3 bg-[#FF7A00] hover:bg-orange-500 rounded-xl text-[11px] font-extrabold uppercase tracking-wider text-slate-950 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>SENDING...</span>
                        </>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Send General Inquiry</span>
                        </>
                      )}
                    </button>

                    <a 
                      href={getWhatsAppLink()}
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <MessageSquare size={12} />
                      <span>Instant WhatsApp Quote</span>
                    </a>
                  </div>

                </form>
              )}
            </AnimatePresence>

          </div>

        </div>

      </div>
    </section>
  );
}
