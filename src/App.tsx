import { useState, useEffect } from "react";
import Header from "./components/Header";
import LandingPage, { generateDemoSVG, DEMO_LAYERS } from "./components/LandingPage";
import EditorStudio from "./components/EditorStudio";
import { WorkspaceState } from "./types";
import { Loader2, Sparkles, Wand2, ShieldAlert } from "lucide-react";

export default function App() {
  const [viewState, setViewState] = useState<WorkspaceState>("landing");
  const [imageSrc, setImageSrc] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [layers, setLayers] = useState<any[]>([]);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-cycling creative progress messages during model run
  const [loadingStep, setLoadingStep] = useState(0);
  const loadingPhrases = [
    "Analyzing design layouts...",
    "Isolating background backdrop gradients...",
    "Scanning overlay text structures via OCR...",
    "Isolating objects and shapes...",
    "Slicing layers and preserving dimensions...",
    "Perfecting transparency outlines..."
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (viewState === "processing") {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingPhrases.length);
      }, 1200);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [viewState]);

  // Handler for user's uploaded custom JPG/PNG images
  const handleImageSelected = async (base64: string, name: string, fileType: string) => {
    setViewState("processing");
    setErrorMessage(null);
    setIsFallback(false);
    setImageSrc(base64);
    setFileName(name);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: fileType }),
      });

      if (!response.ok) {
        throw new Error("Failure from model separating layer assets.");
      }

      const data = await response.json();
      
      if (data.isFallback) {
        setIsFallback(true);
      }
      setLayers(data.layers || []);
      setViewState("editing");

    } catch (err: any) {
      console.warn("Express analyze route returned err or bypassed. Loading robust fallback layout template:", err);
      // Fulfill requirement 11: If image processing fails: Show notice but allow PSD export anyway.
      setIsFallback(true);
      
      // Load a smart set of layer coordinates spanning standard sections
      const heuristicLayers = [
        {
          id: "layer_err_bg",
          name: "Background Backdrop",
          type: "Background",
          box_2d: [0, 0, 1000, 1000],
          confidence: 0.99,
          ocrText: ""
        },
        {
          id: "layer_err_visual",
          name: "Main Segment Block",
          type: "Shapes",
          box_2d: [150, 100, 850, 900],
          confidence: 0.75,
          ocrText: ""
        },
        {
          id: "layer_err_caption",
          name: "Header Overlay",
          type: "Text",
          box_2d: [250, 200, 400, 800],
          confidence: 0.85,
          ocrText: "Separated Typography"
        },
        {
          id: "layer_err_tagline",
          name: "Subtitle Overlay",
          type: "Text",
          box_2d: [480, 250, 580, 750],
          confidence: 0.80,
          ocrText: "Design Separated Layer"
        }
      ];
      setLayers(heuristicLayers);
      setViewState("editing");
    }
  };

  // Handler for immediate one-click interactive vector Demo Mode
  const handleLoadDemo = () => {
    setViewState("processing");
    setErrorMessage(null);
    setIsFallback(false);

    const demoSVGData = generateDemoSVG();
    setImageSrc(demoSVGData);
    setFileName("LayerLift_Premium_Flyer_Demo.png");

    // Give a beautiful short timeout simulation of AI separator analysis for the demo mode
    setTimeout(() => {
      setLayers(DEMO_LAYERS);
      setViewState("editing");
    }, 1500);
  };

  const handleResetWorkspace = () => {
    setViewState("landing");
    setImageSrc("");
    setLayers([]);
    setIsFallback(false);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 select-none flex flex-col">
      {/* Visual Navigation Bar */}
      <Header onReset={handleResetWorkspace} onTryFree={handleResetWorkspace} />

      {/* Main workspace layout */}
      <main className="flex-grow flex flex-col">
        {viewState === "landing" && (
          <LandingPage 
            onImageSelected={handleImageSelected} 
            onLoadDemo={handleLoadDemo} 
            onError={(msg) => setErrorMessage(msg)} 
          />
        )}

        {viewState === "processing" && (
          <div className="flex-grow flex flex-col items-center justify-center p-8 bg-radial from-gray-50 via-white to-white text-center min-h-[500px]">
            <div className="relative mb-8">
              {/* Spinning visual radar */}
              <div className="absolute inset-0 rounded-full border border-blue-100 scale-150 animate-ping opacity-25" />
              <div className="w-20 h-20 rounded-2xl bg-gray-900 flex items-center justify-center text-white shadow-xl shadow-gray-900/10 relative z-10">
                <Wand2 className="w-8 h-8 text-blue-400 animate-pulse" />
              </div>
            </div>

            <h2 className="font-sans font-extrabold text-gray-900 text-2xl md:text-3xl tracking-tight mb-2 flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" /> Analyzing your design...
            </h2>
            
            <p className="font-sans text-gray-400 text-sm max-w-sm font-mono h-6 transition-all duration-300">
              {loadingPhrases[loadingStep]}
            </p>

            <div className="w-64 h-1.5 bg-gray-100 rounded-full mt-6 overflow-hidden border border-gray-50/50">
              <div 
                className="h-full bg-blue-600 transition-all duration-500 rounded-full"
                style={{ width: `${((loadingStep + 1) / loadingPhrases.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {viewState === "editing" && (
          <EditorStudio 
            imageSrc={imageSrc} 
            originalName={fileName} 
            initialLayers={layers} 
            isFallback={isFallback} 
            onReset={handleResetWorkspace} 
          />
        )}
      </main>

      {/* Persistent slide-out Error dialog handler */}
      {errorMessage && (
        <div className="fixed bottom-6 right-6 bg-red-950 text-red-100 border border-red-900 rounded-2xl p-4 shadow-xl flex gap-3.5 items-start max-w-md z-50 animate-in fade-in slide-in-from-bottom-4">
          <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <h4 className="font-sans font-bold text-red-200 text-sm">Upload Issue Detected</h4>
            <p className="font-sans text-xs text-red-300 mt-0.5">{errorMessage}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setErrorMessage(null)} 
            className="text-red-400 hover:text-red-200 text-sm font-bold"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
