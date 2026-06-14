export interface LayerItem {
  id: string;
  name: string;
  type: "Background" | "Text" | "Shapes" | "Logo" | "Icon" | "Photo" | "Objects" | "Illustrations" | "Decorative";
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in 0-1000 scale
  confidence: number;
  ocrText?: string;
  visible: boolean;
  locked: boolean;
  // Non-serializable canvas segment reference containing cropped pixel data
  canvas?: HTMLCanvasElement;
}

export type WorkspaceState = "landing" | "processing" | "editing";
