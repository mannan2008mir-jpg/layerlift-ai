import { Layers, Sparkles } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
  onTryFree?: () => void;
}

export default function Header({ onReset, onTryFree }: HeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo/Branding */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={onReset}
          id="header-logo"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white shadow-md shadow-gray-900/10 transition-transform group-hover:scale-105">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-sans font-bold tracking-tight text-gray-900 text-lg flex items-center gap-1.5">
              LayerLift <span className="text-blue-600 flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 bg-blue-50 rounded-full border border-blue-100"><Sparkles className="w-3 h-3 text-blue-600" /> AI</span>
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            How It Works
          </a>
          <a href="#pricing" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Pricing
          </a>
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={onTryFree}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 active:bg-black rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            id="try-free-btn"
          >
            Try Free
          </button>
        </div>
      </div>
    </header>
  );
}
