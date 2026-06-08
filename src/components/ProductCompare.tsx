import React, { useState } from "react";
import { Scale, CheckCircle, HelpCircle, Layers, ArrowRight, Paintbrush, ShieldCheck, Zap } from "lucide-react";

interface CompareCategory {
  id: string;
  name: string;
  icon: any;
  specs: string[];
  products: {
    name: string;
    brand: string;
    priceGuide: string;
    metrics: Record<string, string>;
    suitability: string;
    isPremium: boolean;
  }[];
}

export default function ProductCompare() {
  const [activeCat, setActiveCat] = useState<string>("paint");

  const categories: CompareCategory[] = [
    {
      id: "paint",
      name: "JSW Paints",
      icon: Paintbrush,
      specs: ["Pack Size", "Primary Binder", "Coverage Ratio", "Gloss Level", "Drying Duration", "Target Surface"],
      products: [
        {
          name: "JSW Halo Gold Shield Pro",
          brand: "JSW Paints",
          priceGuide: "₹280/L onwards",
          isPremium: true,
          suitability: "Luxury outer masonry, weather-sealed facades, corporate villas",
          metrics: {
            "Pack Size": "1L, 4L, 10L, 20L",
            "Primary Binder": "100% Pure Acrylic Silicon polymer",
            "Coverage Ratio": "85-110 sq.ft / Litre (2 coats)",
            "Gloss Level": "Ultra Glossy / Sheen",
            "Drying Duration": "2 to 4 Hours",
            "Target Surface": "Exterior concrete, fresh render plastering"
          }
        },
        {
          name: "JSW Aurum Premium Silk",
          brand: "JSW Paints",
          priceGuide: "₹210/L onwards",
          isPremium: false,
          suitability: "Interior bedrooms, high-traffic corridors, hotel lobbies",
          metrics: {
            "Pack Size": "1L, 4L, 10L, 20L",
            "Primary Binder": "Styrene Acrylic Emulsion",
            "Coverage Ratio": "75-90 sq.ft / Litre (2 coats)",
            "Gloss Level": "Rich Eggshell High-Sheen",
            "Drying Duration": "3 Hours",
            "Target Surface": "Interior walled partitions, ceiling slabs"
          }
        },
        {
          name: "JSW Star Primer Coat",
          brand: "JSW Paints",
          priceGuide: "₹140/L onwards",
          isPremium: false,
          suitability: "Undercoats, masonry sealing, moisture block base",
          metrics: {
            "Pack Size": "4L, 20L",
            "Primary Binder": "Co-Polymer Acrylic Binder",
            "Coverage Ratio": "100-120 sq.ft / Litre (1 coat)",
            "Gloss Level": "Matte Undercoat",
            "Drying Duration": "1.5 Hours",
            "Target Surface": "Raw brick render, dry putty smooth finishes"
          }
        }
      ]
    },
    {
      id: "putty",
      name: "Wall Putty",
      icon: Layers,
      specs: ["Bag Weights", "Waterproof Index", "Tensile Bonding Strength", "Finishing Color", "Pot Life", "Coverage Factor"],
      products: [
        {
          name: "Waterproof Wall Putty",
          brand: "SNE Premium",
          priceGuide: "₹880 per 20kg",
          isPremium: true,
          suitability: "Rain-lashed external exterior, basements, high hydration zones",
          metrics: {
            "Bag Weights": "20 KG, 25 KG, 40 KG",
            "Waterproof Index": "Excellent Hydrophobic (SNE block technology)",
            "Tensile Bonding Strength": ">= 1.5 N/mm² High Grip",
            "Finishing Color": "Bespoke Super-White powder",
            "Pot Life": "3 Hours",
            "Coverage Factor": "14-16 sq.ft / KG for 2 coats"
          }
        },
        {
          name: "White Wall Putty (Standard)",
          brand: "SNE White",
          priceGuide: "₹620 per 20kg",
          isPremium: false,
          suitability: "Standard commercial ceilings, apartment interior renders",
          metrics: {
            "Bag Weights": "20 KG, 25 KG, 40 KG",
            "Waterproof Index": "Standard Water Repulsion",
            "Tensile Bonding Strength": ">= 1.1 N/mm²",
            "Finishing Color": "Brilliant White cement powder",
            "Pot Life": "2.5 Hours",
            "Coverage Factor": "12-14 sq.ft / KG for 2 coats"
          }
        }
      ]
    },
    {
      id: "cement",
      name: "KCP Cement",
      icon: ShieldCheck,
      specs: ["Grade Classification", "Compression Force", "Curing Duration", "Primary Materials", "Workability Index", "Target Application"],
      products: [
        {
          name: "KCP OPC 53 Grade",
          brand: "KCP Cement",
          priceGuide: "₹480/bag on mill direct",
          isPremium: true,
          suitability: "RCC foundations, suspension columns, load-bearing concrete slabs",
          metrics: {
            "Grade Classification": "Ordinary Portland Cement (IS 12269)",
            "Compression Force": ">= 53 MPa at 28 days aging",
            "Curing Duration": "7 to 10 Days",
            "Primary Materials": "High purity clinker + Gypsum blend",
            "Workability Index": "Standard rapid setup flow",
            "Target Application": "Heavy commercial framing structural engineering"
          }
        },
        {
          name: "KCP PPC Cement",
          brand: "KCP Cement",
          priceGuide: "₹440/bag on mill direct",
          isPremium: false,
          suitability: "Walling brickwork, smooth structural plastering, sea-salt resistance",
          metrics: {
            "Grade Classification": "Portland Pozzolana Cement (IS 1489)",
            "Compression Force": ">= 33 MPa at 28 days (gradual heat curve)",
            "Curing Duration": "10 to 14 Days (needs dense hydration)",
            "Primary Materials": "Clinker + Fly Ash blend (~25% silica pozzolana)",
            "Workability Index": "Super slick masonry blend",
            "Target Application": "Corrosion-safe external brick bonding and tiling renders"
          }
        }
      ]
    },
    {
      id: "rod",
      name: "Steel Rods",
      icon: Zap,
      specs: ["Ductility Code", "Seismic Compliance", "Bending Angle Limit", "Rust Protection Resistance", "Standard Sizes Available", "IS Standard Compliance"],
      products: [
        {
          name: "Sree Fe 550D TMT Reinforcement",
          brand: "Sree Metals",
          priceGuide: "Market Direct / Ton rates",
          isPremium: true,
          suitability: "High earthquake zones, bridges, multi-story heavy industrial plants",
          metrics: {
            "Ductility Code": "Fe 550D (Elite High Elongation yield)",
            "Seismic Compliance": "100% Certified Class-1 High Dampening",
            "Bending Angle Limit": "180° complete return bend with zero structural cracks",
            "Rust Protection Resistance": "Epoxy coated copper-chrome micro alloys",
            "Standard Sizes Available": "8mm, 10mm, 12mm, 16mm, 20mm, 25mm, 32mm",
            "IS Standard Compliance": "IS 1786 metallurgical regulations"
          }
        }
      ]
    }
  ];

  const currentCategory = categories.find((c) => c.id === activeCat) || categories[0];

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 md:p-8 shadow-xl max-w-6xl mx-auto space-y-8 font-sans text-left" id="pricing-comparison">
      
      {/* Compare Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="bg-[#FF7A00]/10 text-[#FF7A00] text-[10px] font-mono font-bold uppercase rounded-full px-3 py-1 border border-[#FF7A00]/20">
            Wholesale Decision Engine
          </span>
          <span className="text-slate-500 text-xs font-medium font-mono flex items-center gap-1">
            <Scale size={14} /> Compare Technical Specifications
          </span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-[#071A35] uppercase tracking-tight">
          Product Technical Comparison Matrix
        </h3>
        <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
          Evaluate tensile strength indices, curing thresholds, hydrophobic limits, and computerized coverage multipliers before scheduling factory direct hauling.
        </p>
      </div>

      {/* Categories Toggle Row */}
      <div className="bg-[#F5F7FA] border p-2 rounded-2xl flex flex-wrap gap-2">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isActive = cat.id === activeCat;
          return (
            <button
              type="button"
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-4.5 py-3 rounded-xl font-bold text-xs uppercase flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#071A35] text-white shadow-md font-extrabold"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              }`}
            >
              <IconComp size={15} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Comparison Specifications Table (Stripe Styled Grid) */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-left text-sm whitespace-nowrap table-fixed min-w-[650px]">
          <thead>
            <tr className="bg-[#071A35] text-white">
              <th className="p-5 font-bold text-xs font-mono uppercase tracking-wider w-1/4 select-none">
                Specifications Checklist
              </th>
              {currentCategory.products.map((prod, idx) => (
                <th key={idx} className="p-5 w-3/8 text-left relative">
                  <div className="space-y-1">
                    {prod.isPremium && (
                      <span className="absolute top-2 right-4 bg-[#FF7A00] text-white text-[8px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Premium Choice
                      </span>
                    )}
                    <h4 className="font-extrabold text-sm uppercase block truncate text-gradient-orange pr-14 leading-none">
                      {prod.name}
                    </h4>
                    <span className="text-[10px] text-slate-300 font-mono font-semibold">
                      {prod.brand} • <span className="text-emerald-400">{prod.priceGuide}</span>
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            
            {/* Specs Specs rows */}
            {currentCategory.specs.map((spec) => (
              <tr key={spec} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-5 font-bold text-xs text-[#071A35] font-mono bg-slate-50/40 uppercase">
                  {spec}
                </td>
                {currentCategory.products.map((prod, pIdx) => (
                  <td key={pIdx} className="p-5 text-xs text-slate-600 leading-relaxed font-sans font-medium whitespace-normal">
                    {prod.metrics[spec] || "N/A"}
                  </td>
                ))}
              </tr>
            ))}

            {/* Suitability row */}
            <tr className="hover:bg-slate-50/50 transition-colors">
              <td className="p-5 font-bold text-xs text-[#071A35] font-mono bg-slate-50/40 uppercase">
                Best Suited For
              </td>
              {currentCategory.products.map((prod, pIdx) => (
                <td key={pIdx} className="p-5 text-xs text-slate-500 italic leading-relaxed whitespace-normal">
                  💡 {prod.suitability}
                </td>
              ))}
            </tr>

          </tbody>
        </table>
      </div>

      {/* SNE Quick Support / Call to Action */}
      <div className="bg-[#071A35]/5 border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5">
          <h4 className="text-sm font-extrabold uppercase text-[#071A35]">
            Need a direct Mill-to-Site customized material quotation?
          </h4>
          <p className="text-xs text-slate-500 max-w-xl">
            Our hydraulic crane logistics offloads materials on order schedules. Access special wholesale margins by submitting drawings dynamically.
          </p>
        </div>
        <a
          href="https://wa.me/919848742012?text=Namaste%2C%20I%20have%20compared%20the%20structural%20specifications%20on%20SNE.%20Please%20provide%20a%20site%20delivery%20quote."
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#FF7A00] hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
        >
          <span>Instantly Discuss Quote</span>
          <ArrowRight size={14} />
        </a>
      </div>

    </div>
  );
}
