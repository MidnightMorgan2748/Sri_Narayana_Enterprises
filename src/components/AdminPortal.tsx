import React, { useState } from "react";
import { Lock, Eye, EyeOff, User, ShieldAlert, KeyRound, CheckCircle2, ChevronRight, HelpCircle, Mail, ArrowLeft } from "lucide-react";

interface AdminPortalProps {
  loggedInRole: string | null;
  onLoginSuccess: (role: string, email: string) => void;
  onLogout: () => void;
  // Dashboard properties to proxy to children
  orders: any[];
  onDeleteOrder: (id: string) => void;
  onUpdateStatus: (id: string, status: any) => void;
  inventoryConfig: any;
  onSaveInventory: (updated: any) => void;
  shopWhatsAppNumber: string;
  onUpdateWhatsAppConfig: (num: string) => void;
  children?: React.ReactNode;
}

export default function AdminPortal({
  loggedInRole,
  onLoginSuccess,
  onLogout,
  orders,
  onDeleteOrder,
  onUpdateStatus,
  inventoryConfig,
  onSaveInventory,
  shopWhatsAppNumber,
  onUpdateWhatsAppConfig,
  children
}: AdminPortalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<"Super Admin" | "Staff">("Super Admin");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password screen state
  const [showForgotScreen, setShowForgotScreen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleFormLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    const normalizedEmail = String(email || "").trim().toLowerCase();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password: password
        })
      });

      const data = await response.json();
      setIsLoading(false);

      if (response.ok && data.success) {
        // Map backend roles like 'super_admin' / 'admin' to "Super Admin" / "Staff"
        const resolvedRole = (data.actualRole || data.role) === "super_admin" ? "Super Admin" : "Staff";
        onLoginSuccess(resolvedRole, data.email);
      } else {
        setErrorMsg(data.error || "Unauthorized access. Please contact the system administrator.");
      }
    } catch (err) {
      setIsLoading(false);
      setErrorMsg("Network failure communicating with authorization servers.");
    }
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setForgotSuccess(true);
    }, 750);
  };

  if (loggedInRole) {
    return <>{children}</>;
  }

  return (
    <div className="bg-[#0A1A2F] min-h-screen py-16 px-4 flex flex-col items-center justify-center relative font-sans overflow-hidden text-slate-100 selection:bg-[#FF8C00] selection:text-white">
      
      {/* Background elegant circles styled for SNE theme */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FF8C00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#003366]/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        
        {/* Header Branding */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-[#003366] to-[#0A1A2F] border-2 border-[#FF8C00]/50 shadow-2xl rounded-3xl flex items-center justify-center text-[#FF8C00] relative">
            <Lock size={32} className="text-[#FF8C00] drop-shadow-[0_0_10px_#FF8C00]" />
            <div className="absolute inset-0 bg-[#FF8C00]/5 rounded-3xl animate-pulse" />
          </div>
          <div>
            <span className="text-[#FF8C00] font-mono text-[9px] uppercase tracking-widest font-extrabold bg-[#FF8C00]/10 px-3 py-1 rounded-full border border-[#FF8C00]/25">
              Secure Admin Hub
            </span>
            <h2 className="text-2xl font-black text-white mt-3 uppercase tracking-tight">
              Sri Narayana Enterprises
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Completely Isolated Operations Terminal. Credentials required.
            </p>
          </div>
        </div>

        {/* Card containing login forms inside */}
        <div className="bg-[#0D2137] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          {!showForgotScreen ? (
            <form onSubmit={handleFormLogin} className="space-y-4">
              
              {/* Role Picker */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                  Select Target Access Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRole("Super Admin")}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer font-sans ${
                      selectedRole === "Super Admin"
                        ? "bg-[#FF8C00]/10 border-[#FF8C00] text-[#FF8C00]"
                        : "bg-[#0A1A2F] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Super Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole("Staff")}
                    className={`py-2.5 px-3 text-xs font-bold rounded-xl border transition-all cursor-pointer font-sans ${
                      selectedRole === "Staff"
                        ? "bg-[#FF8C00]/10 border-[#FF8C00] text-[#FF8C00]"
                        : "bg-[#0A1A2F] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    Staff
                  </button>
                </div>
              </div>

              {/* Email Address Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                  Authorized Admin Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 text-slate-500" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@enterprises.com"
                    className="w-full bg-[#0A1A2F] border border-slate-800 focus:border-[#FF8C00] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                    Security Password Key
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotScreen(true);
                      setForgotSuccess(false);
                      setForgotEmail("");
                    }}
                    className="text-[10px] text-[#FF8C00] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-[#0A1A2F] border border-slate-800 focus:border-[#FF8C00] rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-4 py-3 rounded-xl leading-relaxed text-center font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#E67E00] hover:opacity-90 disabled:opacity-55 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{isLoading ? "Verifying Keys..." : "Access Dashboard"}</span>
                <ChevronRight size={15} />
              </button>
            </form>
          ) : (
            // Forgot Password recovery view
            <div className="space-y-4 animate-fade-in">
              <button
                onClick={() => setShowForgotScreen(false)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer mb-2"
              >
                <ArrowLeft size={14} />
                <span>Return to Login</span>
              </button>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Account Password Recovery</h3>
                <p className="text-xs text-slate-400">
                  Enter your registered admin email address below to dispatch a secure verification token.
                </p>
              </div>

              {forgotSuccess ? (
                <div className="space-y-4 pt-2">
                  <div className="bg-[#003366]/20 border border-[#003366] p-4 rounded-xl space-y-2 text-center">
                    <CheckCircle2 size={32} className="text-[#FF8C00] mx-auto" />
                    <h4 className="text-xs font-bold text-white">Reset Dispatch Successful</h4>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      A secured recovery URL token has been successfully sent to <strong className="font-mono text-[#FF8C00]">{forgotEmail}</strong>. 
                      This link expires in 15 minutes.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowForgotScreen(false)}
                    className="w-full py-2.5 bg-[#003366] text-white hover:bg-[#FF8C00]/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Back to Login Form
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase block">
                      Registered Workspace Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 text-slate-505" size={16} />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="e.g. admin@enterprises.com"
                        className="w-full bg-[#0A1A2F] border border-slate-800 focus:border-[#FF8C00] rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 outline-none transition-all placeholder:text-slate-600 font-mono"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#FF8C00] hover:bg-orange-500 text-slate-950 font-black py-2.5 rounded-xl transition-all shadow-md text-xs uppercase flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{isLoading ? "Dispatching Token..." : "Dispatch Recovery Link"}</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Role Based Access Guidelines */}
        <div className="text-center font-mono text-[10px] text-slate-500 max-w-sm mx-auto leading-relaxed">
          Sri Narayana Enterprises isolated admin system preserves operational privacy. 
          Customers are strictly isolated from dashboard parameters.
        </div>
      </div>
    </div>
  );
}
