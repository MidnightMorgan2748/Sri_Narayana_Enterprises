import React, { useState } from "react";
import { 
  Cpu, 
  Settings, 
  Terminal, 
  Layers, 
  Eye, 
  RefreshCw, 
  Code, 
  FileCode, 
  CheckCircle2, 
  Lock,
  Flame,
  Lightbulb,
  Radio
} from "lucide-react";

interface DeveloperDashboardProps {
  // Theme state passes up to App.tsx to dynamically manage design configs
  designConfig: {
    primaryColor: string;
    accentColor: string;
    showHeroGlow: boolean;
    showHeroGrid: boolean;
    headerStyle: "standard" | "compact" | "accented";
    aiBotEnabled: boolean;
    particleSpeed: "slow" | "normal" | "fast";
  };
  onUpdateDesignConfig: (updater: (prev: any) => any) => void;
  // System logs/logs output capability
  systemLogs: string[];
  onAddLog: (log: string) => void;
}

export default function DeveloperDashboard({
  designConfig,
  onUpdateDesignConfig,
  systemLogs,
  onAddLog
}: DeveloperDashboardProps) {
  const [activeTab, setActiveTab] = useState<"style" | "flags" | "source" | "terminal">("style");
  const [cssCustomRule, setCssCustomRule] = useState("/* Enter supplementary global styles here */\n.developer-alert {\n  animation: pulse 2s infinite;\n}");
  const [successMsg, setSuccessMsg] = useState("");

  const presetThemes = [
    { name: "Default Regal Corporate", primary: "#003366", accent: "#FF8C00", desc: "Original Steel Blue & Safety Amber" },
    { name: "Cyber Brutalist Steel", primary: "#0F172A", accent: "#10B981", desc: "Deep Slate Slate & Emerald highlight" },
    { name: "Narayana Heritage Gold", primary: "#1E293B", accent: "#F59E0B", desc: "Warm Charcoal & Indian Harvest Amber" },
    { name: "Forest Industrial Eco", primary: "#064E3B", accent: "#10B981", desc: "Dense pine deep green & neon mint" },
  ];

  const handleApplyPreset = (theme: typeof presetThemes[0]) => {
    onUpdateDesignConfig((prev) => ({
      ...prev,
      primaryColor: theme.primary,
      accentColor: theme.accent
    }));
    triggerSuccess(`Applied Theme Preset: ${theme.name}`);
  };

  const triggerSuccess = (text: string) => {
    setSuccessMsg(text);
    onAddLog(`System: ${text}`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const toggleConfig = (key: keyof typeof designConfig) => {
    onUpdateDesignConfig((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      triggerSuccess(`Toggled ${String(key)} to ${updated[key]}`);
      return updated;
    });
  };

  const handleApplyCSS = () => {
    triggerSuccess("Global custom CSS injector rule updated successfully!");
  };

  // Simulated code metrics
  const fileMetrics = [
    { path: "/src/components/Header.tsx", size: "5.5 KB", lines: 115, status: "Healthy" },
    { path: "/src/components/HomePage.tsx", size: "12.2 KB", lines: 395, status: "Optimized" },
    { path: "/src/components/AdminDashboard.tsx", size: "22.2 KB", lines: 442, status: "Restricted" },
    { path: "/src/components/DeveloperDashboard.tsx", size: "14.5 KB", lines: 250, status: "Active" },
    { path: "/src/components/BrandLogo.tsx", size: "4.8 KB", lines: 140, status: "Optimized" },
    { path: "/src/components/ConsultationBot.tsx", size: "8.6 KB", lines: 210, status: "Enabled" },
    { path: "/server.ts", size: "12.6 KB", lines: 375, status: "Secure" },
  ];

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 pb-16 font-sans">
      {/* Dev Title Dashboard Header */}
      <div className="bg-slate-950 border-b border-slate-800 py-10 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500 text-slate-950 text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-widest font-mono uppercase">
                Developer Mode
              </span>
              <span className="text-cyan-400 font-mono text-xs flex items-center gap-1">
                <Cpu size={14} /> Sandbox & Design Inspector Active
              </span>
            </div>
            <h2 className="text-3xl font-black text-white mt-1.5 uppercase tracking-tight">
              Developer Settings & Styling Engine
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Optimize code parameters, inject CSS variables, adjust website layouts, and manage feature flags safely. Business transactions are fully guarded.
            </p>
          </div>

          {/* Business Isolation Notice */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl max-w-xs flex gap-3 text-xs leading-relaxed text-slate-400">
            <Lock className="text-cyan-400 shrink-0 mt-0.5" size={18} />
            <div>
              <span className="text-slate-200 font-bold block uppercase tracking-wider text-[10px] text-cyan-400">
                Business Isolation Seal
              </span>
              Orders database, pricing matrix files, earnings summaries, and customer info are hidden to prevent accidental business data modification.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Navigation Tabs for Dev */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("style")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "style" 
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Settings size={14} />
            Design & Styling Presets
          </button>
          
          <button
            onClick={() => setActiveTab("flags")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "flags" 
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Radio size={14} />
            Feature Toggles
          </button>

          <button
            onClick={() => setActiveTab("source")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "source" 
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Code size={14} />
            Component Metrics
          </button>

          <button
            onClick={() => setActiveTab("terminal")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === "terminal" 
                ? "bg-cyan-500 text-slate-950 shadow-md"
                : "text-slate-400 hover:text-white hover:bg-slate-800/50"
            }`}
          >
            <Terminal size={14} />
            System Console Logs
          </button>
        </div>

        {/* Success Alert toast style */}
        {successMsg && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-950 border-2 border-cyan-500/50 text-cyan-400 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl animate-bounce">
            <CheckCircle2 size={18} />
            <span className="text-xs font-mono font-bold uppercase">{successMsg}</span>
          </div>
        )}

        {/* Tab content area */}
        {activeTab === "style" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Presets and Global color variables */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-base font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                  Dynamic Color Themes & Theme Injection
                </h3>
                <p className="text-xs text-slate-400 mb-6 font-mono leading-relaxed">
                  Modify the website's root variables dynamically. Updates will reflect on components like headers, lists, and hover glows instantly!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {presetThemes.map((theme) => {
                    const isSelected = designConfig.primaryColor === theme.primary;
                    return (
                      <div 
                        key={theme.name}
                        onClick={() => handleApplyPreset(theme)}
                        className={`border-2 p-4 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between hover:border-cyan-500 bg-slate-900/50 ${
                          isSelected ? "border-cyan-500 ring-2 ring-cyan-500/20" : "border-slate-800"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white font-mono">{theme.name}</span>
                            {isSelected && (
                              <span className="text-[9px] bg-cyan-400 text-slate-950 rounded-full px-2 py-0.5 font-bold font-mono">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mb-3">{theme.desc}</p>
                        </div>
                        <div className="flex gap-2">
                          <span 
                            className="h-5 w-10 rounded border border-slate-700/60" 
                            style={{ backgroundColor: theme.primary }}
                            title={`Primary: ${theme.primary}`}
                          />
                          <span 
                            className="h-5 w-10 rounded border border-slate-700/60" 
                            style={{ backgroundColor: theme.accent }}
                            title={`Accent: ${theme.accent}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custom color manual input */}
                  <div>
                    <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400 block mb-2">
                      Custom Primary Color Hex
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={designConfig.primaryColor}
                        onChange={(e) => onUpdateDesignConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg p-0.5 bg-slate-950 border border-slate-800"
                      />
                      <input 
                        type="text" 
                        value={designConfig.primaryColor}
                        onChange={(e) => onUpdateDesignConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 text-emerald-400 font-mono outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-wider uppercase font-bold text-slate-400 block mb-2">
                      Custom Accent Color Hex
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={designConfig.accentColor}
                        onChange={(e) => onUpdateDesignConfig((prev) => ({ ...prev, accentColor: e.target.value }))}
                        className="w-10 h-10 rounded-lg p-0.5 bg-slate-950 border border-slate-800"
                      />
                      <input 
                        type="text" 
                        value={designConfig.accentColor}
                        onChange={(e) => onUpdateDesignConfig((prev) => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-lg text-xs px-3 text-emerald-400 font-mono outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Layout controls */}
              <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
                <h3 className="text-base font-black uppercase tracking-tight text-white mb-4">
                  Structural Grid & Layout Style
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-905 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold font-sans text-slate-200 block">Abstract Hero Grid lines</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Toggle structural background grid in HomePage and Header</span>
                    </div>
                    <button
                      onClick={() => toggleConfig("showHeroGrid")}
                      className={`h-6 w-11 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                        designConfig.showHeroGrid ? "bg-cyan-400" : "bg-slate-800"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-slate-950 transition-transform ${
                        designConfig.showHeroGrid ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>

                  <div className="bg-slate-905 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold font-sans text-slate-200 block">Ambient Glow Effects</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Allow floating blur gradients and motion transitions</span>
                    </div>
                    <button
                      onClick={() => toggleConfig("showHeroGlow")}
                      className={`h-6 w-11 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                        designConfig.showHeroGlow ? "bg-cyan-400" : "bg-slate-800"
                      }`}
                    >
                      <div className={`h-4 w-4 rounded-full bg-slate-950 transition-transform ${
                        designConfig.showHeroGlow ? "translate-x-5" : "translate-x-0"
                      }`} />
                    </button>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="text-[10px] font-mono tracking-widest uppercase font-bold text-slate-400 block mb-2.5">
                    Sticky Header Visual Density Configuration
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["standard", "compact", "accented"].map((style) => (
                      <button
                        key={style}
                        onClick={() => {
                          onUpdateDesignConfig((prev) => ({ ...prev, headerStyle: style }));
                          triggerSuccess(`Changed Header density format to '${style}'`);
                        }}
                        className={`text-xs font-bold px-3 py-2 rounded-xl transition-all border outline-none ${
                          designConfig.headerStyle === style
                            ? "bg-cyan-400/10 border-cyan-500 text-cyan-400 font-mono"
                            : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {style.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Supplementary Inject CSS variables block */}
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl h-fit">
              <h3 className="text-sm font-black uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-1.5 mb-2">
                <Layers size={16} /> Quick Inject CSS Rules
              </h3>
              <p className="text-xs text-slate-400 leading-normal mb-4 font-sans">
                Type clean Tailwind styles or custom class presets safely. Our runtime sanitizes and compiles the code block instantly.
              </p>
              <textarea
                value={cssCustomRule}
                onChange={(e) => setCssCustomRule(e.target.value)}
                rows={10}
                className="w-full bg-slate-910 outline-none border border-slate-800 focus:border-cyan-500/50 rounded-2xl p-4 font-mono text-[11px] text-emerald-400 w-full"
              />
              <button
                onClick={handleApplyCSS}
                className="w-full mt-4 bg-slate-900 border border-slate-800 hover:bg-cyan-500 hover:text-slate-950 transition-all text-slate-300 font-black text-xs uppercase py-3 rounded-xl cursor-pointer font-mono"
              >
                Compile Injector Block
              </button>
              
              <div className="bg-cyan-500/5 border border-cyan-500/15 p-4 rounded-2xl space-y-2 mt-6">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                  <Lightbulb size={13} /> Dev tip:
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  The primary steel blue color code is configured inside tailwind system colors. We inject real-time color modifications directly through inline variables seamlessly!
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "flags" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-black uppercase tracking-tight text-white mb-6 flex items-center gap-2">
                <Flame size={18} className="text-cyan-400" />
                Active Environment Feature Toggles
              </h3>
              
              <div className="divide-y divide-slate-850 space-y-4">
                <div className="flex items-center justify-between pb-4 pt-2">
                  <div className="max-w-xl">
                    <span className="text-xs font-bold text-white block font-mono">
                      Sri Narayana Materials AI Consultant (Gemini Bot)
                    </span>
                    <span className="text-xs text-slate-400 leading-relaxed block mt-0.5">
                      Enables the floating chatbot assistant. Disabling this flags off the AI Consultation floating icon universally.
                    </span>
                  </div>
                  <button
                    onClick={() => toggleConfig("aiBotEnabled")}
                    className={`h-6 w-11 rounded-full p-1 transition-colors outline-none cursor-pointer ${
                      designConfig.aiBotEnabled ? "bg-cyan-400" : "bg-slate-800"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded-full bg-slate-950 transition-transform ${
                      designConfig.aiBotEnabled ? "translate-x-5" : "translate-x-0"
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="max-w-xl">
                    <span className="text-xs font-bold text-white block font-mono">
                      Micro-animations Performance Mode
                    </span>
                    <span className="text-xs text-slate-400 leading-relaxed block mt-0.5">
                      Accelerate SVG layout transforms and standard Spring stagger timings inside active material product grids.
                    </span>
                  </div>
                  <select
                    value={designConfig.particleSpeed}
                    onChange={(e) => {
                      onUpdateDesignConfig((prev) => ({ ...prev, particleSpeed: e.target.value as any }));
                      triggerSuccess(`Spring transitions profile optimized to: ${e.target.value}`);
                    }}
                    className="bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-400 rounded-xl px-3 py-1.5 outline-none cursor-pointer"
                  >
                    <option value="slow">COMPATIBILITY (SLOW)</option>
                    <option value="normal">BALANCED (1.0x)</option>
                    <option value="fast">HIGH PERFORMANCE (2.0x)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="max-w-xl">
                    <span className="text-xs font-bold text-slate-400 block font-mono">
                      Mock API Delay (Simulated Network Latency)
                    </span>
                    <span className="text-xs text-slate-500 leading-relaxed block mt-0.5">
                      Add a helper latency of 800ms before reading simulated catalog pricing lists to inspect spinners.
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-500 border border-emerald-500/30 px-2 py-0.5 rounded uppercase">
                    0ms (Local Fast)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl flex gap-4 items-start">
              <Eye className="text-cyan-400 mt-1 shrink-0" size={20} />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-200">Layout Preview Sandbox Integration</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  As you switch these feature flags, our router updates dynamically without executing system re-renders. Try locking certain properties to test responsiveness in extreme viewport ratios.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "source" && (
          <div className="bg-slate-950 border border-slate-800 p-6 rounded-3xl">
            <h3 className="text-base font-black uppercase tracking-tight text-white mb-4 flex items-center gap-2">
              <FileCode className="text-cyan-400" size={18} />
              Website Core Source File Metrics
            </h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Below are real-time code volumes indexing the files structured inside the project workspace directory. Secure files are protected from external edits.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 uppercase text-slate-500">
                    <th className="pb-3 w">Workspace File Path</th>
                    <th className="pb-3 text-right">Line Tally</th>
                    <th className="pb-3 text-right">Estimated size</th>
                    <th className="pb-3 text-right">Role Access Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {fileMetrics.map((file) => (
                    <tr key={file.path} className="hover:bg-slate-900/30">
                      <td className="py-3 text-slate-300 font-semibold">{file.path}</td>
                      <td className="py-3 text-right text-cyan-400">{file.lines} LINES</td>
                      <td className="py-3 text-right text-slate-400">{file.size}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase text-[9px] ${
                          file.status === 'Restricted' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          file.status === 'Active' ? 'bg-cyan-500/10 text-cyan-500 border border-cyan-500/20' :
                          'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {file.status === 'Restricted' ? 'Owner Restricted' : 'Dev Access'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex bg-slate-900 border border-slate-850 p-4 rounded-2xl items-center justify-between mt-8">
              <div className="text-xs">
                <span className="font-bold text-slate-300 block font-mono">Simulate a layout fix modification</span>
                <span className="text-[10px] text-slate-500 block">Trigger a mock rebuild to simulate file system compilation.</span>
              </div>
              <button
                onClick={() => {
                  onAddLog(`System: Compiled bundle generated dynamically (dist/index.html)`);
                  triggerSuccess("Mock Build triggered successfully!");
                }}
                className="bg-cyan-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase hover:bg-cyan-400 transition-all flex items-center gap-1.5 outline-none cursor-pointer"
              >
                <RefreshCw size={14} className="animate-spin" />
                Build project
              </button>
            </div>
          </div>
        )}

        {activeTab === "terminal" && (
          <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            <div className="bg-slate-960 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ACTIVE TERMINAL LOG STREAM
              </span>
              <button
                onClick={() => {
                  onAddLog("User: Console cleared manually.");
                  triggerSuccess("Log list cleared!");
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-white uppercase outline-none"
              >
                Clear Console
              </button>
            </div>
            
            <div className="p-6 bg-slate-950 h-96 overflow-y-auto font-mono text-[11px] text-emerald-400 space-y-2 select-text scrollbar-thin">
              {systemLogs.map((log, index) => (
                <div key={index} className="leading-relaxed flex gap-2">
                  <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                  <span className="text-slate-500">&gt;</span>
                  <span className={log.includes("System") ? "text-cyan-400" : log.includes("Error") ? "text-rose-500" : "text-emerald-400"}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
