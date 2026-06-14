import { writePsd } from "ag-psd";
import { LayerItem } from "../types";

/**
 * Helper to load an image source as an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error("Failed to load design image asset: " + err));
  });
}

/**
 * Creates an individual cropped Canvas element for a specific bounding box of lander items
 */
export function cropLayerCanvas(
  originalImage: HTMLImageElement,
  box_2d: [number, number, number, number]
): HTMLCanvasElement {
  const [ymin, xmin, ymax, xmax] = box_2d;
  
  const originalWidth = originalImage.naturalWidth || originalImage.width;
  const originalHeight = originalImage.naturalHeight || originalImage.height;

  // Convert normalised 0-1000 coord boundaries to physical pixel positions
  const left = Math.round((xmin / 1000) * originalWidth);
  const top = Math.round((ymin / 1000) * originalHeight);
  const right = Math.round((xmax / 1000) * originalWidth);
  const bottom = Math.round((ymax / 1000) * originalHeight);

  const rectWidth = Math.max(1, right - left);
  const rectHeight = Math.max(1, bottom - top);

  // Set up offscreen renderer
  const canvas = document.createElement("canvas");
  canvas.width = rectWidth;
  canvas.height = rectHeight;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    // Draw the specific sub-rectangle region of the flat template
    ctx.drawImage(
      originalImage,
      left,
      top,
      rectWidth,
      rectHeight,
      0,
      0,
      rectWidth,
      rectHeight
    );
  }

  return canvas;
}

/**
 * Compiles a layered PSD structure and downloads it to the client computer
 */
export function exportToPSD(
  originalImage: HTMLImageElement,
  layers: LayerItem[],
  fileName: string = "layered_design"
): void {
  try {
    const originalWidth = originalImage.naturalWidth || originalImage.width;
    const originalHeight = originalImage.naturalHeight || originalImage.height;

    // Convert layers list to PSD format. Note: in PSD files, bottom-most layers are in Photoshop 
    // represented relative to parent canvas size, and ag-psd expects bottom layers first in array (reverse sequence).
    // Let's copy layers array, reverse, and compile.
    const psdChildren = [...layers]
      .reverse()
      .map((layer) => {
        const [ymin, xmin, ymax, xmax] = layer.box_2d;
        
        // Compute pixel absolute positions
        const left = Math.round((xmin / 1000) * originalWidth);
        const top = Math.round((ymin / 1000) * originalHeight);
        
        // If layer doesn't have an pre-extracted canvas, lazily generate one now
        const layerCanvas = layer.canvas || cropLayerCanvas(originalImage, layer.box_2d);

        return {
          name: layer.name,
          canvas: layerCanvas,
          left: left,
          top: top,
          // Photoshop visibility states
          opacity: 255, 
          hidden: !layer.visible,
        };
      });

    const psdStructure = {
      width: originalWidth,
      height: originalHeight,
      children: psdChildren,
    };

    // Bundle into Adobe Photoshop binary buffer
    const arrayBuffer = writePsd(psdStructure);
    const blob = new Blob([arrayBuffer], { type: "image/vnd.adobe.photoshop" });

    // Stream download link to trigger client save dialg
    const cleanFileName = fileName.replace(/\.[^/.]+$/, "") + "_separated.psd";
    const downloadUrl = URL.createObjectURL(blob);
    
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = cleanFileName;
    document.body.appendChild(anchor);
    anchor.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(downloadUrl);
    }, 100);

  } catch (error) {
    console.error("Failed compiling layers into professional Photoshop binary", error);
    throw error;
  }
}
