import React, { useState, useEffect, useRef } from "react";
import { 
  Eye, EyeOff, Lock, Unlock, ArrowUp, ArrowDown, 
  Download, Edit2, Play, AlertTriangle, Layers, Type, 
  Square, Image as ImageIcon, HelpCircle, Check, Loader2, Sparkles, RefreshCw
} from "lucide-react";
import { LayerItem } from "../types";
import { cropLayerCanvas, exportToPSD } from "../utils/psdHelper";

interface EditorStudioProps {
  imageSrc: string;
  originalName: string;
  initialLayers: any[];
  isFallback: boolean;
  onReset: () => void;
}

export default function EditorStudio({ 
  imageSrc, 
  originalName, 
  initialLayers, 
  isFallback, 
  onReset 
}: EditorStudioProps) {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [scale, setScale] = useState(1);
  const [isCropping, setIsCropping] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState("");

  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Load the original image asset element
  useEffect(() => {
    let active = true;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      if (!active) return;
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setImageElement(img);
      setImageSize({ width: w, height: h });
      setIsCropping(true);

      // Lazily crop canvas pieces for each identified coordinate block
      const processed = initialLayers.map((l, index) => {
        try {
          const croppedCanvas = cropLayerCanvas(img, l.box_2d);
          return {
            ...l,
            id: l.id || `layer_${index}`,
            visible: true,
            locked: false,
            canvas: croppedCanvas,
          };
        } catch (e) {
          console.error("Heuristics crop fail for layer:", l.name, e);
          return {
            ...l,
            id: l.id || `layer_${index}`,
            visible: true,
            locked: false,
          };
        }
      });

      setLayers(processed);
      setIsCropping(false);
    };
    return () => {
      active = false;
    };
  }, [imageSrc, initialLayers]);

  // Handle responsive preview zoom factor calculations
  useEffect(() => {
    const handleResize = () => {
      if (!canvasContainerRef.current || imageSize.width === 0) return;
      
      const containerWidth = canvasContainerRef.current.clientWidth - 48; // padding padding
      const containerHeight = Math.max(350, window.innerHeight - 320);
      
      const scaleX = containerWidth / imageSize.width;
      const scaleY = containerHeight / imageSize.height;
      
      const optimalScale = Math.min(scaleX, scaleY, 1); // Clamp maximum scale to 1 (100%)
      setScale(optimalScale);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // Small timeout to give DOM elements correct physical dimensions
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [imageSize]);

  // Toggle Visibility of specific layer channel
  const toggleVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  // Toggle Lock of physical elements
  const toggleLock = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ));
  };

  // Stack depth ordering changes
  const moveLayer = (index: number, direction: "up" | "down", e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;

    const modified = [...layers];
    const temp = modified[index];
    modified[index] = modified[targetIndex];
    modified[targetIndex] = temp;
    
    setLayers(modified);
  };

  // In-line title renaming operations
  const startRenaming = (layer: LayerItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLayerId(layer.id);
    setEditingNameValue(layer.name);
  };

  const saveRenaming = () => {
    if (editingLayerId && editingNameValue.trim() !== "") {
      setLayers(prev => prev.map(layer =>
        layer.id === editingLayerId ? { ...layer, name: editingNameValue.trim() } : layer
      ));
    }
    setEditingLayerId(null);
  };

  const handleRenameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveRenaming();
    } else if (e.key === "Escape") {
      setEditingLayerId(null);
    }
  };

  // Trigger compiler downloading
  const handleExport = async () => {
    if (!imageElement || layers.length === 0) return;
    setExporting(true);
    // Minimal artificial delay to give beautiful download spinner feedback
    setTimeout(() => {
      try {
        exportToPSD(imageElement, layers, originalName);
      } catch (err) {
        alert("We standardly prepare the layered export but encountered a save wrapper trigger constraint. Proceeding with standard copy.");
      } finally {
        setExporting(false);
      }
    }, 800);
  };

  // Categorized aesthetic metadata bindings
  const getBadgeStyle = (type: string) => {
    switch (type) {
      case "Background":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "Text":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "Shapes":
        return "bg-amber-50 text-amber-700 border-amber-100";
      case "Logo":
        return "bg-purple-50 text-purple-700 border-purple-100";
      case "Icon":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "Photo":
      case "Objects":
        return "bg-rose-50 text-rose-700 border-rose-100";
      case "Illustrations":
      case "Decorative":
        return "bg-indigo-50 text-indigo-700 border-indigo-100";
      default:
        return "bg-gray-50 text-gray-700 border-gray-100";
    }
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "Background":
        return <Layers className="w-3.5 h-3.5 text-slate-500" />;
      case "Text":
        return <Type className="w-3.5 h-3.5 text-blue-500" />;
      case "Shapes":
        return <Square className="w-3.5 h-3.5 text-amber-500" />;
      case "Logo":
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case "Icon":
        return <HelpCircle className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="w-full bg-gray-50/50 min-h-screen py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        
        {/* Top Status Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                AI Separator Complete
              </span>
              <span className="text-xs text-gray-400 font-mono">
                {imageSize.width} × {imageSize.height} px
              </span>
            </div>
            <h1 className="font-sans font-bold text-gray-900 text-xl md:text-2xl mt-1 max-w-md truncate">
              {originalName}
            </h1>
          </div>

          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <button
              onClick={onReset}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl transition"
              id="reset-workspace-btn"
            >
              <RefreshCw className="w-4 h-4" />
              Upload New
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || layers.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 disabled:opacity-50 disabled:pointer-events-none rounded-2xl shadow-lg shadow-gray-950/10 transition"
              id="download-psd-btn"
            >
              {exporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating PSD...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export as PSD
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning notification for fallbacks */}
        {isFallback && (
          <div className="flex gap-3 bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl items-center text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="font-sans">
              "We couldn't perfectly separate every element, but we've prepared the best editable PSD possible." You can still tailor, rename, toggle layers manually and export.
            </p>
          </div>
        )}

        {/* Core Editor Board Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT: Interactive Layers Control Panel */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-5 flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4 mb-4">
              <span className="font-sans font-bold text-gray-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-gray-700" /> Elements Layers Stack
              </span>
              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full text-gray-500 font-mono">
                {layers.length} Layers
              </span>
            </div>

            {isCropping ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                <span className="text-sm font-medium">Extracting layer pieces...</span>
              </div>
            ) : (
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[550px] pr-1">
                {layers.map((layer, index) => {
                  const isSelected = selectedLayerId === layer.id;
                  const isEditing = editingLayerId === layer.id;

                  return (
                    <div
                      key={layer.id}
                      onClick={() => !layer.locked && setSelectedLayerId(layer.id)}
                      className={`group relative flex items-center gap-3.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? "border-blue-500 bg-blue-50/20 shadow-sm" 
                          : "border-gray-100 hover:border-gray-200 hover:bg-gray-50/50"
                      } ${!layer.visible ? "opacity-60" : ""}`}
                    >
                      {/* Depth Ordering Trigger Controls */}
                      <div className="flex flex-col gap-1 items-center bg-gray-50/80 p-1.5 rounded-lg border border-gray-100/50">
                        <button
                          disabled={index === 0}
                          onClick={(e) => moveLayer(index, "up", e)}
                          className="hover:text-black hover:bg-gray-200/50 rounded p-0.5 disabled:opacity-20 transition text-gray-400"
                          title="Move layer up (increase depth overlay)"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          disabled={index === layers.length - 1}
                          onClick={(e) => moveLayer(index, "down", e)}
                          className="hover:text-black hover:bg-gray-200/50 rounded p-0.5 disabled:opacity-20 transition text-gray-400"
                          title="Move layer down (decrease depth overlay)"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Small cropped pixel preview or placeholder backdrop */}
                      <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden relative border border-gray-200 flex-shrink-0 flex items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:8px_8px]">
                        {layer.canvas ? (
                          <img 
                            src={layer.canvas.toDataURL()} 
                            alt="" 
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-300" />
                        )}
                      </div>

                      {/* Layer Info details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingNameValue}
                              onChange={(e) => setEditingNameValue(e.target.value)}
                              onBlur={saveRenaming}
                              onKeyDown={handleRenameKeyPress}
                              className="w-full text-sm font-semibold text-gray-900 border border-blue-500 rounded px-1.5 py-0.5 outline-none "
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span 
                              className="font-sans font-bold text-gray-900 text-sm truncate flex items-center gap-1 hover:text-blue-600 transition-colors"
                              title="Click rename icon to edit"
                            >
                              {layer.name}
                            </span>
                          )}
                          {!isEditing && (
                            <button
                              onClick={(e) => startRenaming(layer, e)}
                              className="text-gray-400 hover:text-gray-900 self-center opacity-0 group-hover:opacity-100 transition-all p-0.5"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        {/* Type Indicator classification badge */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded border ${getBadgeStyle(layer.type)}`}>
                            {getLayerIcon(layer.type)}
                            {layer.type}
                          </span>
                          {layer.ocrText && (
                            <span className="text-[11px] text-gray-400 font-medium italic truncate max-w-[130px]" title={layer.ocrText}>
                              "{layer.ocrText}"
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Edge Actions (Lock/Visibility) */}
                      <div className="flex items-center gap-1.5 relative z-10">
                        <button
                          onClick={(e) => toggleLock(layer.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            layer.locked 
                              ? "bg-red-50 text-red-600 hover:bg-red-100" 
                              : "text-gray-400 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                          title={layer.locked ? "Layer is locked inside the preview" : "Lock layer to avoid clicking"}
                        >
                          {layer.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={(e) => toggleVisibility(layer.id, e)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            layer.visible 
                              ? "text-gray-700 hover:bg-gray-100" 
                              : "bg-gray-100 text-gray-400"
                          }`}
                          title={layer.visible ? "Visible in viewport" : "Hidden"}
                        >
                          {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* CENTER: Main Checkerboard Workspace Viewport */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-4 text-sm text-gray-500">
              <span className="font-semibold text-gray-700">Canvas Viewer</span>
              <div className="flex gap-4 items-center text-xs">
                <span>Zoom Scale: <strong className="font-mono">{Math.round(scale * 100)}%</strong></span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-250" />
                <span className="text-gray-400">Checker design represents transparent backdrops</span>
              </div>
            </div>

            {/* Checkered Canvas container */}
            <div 
              ref={canvasContainerRef}
              className="flex-1 flex items-center justify-center p-6 rounded-2xl bg-gray-100 border border-gray-150 relative min-h-[420px] select-none bg-[radial-gradient(#d1d5db_1px,transparent_1px)] [background-size:16px_16px] overflow-hidden"
              onClick={() => setSelectedLayerId(null)}
            >
              {/* Resizable Preview stage wrapper */}
              {imageSize.width > 0 && (
                <div 
                  className="relative shadow-2xl transition-all duration-300"
                  style={{
                    width: `${imageSize.width * scale}px`,
                    height: `${imageSize.height * scale}px`,
                    // Standard transparent PNG mesh grid backdrop
                    backgroundImage: "conic-gradient(#ffffff 25%, #f3f4f6 25%, #f3f4f6 50%, #ffffff 50%, #ffffff 75%, #f3f4f6 75%)",
                    backgroundSize: "20px 20px"
                  }}
                >
                  {/* Layer Renderings based on Coordinates */}
                  {layers.map((layer) => {
                    if (!layer.visible) return null;

                    // Extrapolate bounding box percentage coordinates (ymin, xmin, ymax, xmax)
                    const [ymin, xmin, ymax, xmax] = layer.box_2d;
                    
                    const leftPercent = xmin / 10;
                    const topPercent = ymin / 10;
                    const widthPercent = (xmax - xmin) / 10;
                    const heightPercent = (ymax - ymin) / 10;

                    const isSelected = selectedLayerId === layer.id;

                    return (
                      <div
                        key={layer.id}
                        className={`absolute transition-all ${
                          isSelected 
                            ? "outline-[2px] outline-dashed outline-blue-500 z-30" 
                            : "hover:outline-[1px] hover:outline-dashed hover:outline-gray-400"
                        } ${layer.locked ? "pointer-events-none" : "cursor-pointer"}`}
                        style={{
                          left: `${leftPercent}%`,
                          top: `${topPercent}%`,
                          width: `${widthPercent}%`,
                          height: `${heightPercent}%`,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!layer.locked) {
                            setSelectedLayerId(layer.id);
                          }
                        }}
                      >
                        {/* Render the individual layer item pixels */}
                        {layer.canvas ? (
                          <img
                            src={layer.canvas.toDataURL()}
                            alt=""
                            className="w-full h-full object-fill block"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500/10 border border-blue-500/20" />
                        )}

                        {/* Interactive overlay resize knots */}
                        {isSelected && (
                          <>
                            <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />
                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />
                            <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />
                            <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-white border-2 border-blue-600 rounded-sm" />
                            
                            {/* Short category identifier indicator tag */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-blue-600 text-white font-sans text-[10px] font-bold px-2 py-0.5 rounded shadow-sm whitespace-nowrap pointer-events-none">
                              {layer.name} ({layer.type})
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
