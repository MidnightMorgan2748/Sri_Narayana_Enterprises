import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, X, HardHat, Sparkles, User, RefreshCw, Bookmark, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  sender: "user" | "bot";
  text: string;
}

interface ConsultationBotProps {
  onClose: () => void;
}

export default function ConsultationBot({ onClose }: ConsultationBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "Namaste! Welcome to Sri Narayana Enterprises AI Materials Consultant. I'm here to help you estimate cement, putty, paint sizes, or steel rod needs for your construction project. Ask me anything!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [projectType, setProjectType] = useState("Residential House");
  const [dimensions, setDimensions] = useState("");

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const starters = [
    "How many bags of KCP PPC Cement do I need for plastered brickwork of 800 sqft?",
    "Which JSW color shades pair brilliantly with Classic Ivory?",
    "What is the theoretical weight of twenty 12mm TMT bars?",
    "Rough material bill for building a small 2-room outhouse structure."
  ];

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          projectType,
          dimensions
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
      } else {
        throw new Error(data.error || "Internal error fetching answer");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `Apologies, we met with an issue formulating your request: ${err.message}. Please connect with our team directly over WhatsApp so we can calculate this live!`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-full max-w-lg bg-[#071A35] border border-[#FF7A00]/30 text-white rounded-[32px] shadow-2xl flex flex-col h-[650px] overflow-hidden text-left font-sans"
    >
      {/* Bot Header */}
      <div className="bg-slate-950 p-5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-[#FF7A00] to-orange-500 text-white rounded-2xl shadow-lg">
            <HardHat size={18} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-wider flex items-center gap-1.5 font-sans">
              Narayana AI Consultant
              <Sparkles size={14} className="text-[#FFC857]" />
            </h3>
            <p className="text-[9px] text-[#FFC857] font-mono uppercase tracking-widest">
              Digital Structural Assistant
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-full transition-all cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>

      {/* Context modifiers strip */}
      <div className="bg-slate-900/60 p-3 px-4 border-b border-white/5 flex gap-2.5 items-center">
        <Bookmark size={11} className="text-[#FF7A00]" />
        <span className="text-[9px] font-mono font-bold text-slate-405 block whitespace-nowrap uppercase">
          PROJECT FOCUS:
        </span>
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-[#FFC857] font-bold outline-none cursor-pointer hover:border-white/20 transition-colors"
        >
          <option value="Residential House">House Project</option>
          <option value="Room Plaster / Painting">Paints & Putty</option>
          <option value="Concrete Roof Casting">Slab Concrete</option>
          <option value="General Estimator">General Estimates</option>
        </select>
        <input
          type="text"
          value={dimensions}
          onChange={(e) => setDimensions(e.target.value)}
          placeholder="Dimensions (e.g. 1500 sqft)"
          className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1 text-xs text-white placeholder:text-slate-600 flex-1 outline-none font-mono focus:border-[#FF7A00] transition-colors"
        />
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gradient-to-b from-slate-950/40 to-slate-950/80">
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              key={index}
              className={`flex items-start gap-3 ${
                msg.sender === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`h-8 w-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow ${
                  msg.sender === "user"
                    ? "bg-[#FF7A00] text-white"
                    : "bg-slate-800 text-[#FFC857]"
                }`}
              >
                {msg.sender === "user" ? <User size={14} /> : <HardHat size={14} />}
              </div>
              
              <div
                className={`max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[#FF7A00] text-white font-semibold"
                    : "bg-slate-900 border border-white/5 text-slate-200"
                }`}
              >
                {/* If bot response, format lists nicely */}
                {msg.sender === "bot" ? (
                  <div className="whitespace-pre-line font-sans prose prose-invert max-w-none">
                    {msg.text}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3"
          >
            <div className="h-8 w-8 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center shrink-0">
              <HardHat size={14} className="animate-bounce" />
            </div>
            <div className="bg-slate-900 border border-white/5 text-slate-400 rounded-2xl p-4 text-xs font-mono flex items-center gap-2.5">
              <RefreshCw size={12} className="animate-spin text-[#FF7A00]" />
              <span>Narayana Consultant is pricing weight schedules...</span>
            </div>
          </motion.div>
        )}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Suggested chips panel */}
      {messages.length === 1 && (
        <div className="p-4 bg-slate-950 border-t border-white/5">
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2.5">
            Suggested Estimator Prompts:
          </span>
          <div className="grid grid-cols-1 gap-2">
            {starters.map((starter, sIdx) => (
              <button
                key={sIdx}
                onClick={() => handleSend(starter)}
                className="text-left py-2 px-3 bg-slate-900/60 border border-white/5 hover:border-[#FF7A00]/50 hover:bg-slate-900 text-xs text-slate-300 hover:text-white rounded-xl transition-all truncate cursor-pointer font-sans"
              >
                {starter}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel bar */}
      <div className="p-4 bg-slate-950 border-t border-white/5 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder="Consult AI regarding materials weight, mix recipes..."
          className="flex-1 bg-slate-900 border border-white/5 focus:border-[#FF7A00] pl-4 pr-3 py-3 rounded-xl text-xs outline-none text-white placeholder:text-slate-655 focus:ring-1 focus:ring-[#FF7A00] transition-all"
          disabled={loading}
        />
        <button
          onClick={() => handleSend(input)}
          disabled={loading || !input.trim()}
          className="px-4.5 bg-[#FF7A00] hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all flex items-center justify-center cursor-pointer shadow-md shadow-[#FF7A00]/15"
        >
          <Send size={14} />
        </button>
      </div>
    </motion.div>
  );
}
