import { VERIFIED_PDF_SHADES, VerifiedPdfShade } from "./verifiedPdfShades";

export interface PaintShade {
  id?: number;
  shade_code: string;
  shade_name: string;
  category: string;
  color_family: string;
  hex_color: string;
  image_url?: string;
  pdf_source?: string;
  pdf_page?: number;
  // Fallback compatibility with previous structure
  name: string;
  code: string;
  hex: string;
}

export const PAINT_CATEGORIES = [
  "Right Whites",
  "Fresh Pastels",
  "Modern Midtones",
  "Smart Neutrals",
  "Bold Accents"
];

// Pure, verified shade records extracted from the PDF pages
export const PAINT_SHADES: PaintShade[] = VERIFIED_PDF_SHADES.map(s => ({
  shade_code: s.shade_code,
  shade_name: s.shade_name,
  category: s.category,
  color_family: s.color_family,
  hex_color: s.hex_color,
  pdf_source: s.pdf_source,
  pdf_page: s.pdf_page,
  name: s.shade_name,
  code: s.shade_code,
  hex: s.hex_color,
  image_url: "" // Dynamically injected on load/sync
}));
