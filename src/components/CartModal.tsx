import React, { useState, useEffect } from "react";
import { 
  X, ShoppingBag, Trash2, Send, Mail, Briefcase, ChevronRight, 
  CheckCircle2, RefreshCw, Printer, Copy, Check, CreditCard, 
  Smartphone, Building, ShieldAlert, Wifi, Globe, DollarSign, Award, ArrowRight,
  Truck, Download
} from "lucide-react";
import { CartItem, CustomerInfo } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onUpdateQty: (itemId: string, qty: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  shopWhatsAppNumber: string; 
  userDiscount?: number; // wholesale tier discount eg. 0.1 for 10%
  onOrderPlaced?: () => void;
  onTrackOrder?: (orderId: string, mobile: string) => void;
}

type CheckoutStep = "details" | "payment_gateway" | "success";
type PaymentMethod = "wholesale_invoice" | "card" | "upi" | "netbanking";

export default function CartModal({
  cart,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  shopWhatsAppNumber,
  userDiscount = 0,
  onOrderPlaced,
  onTrackOrder
}: CartModalProps) {
  // Form states
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [step, setStep] = useState<CheckoutStep>("details");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("wholesale_invoice");
  
  // Card Gateways state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [cardFlipped, setCardFlipped] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");

  // UPI State
  const [upiTimeRemaining, setUpiTimeRemaining] = useState(300); // 5 minutes standard countdown

  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);
  const [copiedText, setCopiedText] = useState(false);

  // Auto fill form for easy testing
  useEffect(() => {
    // If the user logs in as standard customer or dealer, we can autofill with testing configurations
    const savedUser = localStorage.getItem("sne_auth_email");
    const savedRole = localStorage.getItem("sne_auth_role");
    if (savedUser) {
      setEmail(savedUser);
      if (savedRole === "dealer") {
        setName("Sree Sai Infrastructure (Dealer)");
        setMobile("+91 98480 92831");
        setAddress("Plot 42, Sri Nagar Colony, Bestavaripeta, AP");
      } else if (savedRole === "customer") {
        setName("Gopal Murthy");
        setMobile("+91 94402 82103");
        setAddress("Sri Lakshmi Nilayam, Main Road, Bestavaripeta, AP");
      }
    }
  }, []);

  // UPI Timer logic
  useEffect(() => {
    if (step === "payment_gateway" && paymentMethod === "upi" && upiTimeRemaining > 0) {
      const timer = setInterval(() => {
        setUpiTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, paymentMethod, upiTimeRemaining]);

  const rawTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Dynamic Dealer Discount calculations
  const discountAmount = Math.round(rawTotal * userDiscount);
  const cartTotal = rawTotal - discountAmount;

  const handleDetailsProceed = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!name || !mobile || !email || !address) {
      alert("Please complete all delivery form fields before proceeding.");
      return;
    }

    if (paymentMethod === "wholesale_invoice") {
      // Bypasses payment gateway straight to database saving. Genuine construction flow
      executeOrderSubmission();
    } else {
      // Route to custom high-interactive online gateway sandbox
      setStep("payment_gateway");
    }
  };

  const handleGatewayPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        alert("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardExpiry.includes("/")) {
        alert("Please enter card expiry in MM/YY format.");
        return;
      }
      if (cardCvv.length < 3) {
        alert("Please enter card security CVV parameter.");
        return;
      }
    } else if (paymentMethod === "netbanking") {
      if (!selectedBank) {
        alert("Please select your secure retail bank portal.");
        return;
      }
    }
    
    // Simulate end-to-end payment clearance
    executeOrderSubmission();
  };

  const executeOrderSubmission = async () => {
    setSubmitting(true);
    try {
      const customer: CustomerInfo = {
        name: name + (userDiscount > 0 ? " (Wholesale Dealer)" : ""),
        mobile,
        email,
        deliveryAddress: address
      };

      // Call our robust express backend orders post
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: cart,
          total: cartTotal
        })
      });

      const data = await res.json();
      if (data.success) {
        // Cache the placed order details locally so customer doesn't have to manually remember order IDs!
        try {
          const stored = localStorage.getItem("sne_my_orders");
          const ordList = stored ? JSON.parse(stored) : [];
          ordList.push({
            id: data.order.id,
            mobile: customer.mobile,
            date: data.order.created_at || new Date().toISOString(),
            total: data.order.total,
            itemsCount: data.order.items.length
          });
          localStorage.setItem("sne_my_orders", JSON.stringify(ordList));
        } catch (e) {
          console.error("Localstorage save order error:", e);
        }

        setPlacedOrder(data);
        setStep("success");
        onClearCart();
        if (onOrderPlaced) {
          onOrderPlaced();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      alert("Error posting order: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Card input maskers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    const matches = val.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(" "));
    } else {
      setCardNumber(val);
    }
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length >= 2) {
      setCardExpiry(val.substring(0, 2) + "/" + val.substring(2, 4));
    } else {
      setCardExpiry(val);
    }
  };

  // Auto detect card labels
  const getCardBrand = () => {
    const cleanNum = cardNumber.replace(/\s/g, "");
    if (cleanNum.startsWith("4")) return "VISA";
    if (/^5[1-5]/.test(cleanNum)) return "MASTERCARD";
    if (/^6(0|5)/.test(cleanNum) || cleanNum.startsWith("508")) return "RUPAY";
    return "CARD";
  };

  // Dynamic formatting for WhatsApp logs
  const getWhatsAppBodyText = (orderData: any) => {
    if (!orderData) return "";
    const ord = orderData.order;
    const cust = ord.customer;

    let text = `*SRI NARAYANA ENTERPRISES ORDER BOOKING*\n`;
    text = text + `-----------------------------------------\n`;
    text = text + `*Order ID:* ${ord.id}\n`;
    text = text + `*Customer:* ${cust.name}\n`;
    text = text + `*Mobile:* ${cust.mobile}\n`;
    text = text + `*Email:* ${cust.email}\n`;
    text = text + `*Address:* ${cust.deliveryAddress}\n`;
    if (userDiscount > 0) {
      text = text + `*Partner Tier:* Wholesale Dealer VIP (10% Off Applied)\n`;
    }
    text = text + `-----------------------------------------\n\n`;
    text = text + `*MATERIALS DISPATCH BULK LIST:*\n\n`;

    ord.items.forEach((item: any) => {
      const colStr = item.colorName ? ` (JSW ${item.colorName} - ${item.shadeCode})` : "";
      text = text + `• *${item.name}${colStr}*\n  Size: *${item.size}* | Qty: *${item.quantity}* | Subtotal: ₹${item.price * item.quantity}\n`;
    });

    text = text + `\n-----------------------------------------\n`;
    text = text + `*NET MATERIALS VALUATION:* *₹${ord.total}*\n`;
    text = text + `-----------------------------------------\n`;
    text = text + `_Please verify active warehouse dispatch logs to coordinate mill transit._\n`;
    return text;
  };

  const getWhatsAppLink = (orderData: any) => {
    const text = getWhatsAppBodyText(orderData);
    if (!text) return "#";
    const encoded = encodeURIComponent(text);
    const sanitizedPhone = shopWhatsAppNumber.replace(/\D/g, "");
    return `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encoded}`;
  };

  const getEmailLink = (orderData: any) => {
    if (!orderData) return "#";
    const subject = encodeURIComponent(orderData.emailDraft.subject);
    const body = encodeURIComponent(orderData.emailDraft.body);
    return `mailto:${orderData.emailDraft.recipient}?cc=${orderData.emailDraft.ownerRecipient}&subject=${subject}&body=${body}`;
  };

  const copyInvoiceText = () => {
    const text = getWhatsAppBodyText(placedOrder);
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const downloadInvoiceFile = () => {
    if (!placedOrder || !placedOrder.order) return;
    const order = placedOrder.order;
    const subtotal = Number(order.total || 0);
    const basePrice = Math.round(subtotal / 1.18);
    const totalGst = subtotal - basePrice;
    const cgst = Math.round(totalGst / 2);
    const sgst = Math.round(totalGst / 2);

    const startItemsY = 280;
    const itemHeight = 35;
    const itemsSvgList = order.items.map((item: any, idx: number) => {
      const y = startItemsY + idx * itemHeight;
      const itemTot = item.price * item.quantity;
      return `
        <g class="item-row" transform="translate(0, ${y})">
          <text x="45" y="20" class="text-regular" font-family="sans-serif" font-size="10" fill="#475569">${idx + 1}</text>
          <text x="80" y="20" class="text-bold" font-family="sans-serif" font-size="10" font-weight="bold" fill="#0F172A">${item.name} (${item.size || "Standard"})</text>
          <text x="420" y="20" class="text-regular" font-family="monospace" font-size="10" fill="#475569">${item.quantity}</text>
          <text x="470" y="20" class="text-regular" font-family="monospace" font-size="10" fill="#475569">₹${item.price}</text>
          <text x="565" y="20" class="text-bold" font-family="monospace" font-size="10" font-weight="bold" fill="#0F172A" text-anchor="end">₹${itemTot}</text>
        </g>
        <line x1="45" y1="${y + itemHeight}" x2="565" y2="${y + itemHeight}" stroke="#E2E8F0" stroke-width="1" />
      `;
    }).join("");

    const endItemsY = startItemsY + (order.items.length * itemHeight);
    const totalsY = endItemsY + 30;
    const docHeight = totalsY + 160;

    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 612 ${docHeight}" width="612" height="${docHeight}">
  <style>
    .header-title { font-family: sans-serif; font-size: 16px; font-weight: 900; fill: #FFFFFF; letter-spacing: 1px; }
    .header-sub { font-family: sans-serif; font-size: 9px; font-weight: 700; fill: #FF7A00; letter-spacing: 1px; }
    .badge-text { font-family: monospace; font-size: 11px; font-weight: 950; fill: #FFFFFF; }
    .text-bold { font-family: sans-serif; font-size: 10px; font-weight: 700; fill: #071A35; }
    .text-regular { font-family: sans-serif; font-size: 10px; fill: #64748B; }
    .table-header { font-family: sans-serif; font-size: 9px; font-weight: 900; fill: #003366; letter-spacing: 0.5px; }
    .total-title { font-family: sans-serif; font-size: 11px; font-weight: 900; fill: #071A35; }
    .total-val { font-family: monospace; font-size: 12px; font-weight: 900; fill: #FF7A00; }
  </style>

  <rect width="612" height="${docHeight}" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" />

  <!-- Top Banner Navy Blue -->
  <path d="M 12 0 L 600 0 A 12 12 0 0 1 612 12 L 612 80 L 0 80 L 0 12 A 12 12 0 0 1 12 0 Z" fill="#071A35" />
  
  <text x="30" y="32" class="header-title">SRI NARAYANA ENTERPRISES</text>
  <text x="30" y="48" class="header-sub">OFFICIAL TAX INVOICE REQUISITION</text>
  
  <!-- Ribbon Badge -->
  <rect x="440" y="24" width="142" height="24" rx="12" fill="#FF7A00" />
  <text x="511" y="40" text-anchor="middle" class="badge-text">${order.id}</text>

  <!-- Addresses -->
  <g transform="translate(30, 100)">
    <text x="0" y="15" class="text-bold">MERCHANDISE DISTRIBUTOR:</text>
    <text x="0" y="30" class="text-regular">Sri Narayana Enterprises</text>
    <text x="0" y="42" class="text-regular">Sri Nagar Colony, Bestavaripeta,</text>
    <text x="0" y="54" class="text-regular">Andhra Pradesh, PIN 523334</text>
    <text x="0" y="66" class="text-regular">GSTIN Prefix: 37SNEAP3334F1Z0</text>
    <text x="0" y="78" class="text-regular">Phone: +91 98487 42012</text>

    <text x="350" y="15" class="text-bold">DELIVERY RECIPIENT:</text>
    <text x="350" y="30" class="text-bold" fill="#071A35">${order.customer?.name || "Customer"}</text>
    <text x="350" y="42" class="text-regular">Phone: ${order.customer?.mobile || "N/A"}</text>
    <text x="350" y="54" class="text-regular">Email: ${order.customer?.email || "N/A"}</text>
    <text x="350" y="66" class="text-regular">Address: ${order.customer?.deliveryAddress || "N/A"}</text>
  </g>

  <!-- Separator Line -->
  <line x1="30" y1="205" x2="582" y2="205" stroke="#CBD5E1" stroke-width="1.5" stroke-dasharray="4 3" />

  <!-- Logistics Details -->
  <g transform="translate(30, 220)">
    <text x="0" y="13" class="text-regular">Billed Date:</text>
    <text x="80" y="13" class="text-bold" font-family="monospace">${new Date(order.created_at || new Date()).toLocaleString()}</text>
    
    <text x="300" y="13" class="text-regular">Logistics Mode:</text>
    <text x="400" y="13" class="text-bold" fill="#10B981">Direct Distribution Hub</text>
  </g>

  <!-- Table Headers -->
  <g transform="translate(0, 250)">
    <rect x="30" y="0" width="552" height="24" rx="6" fill="#F1F5F9" />
    <text x="45" y="15" class="table-header">#</text>
    <text x="80" y="15" class="table-header">Material Category &amp; Specifications</text>
    <text x="420" y="15" class="table-header">Qty</text>
    <text x="470" y="15" class="table-header">Price</text>
    <text x="565" y="15" class="table-header" text-anchor="end">Subtotal</text>
  </g>
  <line x1="30" y1="275" x2="582" y2="275" stroke="#CBD5E1" stroke-width="1" />

  <!-- Render Line Items List -->
  ${itemsSvgList}

  <!-- Calculations Segment -->
  <g transform="translate(300, ${totalsY})">
    <text x="130" y="15" class="text-regular" text-anchor="end">Subtotal Base Value:</text>
    <text x="265" y="15" class="text-bold" font-family="monospace" text-anchor="end">₹${basePrice}</text>

    <text x="130" y="32" class="text-regular" text-anchor="end">CGST (9.0%):</text>
    <text x="265" y="32" class="text-regular" font-family="monospace" text-anchor="end">₹${cgst}</text>

    <text x="130" y="49" class="text-regular" text-anchor="end">SGST (9.0%):</text>
    <text x="265" y="49" class="text-regular" font-family="monospace" text-anchor="end">₹${sgst}</text>

    <line x1="50" y1="60" x2="265" y2="60" stroke="#E2E8F0" stroke-width="1.5" />

    <text x="130" y="78" class="total-title" text-anchor="end">NET AGREED VALUATION:</text>
    <text x="265" y="78" class="total-val" text-anchor="end">₹${subtotal}</text>
  </g>

  <!-- Legal Signatures -->
  <g transform="translate(30, ${totalsY + 105})">
    <text x="0" y="15" class="text-regular" font-size="9">Customer Acknowledgment Signature</text>
    <line x1="0" y1="42" x2="160" y2="42" stroke="#CBD5E1" stroke-width="1" />

    <text x="350" y="15" class="text-regular" font-size="9">For Sri Narayana Enterprises</text>
    <line x1="350" y1="42" x2="550" y2="42" stroke="#CBD5E1" stroke-width="1" />
  </g>

  <!-- Bottom Strip -->
  <g transform="translate(0, ${docHeight - 35})">
    <rect width="612" height="35" rx="6" fill="#F8FAFC" />
    <text x="306" y="22" text-anchor="middle" font-family="sans-serif" font-size="8" fill="#94A3B8">
      Thank you for choosing Sri Narayana Enterprises. Computerized document - no physical stamp required.
    </text>
  </g>
</svg>`;

    try {
      const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Invoice-${order.id}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to export invoice:", e);
    }
  };

  const formatUpiTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 bg-[#030E1E]/65 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-slate-200 relative animate-fade-in text-left">
        
        {/* Header Toolbar */}
        <div className="bg-[#071A35] text-white p-6 flex justify-between items-center border-b-2 border-[#FF7A00]">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-[#FF7A00] to-orange-500 text-white rounded-2xl shadow-md">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="font-extrabold tracking-tight text-base uppercase font-sans">
                {step === "success" ? "Corporate Materials Invoice" : 
                 step === "payment_gateway" ? "SNE Secure Online Gateway" : 
                 "Materials Cart & Checkout"}
              </h3>
              <p className="text-[10px] text-slate-300 font-mono">
                {step === "success" ? "Transmission catalog logged in Supabase" : 
                 step === "payment_gateway" ? "Interbank Encrypted Session (Sandbox)" : 
                 `${cart.length} materials classes ready for dispatch`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white hover:bg-white/5 p-2 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Dynamic Step Layout Area */}
        <div className="flex-1 overflow-y-auto flex flex-col bg-[#F5F7FA]">

          {step === "success" && placedOrder && (
            /* SUCCESS & CONFIRMED DISPATCH INVOICE SCREEN */
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto flex-1">
              <div className="text-center max-w-lg mx-auto space-y-4">
                <div className="mx-auto h-14 w-14 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-1 shadow-inner">
                  <CheckCircle2 size={36} className="text-emerald-500" />
                </div>
                <h4 className="text-2xl sm:text-3xl font-black text-[#071A35] uppercase tracking-tight">
                  Order Confirmed Successfully
                </h4>
                
                <div className="bg-amber-500/10 border border-amber-500/20 py-2.5 px-6 rounded-2xl inline-block">
                  <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block">Order ID</span>
                  <span className="font-mono text-xl font-black text-[#FF7A00]">{placedOrder.order.id}</span>
                </div>

                <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
                  Your materials requisition has been synced directly with Sri Narayana Enterprises active warehouse log.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (onTrackOrder) {
                        onTrackOrder(placedOrder.order.id, placedOrder.order.customer.mobile);
                      }
                    }}
                    className="px-8 py-3 bg-[#FF7A00] hover:bg-orange-500 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
                  >
                    <Truck size={14} />
                    <span>Track Order</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Automated Processing Ledger Card */}
                <div className="bg-white border rounded-3xl p-6 space-y-4 shadow-sm hover:border-[#FF7A00]/40 transition-all text-left flex flex-col justify-between">
                  <div>
                    <h5 className="font-extrabold text-xs uppercase tracking-wider text-[#071A35] border-b pb-2 mb-3">
                       Automated Pipeline Setup
                    </h5>
                    <div className="space-y-3 font-sans">
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <div>
                          <span className="font-extrabold text-slate-800 block">Logged to Supabase Database</span>
                          <span className="text-[10px] text-slate-500">Secure entry saved in real-time orders cache.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <div>
                          <span className="font-extrabold text-slate-800 block">Emailed to Business Owner</span>
                          <span className="text-[10px] text-slate-500">Order details automatically emailed to shop owner at venkateshkarnati16@gmail.com.</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs">
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <div>
                          <span className="font-extrabold text-slate-800 block">Logged in Management Dashboard</span>
                          <span className="text-[10px] text-slate-500">The order appears immediately in the merchant shop admin view.</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-2">
                    System Auto-Notification Enabled
                  </div>
                </div>

                {/* Manual Failsafe Email Dispatcher */}
                <div className="bg-white border rounded-3xl p-6 flex flex-col justify-between items-start space-y-4 shadow-sm hover:border-blue-500/40 transition-all text-left">
                  <div className="space-y-1">
                    <span className="bg-blue-500/10 text-blue-600 text-[9px] font-mono font-bold uppercase rounded-full px-2.5 py-1">
                      EMAIL FAILSAFE DELIVERER
                    </span>
                    <h5 className="font-extrabold text-base text-[#071A35] pt-1">Manual Email Backup</h5>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans">
                      No email received? Tap below to invoke your native mail app (Gmail/Outlook) with a pre-written invoice pre-addressed to venkateshkarnati16@gmail.com.
                    </p>
                  </div>
                  <a
                    href={getEmailLink(placedOrder)}
                    className="w-full bg-[#071A35] hover:bg-[#030E1E] text-white font-bold py-2.5 px-4 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow"
                  >
                    <Mail size={12} className="text-[#FF7A00]" />
                    <span>Send Manual Email Copy</span>
                  </a>
                </div>

                {/* Optional Support Desk Chat Support Card */}
                <div className="bg-white border rounded-3xl p-6 flex flex-col justify-between items-start space-y-4 shadow-sm hover:border-[#25D366]/40 transition-all text-left">
                  <div className="space-y-1">
                    <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-mono font-bold uppercase rounded-full px-2.5 py-1">
                      OPTIONAL SUPPORT CHANNELS
                    </span>
                    <h5 className="font-extrabold text-base text-[#071A35] pt-1">Fulfillment Help Desk</h5>
                    <p className="text-[11px] text-slate-500 leading-normal font-sans">
                      Our administrative staff will coordinate flatbeds and transit options. Need to adjust items or clarify transport?
                    </p>
                  </div>
                  <a
                    href={getWhatsAppLink(placedOrder)}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#25D366] hover:bg-green-600 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs text-center flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Send size={12} className="text-slate-950" />
                    <span>Contact WhatsApp Support</span>
                  </a>
                </div>
              </div>

              {/* High contraster invoice generator sheet */}
              <div className="border border-slate-200 rounded-3xl max-w-2xl mx-auto p-6 bg-white shadow-sm space-y-4 sheet-invoice-preview text-left">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                      Sri Narayana Enterprises
                    </span>
                    <span className="text-xs font-black text-[#071A35]">
                      TAX INVOICE REQUISITION
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={copyInvoiceText}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-[#071A35] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copy Invoice Summary"
                    >
                      {copiedText ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                      <span className="text-[10px] font-mono">{copiedText ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button 
                      onClick={downloadInvoiceFile}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-[#071A35] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download Vector Tax Invoice"
                    >
                      <Download size={12} className="text-[#FF7A00]" />
                      <span className="text-[10px] font-mono">Invoice</span>
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-[#071A35] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Print Invoice Requisition"
                    >
                      <Printer size={12} />
                      <span className="text-[10px] font-mono">Print</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-slate-100 pb-4 text-xs text-slate-500">
                  <div className="space-y-1">
                    <p><strong>Merchant Distributor:</strong></p>
                    <p className="text-[#071A35] font-bold">Sri Narayana Enterprises</p>
                    <p>Sri Nagar Colony, Bestavaripeta, AP 523334</p>
                    <p>Phone: +91 98487 42012</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p><strong>Billed Partner:</strong></p>
                    <p className="text-[#071A35] font-bold">{placedOrder.order.customer.name}</p>
                    <p>Phone: {placedOrder.order.customer.mobile}</p>
                    <p className="truncate">Email: {placedOrder.order.customer.email}</p>
                  </div>
                </div>

                <div className="text-xs space-y-2 border-b border-slate-100 pb-4">
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Materials Breakdown</p>
                  {placedOrder.order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between font-sans">
                      <span className="text-slate-600">
                        {item.quantity}x {item.name} ({item.size}) {item.colorName ? `[JSW Shade: ${item.colorName}]` : ""}
                      </span>
                      <span className="font-bold text-[#071A35] font-mono">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2.5 text-xs text-slate-600">
                  {userDiscount > 0 && (
                    <div className="flex justify-between font-mono">
                      <span>Wholesale Partner Tier Disc (10%):</span>
                      <span className="text-amber-600 font-bold">-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-[#071A35] border-t border-slate-150 pt-3">
                    <span>AGREED PORTAL VALUATION NET</span>
                    <span className="font-mono">₹{placedOrder.order.total}</span>
                  </div>
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={onClose}
                  className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs uppercase tracking-widest cursor-pointer active:scale-95 transition-transform"
                >
                  Close Receipt
                </button>
              </div>
            </div>
          )}

          {step === "payment_gateway" && (
            /* SECURE SANDBOX ONLINE GATEWAY */
            <div className="p-6 md:p-8 flex-1 flex flex-col md:flex-row gap-8 overflow-y-auto">
              
              {/* Left Column: Method Selector & Forms */}
              <div className="flex-1 space-y-6 text-left">
                <div className="bg-[#051329] text-white p-5 rounded-3xl border border-white/10 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-emerald-400 font-black tracking-wider block">
                      ● SECURE TRANSACTIONS ACTIVE
                    </span>
                    <h4 className="text-sm font-extrabold uppercase font-sans">Online Payment Channel</h4>
                  </div>
                  <span className="text-lg font-black text-[#FFC857] font-mono">₹{cartTotal}</span>
                </div>

                {/* Sub tabs selector */}
                <div className="grid grid-cols-3 gap-2 bg-slate-200/50 border p-1 rounded-xl">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === "card" ? "bg-[#071A35] text-white" : "text-slate-500 hover:bg-slate-300/30"
                    }`}
                  >
                    <CreditCard size={13} />
                    <span>Card</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === "upi" ? "bg-[#071A35] text-white" : "text-slate-500 hover:bg-slate-300/30"
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>UPI</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("netbanking")}
                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold uppercase rounded-lg cursor-pointer flex items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === "netbanking" ? "bg-[#071A35] text-white" : "text-slate-500 hover:bg-slate-300/30"
                    }`}
                  >
                    <Building size={13} />
                    <span>Net Bank</span>
                  </button>
                </div>

                <form onSubmit={handleGatewayPayment} className="space-y-4">
                  
                  {paymentMethod === "card" && (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="e.g. RAJESH KUMAR"
                          className="w-full bg-white border border-slate-250 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Card Number</label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4000 1234 5678 9010"
                            maxLength={19}
                            className="w-full bg-white border border-slate-250 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-mono"
                          />
                          <span className="absolute right-3.5 top-3.5 text-[9px] font-mono font-bold text-slate-400 bg-slate-100 border px-2 py-0.5 rounded">
                            {getCardBrand()}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Expiry Date</label>
                          <input
                            type="text"
                            required
                            value={cardExpiry}
                            onChange={handleCardExpiryChange}
                            maxLength={5}
                            placeholder="MM/YY"
                            className="w-full bg-white border border-slate-250 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-mono text-center"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Security CVV</label>
                          <input
                            type="password"
                            required
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                            maxLength={3}
                            placeholder="***"
                            onFocus={() => setCardFlipped(true)}
                            onBlur={() => setCardFlipped(false)}
                            className="w-full bg-white border border-slate-250 focus:border-[#FF7A00] rounded-xl px-4 py-3 text-xs text-[#071A35] placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "upi" && (
                    <div className="space-y-5 text-center bg-white p-6 rounded-3xl border border-slate-200">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-black text-[#FF7A00] border border-[#FF7A00]/20 bg-[#FF7A00]/5 px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                          Dynamic UPI QR Generator
                        </span>
                        <h5 className="font-extrabold text-[#071A35] text-sm pt-2">Scan & Complete Payment</h5>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                          Open PhonePe, GPay, Paytm, or BHIM and scan this dynamic aggregate payment ticket to authorize the logistics ledger.
                        </p>
                      </div>

                      {/* Cool QR code simulator card */}
                      <div className="relative mx-auto w-40 h-40 bg-slate-50 border-2 border-[#071A35]/15 rounded-2xl flex items-center justify-center p-3">
                        {/* Fake stylized QR code */}
                        <div className="w-full h-full bg-[radial-gradient(#071a35_3px,transparent_3px)] [background-size:10px_10px] border border-[#071a35]/10 rounded flex flex-col justify-between p-1">
                          <div className="flex justify-between">
                            <span className="w-10 h-10 border-4 border-[#071A35] rounded-md shrink-0 block" />
                            <span className="w-10 h-10 border-4 border-[#071A35] rounded-md shrink-0 block" />
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="w-10 h-10 border-4 border-[#071A35] rounded-md shrink-0 block" />
                            <span className="text-[10px] font-black text-[#071A35] font-mono shrink-0">SNE</span>
                          </div>
                        </div>

                        {/* Floating SNE badge center */}
                        <div className="absolute bg-[#FF7A00] border-2 border-white text-white font-mono text-[8px] font-black p-1 rounded-md shadow">
                          UPI
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-2 text-[#071A35] font-mono text-xs font-bold bg-[#F5F7FA] py-1.5 px-4 rounded-xl border max-w-[160px] mx-auto">
                        <Wifi size={13} className="text-[#FF7A00] animate-pulse" />
                        <span>{formatUpiTime(upiTimeRemaining)}</span>
                      </div>

                      <div className="border-t pt-4">
                        <button
                          type="button"
                          onClick={executeOrderSubmission}
                          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 font-bold text-xs uppercase tracking-wider text-white rounded-xl shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 size={13} />
                          <span>Simulate UPI Payment Success</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "netbanking" && (
                    <div className="space-y-4">
                      <label className="text-[9px] font-mono uppercase text-slate-400 font-bold block">Popular Banks</label>
                      <div className="grid grid-cols-2 gap-2">
                        {["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Kotak Bank", "Union Bank"].map(bank => {
                          const isSel = selectedBank === bank;
                          return (
                            <button
                              type="button"
                              key={bank}
                              onClick={() => setSelectedBank(bank)}
                              className={`p-3 text-[11px] font-extrabold uppercase rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${
                                isSel 
                                  ? "bg-[#071A35] border-[#071A35] text-white shadow" 
                                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800"
                              }`}
                            >
                              <span>{bank}</span>
                              <span className={`w-2.5 h-2.5 rounded-full border ${isSel ? "bg-[#FF7A00] border-white" : "border-slate-350"}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Submission and backtrack btn */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="w-full py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-2xl text-xs uppercase tracking-wide transition-all active:scale-95 cursor-pointer text-center"
                    >
                      Back to Forms
                    </button>
                    
                    {paymentMethod !== "upi" && (
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 bg-[#FF7A00] hover:bg-orange-600 disabled:bg-slate-300 disabled:text-slate-400 text-white font-bold rounded-2xl text-xs uppercase tracking-widest cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 shadow shadow-orange-500/10 font-sans"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="animate-spin" size={14} />
                            <span>AUTHORISING...</span>
                          </>
                        ) : (
                          <>
                            <span>AUTHORISE PAY</span>
                            <ArrowRight size={13} />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                </form>
              </div>

              {/* Right Column: Visual Card simulator (For Card payment) */}
              {paymentMethod === "card" && (
                <div className="hidden md:flex md:w-2/5 flex-col justify-center items-center">
                  {/* Flipping Debit Card Container */}
                  <div 
                    className="w-72 h-44 cursor-pointer relative perspective-1000 transition-transform duration-500"
                    style={{ transform: cardFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transformStyle: "preserve-3d" }}
                    onClick={() => setCardFlipped(!cardFlipped)}
                  >
                    {/* CARD FRONT */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-tr from-[#071A35] via-slate-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg border border-white/10"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                          <span className="text-[6px] font-mono uppercase text-slate-300 font-bold block leading-none">
                            SRI NARAYANA ENTERPRISES
                          </span>
                          <span className="text-[9px] font-extrabold uppercase tracking-widest block font-sans">
                            VIP BUILDER LEAGUE
                          </span>
                        </div>
                        <CreditCard size={18} className="text-[#FFC857]" />
                      </div>

                      {/* EMV Microchip lines */}
                      <div className="w-7.5 h-6 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-md shadow-inner" />

                      <div className="space-y-2">
                        {/* Number */}
                        <div className="font-mono text-xs tracking-widest text-[#FFC857]">
                          {cardNumber || "•••• •••• •••• ••••"}
                        </div>

                        <div className="flex justify-between items-end">
                          {/* Holder */}
                          <div className="truncate max-w-[140px]">
                            <span className="text-[5px] uppercase font-mono text-slate-400 block pb-0.5">Cardholder</span>
                            <span className="text-[8px] font-bold font-mono tracking-wider block truncate">
                              {cardHolder || "SIGNATURE PREFERRED"}
                            </span>
                          </div>
                          {/* Expiry */}
                          <div>
                            <span className="text-[5px] uppercase font-mono text-slate-400 block pb-0.5 text-right">Expires</span>
                            <span className="text-[8px] font-bold font-mono tracking-wider block text-right">
                              {cardExpiry || "MM/YY"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CARD BACK */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-[#071A35] to-slate-900 rounded-2xl justify-between flex flex-col shadow-lg border border-white/10"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <div className="h-8.5 bg-black w-full mt-4" />
                      <div className="px-5 pb-5 space-y-4">
                        <div className="flex justify-between items-center gap-3">
                          <div className="bg-slate-100 flex-1 h-6 select-none" />
                          <div className="bg-white text-slate-800 px-2.5 py-1 text-[8px] font-mono font-bold italic rounded">
                            {cardCvv || "CVV"}
                          </div>
                        </div>

                        <div className="flex justify-between items-end text-white/50 text-[5px]">
                          <span className="font-mono">AUTHORIZED CODES</span>
                          <span className="font-black text-[9px] font-sans tracking-wide text-[#FF7A00]">
                            {getCardBrand()}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                  <p className="text-[8px] text-slate-400 uppercase font-mono mt-4 tracking-normal">
                    💡 Click credit card above to flip and inspect CVV
                  </p>
                </div>
              )}

            </div>
          )}

          {step === "details" && (
            /* STANDARD DETAILS SHEET WITH PRODUCTS ITEMS */
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Left Column: Items array */}
              <div className="p-6 md:p-8 flex-1 border-b lg:border-b-0 lg:border-r border-slate-205 overflow-y-auto text-left">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>Selected Materials List</span>
                  {cart.length > 0 && (
                    <button
                      onClick={onClearCart}
                      className="text-xs font-extrabold text-[#FF7A00] hover:underline normal-case tracking-normal cursor-pointer"
                    >
                      Clear Cart
                    </button>
                  )}
                </h4>

                {cart.length === 0 ? (
                  <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center px-4 space-y-2">
                    <div className="w-16 h-16 bg-[#071A35]/5 rounded-full flex items-center justify-center text-slate-350">
                      <ShoppingBag size={28} />
                    </div>
                    <h5 className="font-extrabold text-[#071A35] text-sm uppercase">No Materials In Cart</h5>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs leading-normal font-sans">
                      Add custom computer dyed JSW Paint cans, Wall Putty, Cement bags, or structural Steel Rods to formulate direct wholesale shipping options.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <motion.div
                        layout
                        key={item.id}
                        className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 justify-between sm:items-center shadow-sm relative hover:border-[#FF7A00]/30 transition-all font-sans text-left"
                      >
                        <div className="flex-1 space-y-1.5 text-left">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded-full ${
                              item.type === 'paint' ? 'bg-[#FF7A00]/10 text-[#FF7A00]' :
                              item.type === 'cement' ? 'bg-slate-900 text-[#FFC857]' :
                              item.type === 'putty' ? 'bg-blue-50 text-blue-800' :
                              'bg-violet-50 text-violet-800'
                            }`}>
                              {item.type}
                            </span>
                            {item.colorHex && (
                              <span 
                                className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shrink-0 shadow-inner" 
                                style={{ backgroundColor: item.colorHex }}
                              />
                            )}
                          </div>
                          
                          <h5 className="font-extrabold text-xs sm:text-sm text-[#071A35] leading-snug">
                            {item.name}
                          </h5>
                          
                          <p className="text-[11px] text-slate-500 font-medium">
                            Factor/Weight: <strong className="font-semibold text-slate-700">{item.size}</strong> {item.colorName ? `| Color Name: ${item.colorName} (${item.shadeCode})` : ""}
                          </p>

                          <div className="text-[10px] text-slate-400 font-mono">
                            ₹{item.price} per container/bag
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                          <div className="flex items-center gap-1.5 bg-slate-50 border rounded-xl p-1">
                            <button
                              onClick={() => onUpdateQty(item.id, -1)}
                              className="h-7 w-7 bg-white font-bold text-[#071A35] shadow-sm hover:bg-slate-150 rounded flex items-center justify-center cursor-pointer transition-colors text-xs"
                            >
                              -
                            </button>
                            <span className="w-5 text-center text-xs font-bold text-[#071A35] font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQty(item.id, 1)}
                              className="h-7 w-7 bg-white font-bold text-[#071A35] shadow-sm hover:bg-slate-150 rounded flex items-center justify-center cursor-pointer transition-colors text-xs"
                            >
                              +
                            </button>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="font-bold font-mono text-xs sm:text-sm block text-[#071A35]">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>

                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 p-2 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Customer Logistics Delivery details */}
              <form 
                onSubmit={handleDetailsProceed}
                className="p-6 md:p-8 bg-[#071A35] text-white lg:w-2/5 flex flex-col justify-between"
              >
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFC857]">
                      Logistics Delivery details
                    </h4>
                    {userDiscount > 0 && (
                      <span className="bg-[#FF7A00] text-white text-[8px] font-mono font-black px-2 py-0.5 rounded uppercase items-center gap-1 inline-flex animate-pulse">
                        <Award size={10} /> Wholesale Disc
                      </span>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    {/* Name */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-mono font-bold text-slate-350 uppercase block">FullName / Builder Co *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Rajesh Kumar Structures"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                      />
                    </div>

                    {/* Mobile */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-mono font-bold text-slate-350 uppercase block">Contact Phone *</label>
                      <input
                        type="tel"
                        required
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+91 98487 42012"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-mono font-bold text-slate-350 uppercase block">Billing Email *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="rajesh@rkbuilds.in"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FF7A00]"
                      />
                    </div>

                    {/* Address */}
                    <div className="space-y-1 text-left">
                      <label className="text-[9px] font-mono font-bold text-slate-350 uppercase block">Site dispatch Location *</label>
                      <textarea
                        required
                        rows={3}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Near Bus Stand, Bestavaripeta, Andhra Pradesh"
                        className="w-full bg-white/5 border border-white/10 focus:border-[#FF7A00] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#FF7A00] leading-normal"
                      />
                    </div>

                    {/* Choose checkout options: Invoice vs online gateway */}
                    <div className="space-y-1.5 text-left pt-2">
                      <label className="text-[9px] font-mono font-bold text-slate-350 uppercase block">Dispatch payment method</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("wholesale_invoice")}
                          className={`p-2 px-1 text-[10px] font-bold uppercase rounded-xl border flex flex-col justify-center items-center gap-1 cursor-pointer transition-all ${
                            paymentMethod === "wholesale_invoice" 
                              ? "bg-slate-900 border-[#FF7A00] text-white" 
                              : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10"
                          }`}
                        >
                          <Briefcase size={14} className={paymentMethod === "wholesale_invoice" ? "text-[#FFC857]" : ""} />
                          <span>Wholesale Invoice</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("card")}
                          className={`p-2 px-1 text-[10px] font-bold uppercase rounded-xl border flex flex-col justify-center items-center gap-1 cursor-pointer transition-all ${
                            paymentMethod !== "wholesale_invoice" 
                              ? "bg-slate-900 border-[#FF7A00] text-white" 
                              : "bg-white/5 border-white/10 text-slate-350 hover:bg-white/10"
                          }`}
                        >
                          <CreditCard size={14} className={paymentMethod !== "wholesale_invoice" ? "text-emerald-400" : ""} />
                          <span>Secure Online Pay</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-5 mt-6 space-y-4">
                  {userDiscount > 0 && (
                    <div className="flex justify-between items-center text-xs text-slate-300 font-mono">
                      <span>Wholesale Rate Discount:</span>
                      <span className="text-amber-400 font-bold">-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-left">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">
                      Estimate Net Total
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-white font-mono">
                      ₹{cartTotal}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || cart.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-[#FF7A00] to-orange-500 hover:from-orange-500 hover:to-[#FF7A00] disabled:opacity-40 disabled:from-white/10 text-white font-bold rounded-2xl shadow-lg shadow-[#FF7A00]/10 text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-2 group transition-transform active:scale-95 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="animate-spin text-[#FFC857]" size={14} />
                        <span>SYNCHING SPECIFICATIONS...</span>
                      </>
                    ) : (
                      <>
                        <span>{paymentMethod === "wholesale_invoice" ? "Confirm Direct Booking" : "Proceed to Online Gateway"}</span>
                        <ChevronRight size={14} className="group-hover:translate-x-1.5 transition-transform text-[#FFC857]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
