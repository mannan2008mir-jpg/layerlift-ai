import React, { useState, useRef } from "react";
import { UploadCloud, Image, AlertCircle } from "lucide-react";

interface UploadZoneProps {
  onImageSelected: (base64: string, name: string, fileType: string) => void;
  onError: (msg: string) => void;
}

export default function UploadZone({ onImageSelected, onError }: UploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    // 1. Format validation: PNG, JPG, JPEG
    const validMimeTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!validMimeTypes.includes(file.type)) {
      onError("Unsupported format! Please upload an eligible PNG, JPG, or JPEG design image.");
      return;
    }

    // 2. Size validation: 25MB Max
    const maxSizeInBytes = 25 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      onError("File is too large! Maximum allowed image size limit is 25 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageSelected(reader.result, file.name, file.type);
      } else {
        onError("Failed to parse image content.");
      }
    };
    reader.onerror = () => {
      onError("Failed reading file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={triggerFileInput}
      className={`relative w-full max-w-2xl mx-auto h-72 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 group overflow-hidden ${
        isDragActive
          ? "border-blue-500 bg-blue-50/40 shadow-inner scale-[0.99]"
          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-xl hover:shadow-gray-100/40"
      }`}
      id="image-dropzone"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".png,.jpg,.jpeg"
        className="hidden"
        id="file-input-field"
      />

      {/* Decorative backdrop mesh */}
      <div className="absolute inset-0 bg-radial from-transparent to-gray-50/50 opacity-40 pointer-events-none" />

      {/* Upload icon container with motion style hover */}
      <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${
        isDragActive 
          ? "bg-blue-500 text-white scale-110 rotate-3" 
          : "bg-gray-50 text-gray-400 group-hover:bg-gray-900 group-hover:text-white group-hover:scale-105"
      }`}>
        <UploadCloud className="w-8 h-8" />
      </div>

      <h3 className="font-sans font-semibold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
        Drag & Drop your image here
      </h3>
      <p className="font-sans text-sm text-gray-500 mb-4">
        or <span className="text-blue-600 font-semibold underline decoration-2 underline-offset-2">browse computer files</span>
      </p>

      {/* Supported details footer */}
      <div className="flex gap-4 items-center text-xs text-gray-400 border-t border-gray-50 pt-4 w-full justify-center">
        <span className="flex items-center gap-1.5 font-medium"><Image className="w-3.5 h-3.5" /> PNG, JPG, JPEG</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
        <span className="font-medium">Max size: 25 MB</span>
      </div>
    </div>
  );
}
