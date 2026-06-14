import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsers with a 75mb upload limit for high-res design graphics
app.use(express.json({ limit: "75mb" }));
app.use(express.urlencoded({ limit: "75mb", extended: true }));

// Shared Gemini agent client
let ai: GoogleGenAI | null = null;
try {
  if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  } else {
    console.warn("GEMINI_API_KEY is missing from process.env; AI features will operate with demo fail-safes.");
  }
} catch (e) {
  console.error("Failed to initialize Google GenAI SDK client:", e);
}

// Endpoint to analyze components within a design image using Gemini
app.post("/api/analyze", async (req, res) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 in request body." });
    }

    // Extract raw base64 data
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const actualMimeType = mimeType || "image/png";

    let layersData = null;

    if (process.env.GEMINI_API_KEY && ai) {
      const imagePart = {
        inlineData: {
          mimeType: actualMimeType,
          data: base64Data,
        },
      };

      const promptText = `Analyze this image and identify all individual editable design layers. Extract their types, names, coordinate boxes, and text contents (if text). Separate overlapping elements. Make sure to identify background, texts, icons, logos, illustrations, objects, and shapes, returning them in a structured JSON schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [imagePart, promptText],
        config: {
          systemInstruction: `You are an expert graphic design layer separator. Analyze the flat graphic layout and detect all visual design elements that would form individual Photoshop layers.
Categories to detect: Background, Text, Shapes, Logo, Icon, Photo, Objects, Illustrations, Decorative.
For each layer, you must define:
1. 'id': A unique, short identifier string.
2. 'name': A clean, user-friendly descriptive layer title (e.g. "Main Title Text", "Call to Action Shape", "App Icon", "Background Pattern").
3. 'type': One of: Background, Text, Shapes, Logo, Icon, Photo, Objects, Illustrations, Decorative.
4. 'box_2d': A precise, tightly bounded normalized array of coordinates on a 0-1000 scale: [ymin, xmin, ymax, xmax].
   - Ground backdrop layers always span [0, 0, 1000, 1000].
   - Foreground items should have compact boundary coordinates around their actual pixel region.
5. 'confidence': Float between 0.0 and 1.0.
6. 'ocrText': If category is 'Text', perform OCR on this localized segment to retrieve the text content. Otherwise, leave empty.

Your response must be valid JSON in the requested schema. Ensure overlapping elements are output as separate layers.`,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              layers: {
                type: Type.ARRAY,
                description: "Array of detected design components and background backdrop layers",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    name: { type: Type.STRING },
                    type: { type: Type.STRING },
                    box_2d: {
                      type: Type.ARRAY,
                      items: { type: Type.INTEGER },
                      description: "Normalized bounds [ymin, xmin, ymax, xmax] on a scales of 0-1000"
                    },
                    confidence: { type: Type.NUMBER },
                    ocrText: { type: Type.STRING }
                  },
                  required: ["id", "name", "type", "box_2d", "confidence"]
                }
              }
            },
            required: ["layers"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        try {
          layersData = JSON.parse(responseText.trim());
        } catch (parseErr) {
          console.error("Gemini failed to output valid JSON schema:", responseText);
        }
      }
    }

    // Fallback response in case of API Key absence, network rate limits, or parse failure.
    // Designers are still allowed to inspect and export using our robust client-side heuristics.
    if (!layersData) {
      console.log("No AI results generated. Initiating local heuristic layer template fallback.");
      layersData = {
        layers: [
          {
            id: "layer_fallback_bg",
            name: "Background Backdrop",
            type: "Background",
            box_2d: [0, 0, 1000, 1000],
            confidence: 0.95,
            ocrText: ""
          },
          {
            id: "layer_fallback_box1",
            name: "Main Feature Backdrop",
            type: "Shapes",
            box_2d: [200, 150, 800, 850],
            confidence: 0.70,
            ocrText: ""
          },
          {
            id: "layer_fallback_title",
            name: "Header Typography Overlay",
            type: "Text",
            box_2d: [260, 250, 420, 750],
            confidence: 0.85,
            ocrText: "LayerLift AI Separator"
          },
          {
            id: "layer_fallback_subtext",
            name: "Body Text Overlay",
            type: "Text",
            box_2d: [460, 300, 560, 700],
            confidence: 0.80,
            ocrText: "Turn Any flat image into a layered PSD with Ease."
          },
          {
            id: "layer_fallback_badge",
            name: "Call to Action CTA Layer",
            type: "Logo",
            box_2d: [650, 400, 750, 600],
            confidence: 0.75,
            ocrText: "Export Now"
          }
        ],
        isFallback: true
      };
    }

    return res.json(layersData);

  } catch (error: any) {
    console.error("Exception handled during layer separations:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during AI design processing.",
      isFallback: true
    });
  }
});

// Configure Vite integration or production routing
async function startApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LayerLift AI running on port ${PORT}`);
  });
}

startApp().catch((err) => {
  console.error("Vite/Express initialization failed:", err);
});
