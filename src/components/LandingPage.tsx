import { useState } from "react";
import { 
  Sparkles, Layers, Sliders, ChevronRight, Check, Image as ImageIcon,
  Zap, Compass, Shield, Laptop, ArrowRight, UploadCloud, Cpu
} from "lucide-react";
import UploadZone from "./UploadZone";

// Generates an inline high-quality modern SVG vector poster for immediate, offline trial of the applet
export function generateDemoSVG(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
    <rect width="800" height="600" fill="url(#bg-grad)"/>
    <defs>
      <linearGradient id="bg-grad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b0f19"/>
        <stop offset="100%" stop-color="#1e1b4b"/>
      </linearGradient>
      <linearGradient id="badge-grad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#ec4899"/>
      </linearGradient>
    </defs>

    <!-- Geometric background decorative grids -->
    <path d="M 0,0 L 800,600 M 0,600 L 800,0" stroke="#334155" stroke-opacity="0.15" stroke-width="1"/>
    <circle cx="700" cy="150" r="150" fill="#3b82f6" fill-opacity="0.08"/>
    <circle cx="100" cy="450" r="120" fill="#ec4899" fill-opacity="0.06"/>

    <!-- Card Background Shadow Layer -->
    <rect x="220" y="120" width="360" height="360" rx="32" fill="#1e293b" fill-opacity="0.85" stroke="#475569" stroke-opacity="0.4" stroke-width="2"/>
    
    <!-- Sparkle illustrations (Gold stars representation) -->
    <path d="M 400,160 L 406,174 L 420,180 L 406,186 L 400,200 L 394,186 L 380,180 L 394,174 Z" fill="#f59e0b"/>
    <path d="M 270,390 L 273,397 L 300,400 L 273,403 L 270,410 L 267,403 L 240,400 L 267,397 Z" fill="#ec4899" opacity="0.6"/>

    <!-- Brand Logo/Header Badge -->
    <rect x="330" y="220" width="140" height="34" rx="17" fill="url(#badge-grad)"/>
    <text x="400" y="242" fill="#ffffff" font-family="'Inter', sans-serif" font-size="11" font-weight="900" letter-spacing="1.5" text-anchor="middle">CREATIVE HUB</text>

    <!-- Main Headline Typography Overlay -->
    <text x="400" y="325" fill="#ffffff" font-family="'Inter', system-ui, sans-serif" font-size="28" font-weight="800" text-anchor="middle" letter-spacing="-0.5">FUTURE SPACE</text>
    
    <!-- Fine Tagline Metadata overlays -->
    <text x="400" y="365" fill="#94a3b8" font-family="'Inter', system-ui, sans-serif" font-size="12" font-weight="500" text-anchor="middle">LayerLift separation makes design elements editable with ease.</text>
    
    <!-- Status Pill indicator overlay -->
    <rect x="350" y="410" width="100" height="24" rx="12" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1.5"/>
    <text x="400" y="426" fill="#10b981" font-family="'Inter', sans-serif" font-size="10" font-weight="bold" text-anchor="middle">&#9679; COGNITIVE LIVE</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

export const DEMO_LAYERS = [
  {
    id: "demo_bg",
    name: "Nebula Space Backdrop",
    type: "Background",
    box_2d: [0, 0, 1000, 1000],
    confidence: 0.98,
    ocrText: ""
  },
  {
    id: "demo_central_card",
    name: "Design Slate Plate",
    type: "Shapes",
    box_2d: [200, 275, 800, 725],
    confidence: 0.94,
    ocrText: ""
  },
  {
    id: "demo_logo_badge",
    name: "Creative Hub Badge Overlay",
    type: "Logo",
    box_2d: [366, 412, 423, 587],
    confidence: 0.92,
    ocrText: "CREATIVE HUB"
  },
  {
    id: "demo_headline",
    name: "Display Header Text",
    type: "Text",
    box_2d: [500, 240, 560, 760],
    confidence: 0.95,
    ocrText: "FUTURE SPACE"
  },
  {
    id: "demo_tagline",
    name: "Creative Subtitle Text",
    type: "Text",
    box_2d: [585, 140, 630, 860],
    confidence: 0.88,
    ocrText: "LayerLift separation makes design elements editable with ease."
  },
  {
    id: "demo_star_accent",
    name: "Gold Star Sparkle Backdrop",
    type: "Illustrations",
    box_2d: [266, 475, 333, 525],
    confidence: 0.85,
    ocrText: ""
  },
  {
    id: "demo_live_pill",
    name: "Indicator Live Pill Overlay",
    type: "Icon",
    box_2d: [683, 437, 723, 562],
    confidence: 0.89,
    ocrText: "LIVE"
  }
];

interface LandingPageProps {
  onImageSelected: (base64: string, name: string, fileType: string) => void;
  onLoadDemo: () => void;
  onError: (msg: string) => void;
}

export default function LandingPage({ onImageSelected, onLoadDemo, onError }: LandingPageProps) {
  return (
    <div className="bg-white min-h-screen font-sans">
      
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-24 md:pt-28 md:pb-32 overflow-hidden bg-radial from-gray-50 via-white to-white border-b border-gray-100">
        
        {/* Absolute ambient grid layout */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-75" />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-6 scale-95 md:scale-100 transition-all">
            <Cpu className="w-4 h-4 text-blue-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Next-Gen Image Separation Engine</span>
          </div>

          <h1 className="font-sans font-bold text-gray-900 tracking-tight text-4xl md:text-6xl max-w-4xl text-center leading-[1.1] mb-6">
            Turn Any Flat Image Into an <span className="text-blue-600 underline decoration-blue-200 decoration-wavy underline-offset-6">Editable PSD</span>.
          </h1>

          <p className="font-sans text-gray-500 text-lg md:text-xl max-w-2xl text-center mb-10 leading-relaxed">
            Upload a flattened design and let AI separate it into editable Photoshop layers within seconds. Preserve sizes, transparent backdrops, text content, and coordinates.
          </p>

          {/* Core Upload Canvas Interface Box */}
          <div className="w-full max-w-3xl mb-12" id="upload-panel">
            <UploadZone onImageSelected={onImageSelected} onError={onError} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#upload-panel"
              className="px-6 py-3.5 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 active:bg-black rounded-2xl shadow-lg shadow-gray-950/10 flex items-center gap-2 transition hover:scale-[1.02]"
            >
              Upload Design <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={onLoadDemo}
              className="px-6 py-3.5 text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-2xl flex items-center gap-2 transition hover:scale-[1.02]"
              id="view-demo-btn"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              View Instant Demo
            </button>
          </div>

        </div>
      </section>

      {/* 2. Feature Grid Segment */}
      <section id="features" className="py-20 md:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <h2 className="font-sans font-bold text-gray-900 text-3xl md:text-4xl tracking-tight mb-4">
              Built Specifically For Designer Workflows
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed">
              No complex options. Drop your flat flyers, social artwork blocks, banners, or logos and export professional-grade layered files cleanly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/30 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-gray-900 text-lg mb-3">AI Layer Detection</h3>
              <p className="font-sans text-gray-500 text-sm leading-relaxed">
                Our vision intelligence detects overlay structures. Separates backgrounds, visual typography, floating badges, icons, logos, shapes, and decorations naturally.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/30 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-gray-900 text-lg mb-3">Editable Preview</h3>
              <p className="font-sans text-gray-500 text-sm leading-relaxed">
                Inspect coordinates within a Figma-inspired interface. Toggle layer eyes, lock assets to prevent mouse clicks, rename titles in-place, and reorder stack index easily.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100/30 transition-all duration-300 flex flex-col items-start">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-sans font-bold text-gray-900 text-lg mb-3">One-Click PSD Export</h3>
              <p className="font-sans text-gray-500 text-sm leading-relaxed">
                Export native Photoshop-compatible layered files directly on the client. Original positioning, transparency alphas, custom layer order, and sizing are correctly preserved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Workflow Steps Segment */}
      <section id="how-it-works" className="py-20 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Pure Simplicity</span>
              <h2 className="font-sans font-bold text-gray-900 text-3xl md:text-4xl tracking-tight mt-2 mb-6">
                Three clicks to editable design files.
              </h2>
              <div className="flex flex-col gap-8">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">1</div>
                  <div>
                    <h4 className="font-sans font-bold text-gray-900 text-base mb-1">Upload flattened layout</h4>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed">Select any JPG or PNG up to 25 MB. Our neural networks scan colors and OCR outlines instantly.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">2</div>
                  <div>
                    <h4 className="font-sans font-bold text-gray-900 text-base mb-1">Tweak visual timeline stack</h4>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed">Rename layered zones, shift overlay depths, toggle visibility grids, or secure layers in the preview board.</p>
                  </div>
                </div>
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-gray-900 text-white font-mono font-bold text-sm flex items-center justify-center shrink-0">3</div>
                  <div>
                    <h4 className="font-sans font-bold text-gray-900 text-base mb-1">Download Photoshop PSD</h4>
                    <p className="font-sans text-sm text-gray-500 leading-relaxed">A clean structured binary outputs directly. Compatible with Adobe Photoshop CC, GIMP, Photopea, and Figma imports.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration SVG mockup representer */}
            <div className="bg-gray-900 p-8 rounded-3xl text-left shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-yellow-500" />
                  <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                </div>
                <span className="text-xs text-gray-500 font-mono">photoshop_builder.log</span>
              </div>
              <ul className="font-mono text-xs text-indigo-200/90 flex flex-col gap-3">
                <li className="flex justify-between"><span>[system] Initializing PSD exporter...</span><span className="text-emerald-400">DONE</span></li>
                <li className="flex justify-between"><span>[ocr] Preserving text layers bounds...</span><span className="text-emerald-400">OK</span></li>
                <li className="flex justify-between"><span>[crop] Masking translucent vector coordinates...</span><span className="text-emerald-400">98%</span></li>
                <li className="flex justify-between"><span>[compiler] Bundling Photoshop native layers...</span><span className="text-blue-400">100%</span></li>
                <li className="text-yellow-400 mt-2">✨ SUCCESS: LayerLift_compiled_design.psd saved locally!</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Pricing / Feature Tier Block */}
      <section id="pricing" className="py-20 md:py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Transparent Pricing</span>
            <h2 className="font-sans font-bold text-gray-900 text-3xl md:text-4xl tracking-tight mt-2 mb-4">
              Completely free while in beta.
            </h2>
            <p className="font-sans text-gray-500 leading-relaxed text-sm">
              We are currently fine-tuning our image-segmentation architectures. Enjoy free full-fidelity layered imports and downloads during our initial product preview period!
            </p>
          </div>

          <div className="max-w-md mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-blue-500 text-white font-sans text-xs font-bold uppercase px-4 py-1.5 rounded-bl-3xl">
              Beta Offer
            </div>

            <div className="mb-6">
              <h3 className="font-sans font-bold text-gray-900 text-xl">Unlimited Separation Pack</h3>
              <p className="font-sans text-xs text-gray-400 mt-1">Perfect for professional design agencies and freelancers</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-gray-950">$0</span>
              <span className="text-sm font-medium text-gray-400">/ forever while beta is live</span>
            </div>

            <ul className="flex flex-col gap-4 border-t border-b border-gray-50 py-6 mb-8 text-sm text-gray-600">
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500" /> AI-based multi-layer detection</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500" /> Preserves coordinates and positions</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500" /> Transparent alpha-channel masks</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500" /> Compatible with Photoshop, Figma, Photopea</li>
              <li className="flex items-center gap-2.5"><Check className="w-4 h-4 text-emerald-500" /> Generous 25 MB max image dimension size</li>
            </ul>

            <a
              href="#upload-panel"
              className="block w-full py-3.5 rounded-2xl bg-gray-900 text-white hover:bg-gray-800 font-bold text-sm text-center transition"
            >
              Get Started Free Now
            </a>
          </div>
        </div>
      </section>

      {/* 5. Pure minimalist Footer */}
      <footer className="border-t border-gray-50 py-12 text-center text-xs text-gray-400 bg-white">
        <p className="font-sans font-medium">© 2026 LayerLift AI. Crafted for agencies and creative design professionals.</p>
      </footer>

    </div>
  );
}
