import React from "react";

interface BrandLogoProps {
  variant?: "icon-only" | "full" | "horizontal";
  className?: string;
  size?: number;
  lightBg?: boolean;
}

export default function BrandLogo({ variant = "full", className = "", size, lightBg = false }: BrandLogoProps) {
  // Define default dimensions based on variant if no size parameter is passed
  const getDims = () => {
    if (size) return { width: size, height: size };
    switch (variant) {
      case "icon-only":
        return { width: 48, height: 48 };
      case "horizontal":
        return { width: 240, height: 56 };
      case "full":
      default:
        return { width: 180, height: 180 };
    }
  };

  const dims = getDims();

  // Pure SVG icon matching the user's uploaded logo:
  // House contour in navy, paint roller inside, and chimney styled as a paint roller with orange handle.
  const LogoIcon = () => (
    <g>
      {/* 1. House Contour Outline (Navy blue: #003366) */}
      <path
        d="M 22 52 L 50 24 L 78 52 M 78 52 L 78 86 C 78 87.1 77.1 88 76 88 L 60 88 M 22 52 L 22 86 C 22 87.1 22.9 88 24 88 L 40 88"
        fill="none"
        stroke="#003366"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* 2. Right Chimney styled as a mini paint roller / brush with Orange sleeve/handle */}
      {/* Gray metal support/chimney block */}
      <rect
        x="67"
        y="25"
        width="6"
        height="14"
        fill="#9A9FA5"
        rx="1"
        transform="rotate(6, 67, 25)"
      />
      {/* Orange roller handle curved sleeve (#FF8C00) */}
      <path
        d="M 65 24 Q 71 18 77 24 Q 79 26 77 29 C 75 32 75 36 75 40"
        fill="none"
        stroke="#FF8C00"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* 3. Paint Roller core inside the house */}
      {/* Roller Frame Bracket wire (silver-gray) */}
      <path
        d="M 43 51 L 63 51 C 65 51 66 52 66 53.5 L 66 58 C 66 59.5 65 60.5 63.5 61 L 53 66 C 52 66.5 51.5 67.5 51.5 68.5 L 51.5 76"
        fill="none"
        stroke="#A5ADB5"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Paint Roller Core cylinder (Gray with soft light gradient) */}
      <defs>
        <linearGradient id="rollerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#BAC1C8" />
          <stop offset="40%" stopColor="#E3E6E8" />
          <stop offset="100%" stopColor="#7B828A" />
        </linearGradient>
        <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7E848C" />
          <stop offset="40%" stopColor="#A8AEB5" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#575B61" />
        </linearGradient>
      </defs>
      {/* Horizontal Paint roller cylinder (width ~24px, height ~10px) */}
      <rect
        x="37"
        y="44"
        width="26"
        height="11"
        fill="url(#rollerGrad)"
        rx="2"
      />
      
      {/* Roller Handle sleeve (at the bottom gap of the house) */}
      <rect
        x="48.5"
        y="74"
        width="6"
        height="14"
        fill="url(#handleGrad)"
        rx="1"
      />
    </g>
  );

  if (variant === "icon-only") {
    return (
      <svg
        viewBox="10 10 80 84"
        width={dims.width}
        height={dims.height}
        className={className}
        xmlns="http://www.w3.org/2000/svg"
      >
        <LogoIcon />
      </svg>
    );
  }

  if (variant === "horizontal") {
    return (
      <div className={`flex items-center gap-3.5 select-none ${className}`}>
        {/* SVG Icon */}
        <svg
          viewBox="10 10 80 84"
          className="shrink-0"
          width={dims.height ?? 48}
          height={dims.height ?? 48}
          xmlns="http://www.w3.org/2000/svg"
        >
          <LogoIcon />
        </svg>

        {/* Branding text directly matching the uploaded logo styling */}
        <div className="flex flex-col text-left animate-fade-in">
          <span className={`${lightBg ? "text-[#003366]" : "text-white"} text-base md:text-lg font-black tracking-tight leading-tight uppercase font-sans`}>
            Sri Narayana <span className="text-[#FF8C00]">Enterprises</span>
          </span>
          <span className={`text-[9px] md:text-[10px] ${lightBg ? "text-slate-500" : "text-orange-200/85"} font-mono tracking-wider font-semibold uppercase leading-none mt-0.5`}>
            Your Trusted Partner For Materials
          </span>
        </div>
      </div>
    );
  }

  // Full Variant: Icon on top, Sri Narayana Enterprises below, plus tagline. Perfect for lists, footer or about
  return (
    <div className={`flex flex-col items-center text-center select-none ${className}`}>
      {/* Large SVG Logo Icon */}
      <svg
        viewBox="10 10 80 84"
        width={dims.width - 40}
        height={dims.width - 40}
        xmlns="http://www.w3.org/2000/svg"
      >
        <LogoIcon />
      </svg>

      {/* Primary Brand Labels */}
      <h2 className="text-xl md:text-2xl font-black text-[#003366] leading-none mt-1">
        Sri Narayana
      </h2>
      <h2 className="text-2xl md:text-3xl font-black text-[#003366] leading-tight select-none">
        Enterprises
      </h2>

      {/* Subtitle/tagline underneath in signature Orange font style */}
      <p className="text-[10px] md:text-xs font-bold text-[#FF8C00] uppercase tracking-wide mt-2 max-w-xs font-sans">
        Your Trusted Partner for House Construction Materials
      </p>
    </div>
  );
}
