import React, { useState, useEffect } from "react";
import { Cropper, CropperCropArea, CropperImage, CropperDescription } from "@/components/ui/cropper";
import { Button } from "@/components/ui/button";
import { 
  RotateCcw, RotateCw, ZoomIn, Sun, Contrast, Droplet, 
  Image as ImageIcon, PaintBucket, FlipHorizontal, FlipVertical, 
  Scaling, Sparkles, Sliders, SunDim 
} from "lucide-react";
import { getImageState, saveImageState } from "../system/db";
import toast from "react-hot-toast";

interface AdvancedImageEditorProps {
  imageSrc: string;
  aspectRatio?: number;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
  title?: string;
  isUploading?: boolean;
  fullScreen?: boolean;
  mode?: "crop" | "filter" | "all";
  imageKey?: string;
  hasMoreInQueue?: boolean;
  onApplyToAll?: (settings: any) => void;
}

export default function AdvancedImageEditor({
  imageSrc,
  aspectRatio,
  onConfirm,
  onCancel,
  title = "Edit Image",
  isUploading = false,
  fullScreen = true,
  mode = "all",
  imageKey,
  hasMoreInQueue = false,
  onApplyToAll,
}: AdvancedImageEditorProps) {
  const [currentImageSrc, setCurrentImageSrc] = useState(imageSrc);
  const [cropData, setCropData] = useState<any>(null);
  const [zoom, setZoom] = useState(1);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [blur, setBlur] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);
  const [activeTool, setActiveTool] = useState<"zoom" | "rotate" | "color" | "resize" | "retouch" | "curves" | "grading" | "presets" | null>(null);

  // New photo editing states
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [resizeWidth, setResizeWidth] = useState<string>("");
  const [resizeHeight, setResizeHeight] = useState<string>("");
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [sharpness, setSharpness] = useState(0); // 0 (none) to 2 (max)
  const [exposure, setExposure] = useState(1); // 0.5 to 2.0
  const [redBalance, setRedBalance] = useState(1); // 0.5 to 1.5
  const [greenBalance, setGreenBalance] = useState(1); // 0.5 to 1.5
  const [blueBalance, setBlueBalance] = useState(1); // 0.5 to 1.5

  // Retouching states
  const [skinSmoothing, setSkinSmoothing] = useState(0); // 0 to 100
  const [teethWhitening, setTeethWhitening] = useState(0); // 0 to 100
  const [faceSlimming, setFaceSlimming] = useState(0); // 0 to 100
  const [eyeEnhancement, setEyeEnhancement] = useState(0); // 0 to 100
  const [isBlemishBrushActive, setIsBlemishBrushActive] = useState(false);

  // Advanced features: Curves, Color Grading, Presets
  const [curvesPoints, setCurvesPoints] = useState<{ x: number; y: number }[]>([
    { x: 0, y: 0 },
    { x: 128, y: 128 },
    { x: 255, y: 255 }
  ]);
  const [shadowsR, setShadowsR] = useState(0);
  const [shadowsG, setShadowsG] = useState(0);
  const [shadowsB, setShadowsB] = useState(0);
  const [midtonesR, setMidtonesR] = useState(0);
  const [midtonesG, setMidtonesG] = useState(0);
  const [midtonesB, setMidtonesB] = useState(0);
  const [highlightsR, setHighlightsR] = useState(0);
  const [highlightsG, setHighlightsG] = useState(0);
  const [highlightsB, setHighlightsB] = useState(0);
  const [presetFilter, setPresetFilter] = useState<"normal" | "vivid" | "vintage" | "bw" | "hdr" | "cartoon" | "sketch">("normal");
  const [creativeBlur, setCreativeBlur] = useState(0);



  useEffect(() => {
    async function initImage() {
      if (imageKey) {
        const state = await getImageState(imageKey);
        if (state) {
          try {
            const localUrl = URL.createObjectURL(state.originalBlob);
            setCurrentImageSrc(localUrl);
            
            // Restore settings
            setZoom(state.settings.zoom);
            setBrightness(state.settings.brightness);
            setContrast(state.settings.contrast);
            setSaturation(state.settings.saturation);
            setGrayscale(state.settings.grayscale || 0);
            setSepia(state.settings.sepia || 0);
            setBlur(state.settings.blur || 0);
            setHueRotate(state.settings.hueRotate || 0);
            setFlipH(state.settings.flipH || false);
            setFlipV(state.settings.flipV || false);
            setResizeWidth(state.settings.resizeWidth || "");
            setResizeHeight(state.settings.resizeHeight || "");
            setLockAspectRatio(state.settings.lockAspectRatio !== undefined ? state.settings.lockAspectRatio : true);
            setSharpness(state.settings.sharpness || 0);
            setExposure(state.settings.exposure !== undefined ? state.settings.exposure : 1);
            setRedBalance(state.settings.redBalance !== undefined ? state.settings.redBalance : 1);
            setGreenBalance(state.settings.greenBalance !== undefined ? state.settings.greenBalance : 1);
            setBlueBalance(state.settings.blueBalance !== undefined ? state.settings.blueBalance : 1);
            
            // Retouching
            setSkinSmoothing(state.settings.skinSmoothing || 0);
            setTeethWhitening(state.settings.teethWhitening || 0);
            setFaceSlimming(state.settings.faceSlimming || 0);
            setEyeEnhancement(state.settings.eyeEnhancement || 0);
            return;
          } catch (err) {
            console.error("Failed to load image from DB, fallback to network", err);
          }
        }
      }

      if (imageSrc && (imageSrc.startsWith("http://") || imageSrc.startsWith("https://"))) {
        fetch(imageSrc, { mode: "cors" })
          .then((res) => res.blob())
          .then((blob) => {
            const localUrl = URL.createObjectURL(blob);
            setCurrentImageSrc(localUrl);
          })
          .catch((err) => {
            console.error("Failed to fetch image with CORS, fallback to original URL", err);
            setCurrentImageSrc(imageSrc);
          });
      } else {
        setCurrentImageSrc(imageSrc);
      }
    }
    initImage();
  }, [imageSrc, imageKey]);

  // Curves Point Mapping Utility
  const mapValue = (val: number, points: { x: number; y: number }[]): number => {
    const sorted = [...points].sort((a, b) => a.x - b.x);
    if (val <= sorted[0].x) return sorted[0].y;
    if (val >= sorted[sorted.length - 1].x) return sorted[sorted.length - 1].y;
    for (let i = 0; i < sorted.length - 1; i++) {
      const p1 = sorted[i];
      const p2 = sorted[i + 1];
      if (val >= p1.x && val <= p2.x) {
        const ratio = (val - p1.x) / (p2.x - p1.x);
        return p1.y + ratio * (p2.y - p1.y);
      }
    }
    return val;
  };

  // Channel Lookup Table Generator (Curves + Lift Gamma Gain)
  const getChannelLUT = (channel: 'r' | 'g' | 'b') => {
    let lift = 0;
    let gamma = 0;
    let gain = 0;

    if (channel === 'r') {
      lift = shadowsR;
      gamma = midtonesR;
      gain = highlightsR;
    } else if (channel === 'g') {
      lift = shadowsG;
      gamma = midtonesG;
      gain = highlightsG;
    } else {
      lift = shadowsB;
      gamma = midtonesB;
      gain = highlightsB;
    }

    const samples = 16;
    const table: string[] = [];
    for (let i = 0; i < samples; i++) {
      const x = i / (samples - 1);
      const inputVal = x * 255;
      
      // 1. Apply Curves
      const y = mapValue(inputVal, curvesPoints) / 255;
      
      // 2. Apply Lift (Shadows)
      const liftOffset = (lift / 100) * (1 - y);
      
      // 3. Apply Gain (Highlights)
      const gainOffset = (gain / 100) * y;
      
      // 4. Apply Gamma (Midtones)
      const gammaOffset = (gamma / 100) * Math.sin(Math.PI * y);
      
      let finalVal = y + liftOffset + gainOffset + gammaOffset;
      finalVal = Math.max(0, Math.min(1, finalVal));
      table.push(finalVal.toFixed(3));
    }
    return table.join(" ");
  };



  // Function to rotate image by 90 degrees
  const handleRotate = (direction: "left" | "right") => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageSrc;
    img.onload = () => {
      canvas.width = img.height;
      canvas.height = img.width;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((direction === "right" ? 90 : -90) * (Math.PI / 180));
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        setCurrentImageSrc(canvas.toDataURL("image/jpeg"));
      }
    };
  };

  const handleWidthChange = (val: string) => {
    setResizeWidth(val);
    if (lockAspectRatio && val) {
      const w = parseFloat(val);
      if (!isNaN(w)) {
        const useCrop = mode !== "filter" && cropData;
        const baseW = useCrop ? cropData.width : 500;
        const baseH = useCrop ? cropData.height : 500;
        const ratio = baseH / baseW;
        setResizeHeight(Math.round(w * ratio).toString());
      }
    }
  };

  const handleHeightChange = (val: string) => {
    setResizeHeight(val);
    if (lockAspectRatio && val) {
      const h = parseFloat(val);
      if (!isNaN(h)) {
        const useCrop = mode !== "filter" && cropData;
        const baseW = useCrop ? cropData.width : 500;
        const baseH = useCrop ? cropData.height : 500;
        const ratio = baseW / baseH;
        setResizeWidth(Math.round(h * ratio).toString());
      }
    }
  };

  const handleConfirm = () => {
    if (!currentImageSrc) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageSrc;

    img.onload = async () => {
      const useCrop = mode !== "filter" && cropData;
      let targetWidth = useCrop ? cropData.width : img.width;
      let targetHeight = useCrop ? cropData.height : img.height;

      // Apply resize if specified
      const rW = parseFloat(resizeWidth);
      const rH = parseFloat(resizeHeight);
      if (!isNaN(rW) && rW > 0) {
        targetWidth = rW;
      }
      if (!isNaN(rH) && rH > 0) {
        targetHeight = rH;
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply CSS and SVG filters to the canvas before drawing
        const svgFiltersArr = [];
        if (sharpness !== 0) svgFiltersArr.push("url(#sharpen-filter)");
        if (redBalance !== 1 || greenBalance !== 1 || blueBalance !== 1) svgFiltersArr.push("url(#color-balance-filter)");
        if (exposure !== 1) svgFiltersArr.push("url(#exposure-filter)");
        if (skinSmoothing > 0) svgFiltersArr.push("url(#soft-focus-filter)");
        if (teethWhitening > 0) svgFiltersArr.push("url(#teeth-whitening-filter)");
        if (eyeEnhancement > 0) svgFiltersArr.push("url(#eye-enhancement-filter)");
        if (shadowsR !== 0 || midtonesR !== 0 || highlightsR !== 0 || curvesPoints.length > 3) svgFiltersArr.push("url(#curves-filter-r)");
        if (shadowsG !== 0 || midtonesG !== 0 || highlightsG !== 0 || curvesPoints.length > 3) svgFiltersArr.push("url(#curves-filter-g)");
        if (shadowsB !== 0 || midtonesB !== 0 || highlightsB !== 0 || curvesPoints.length > 3) svgFiltersArr.push("url(#curves-filter-b)");
        if (creativeBlur > 0) svgFiltersArr.push("url(#creative-blur-filter)");
        if (presetFilter === 'cartoon') svgFiltersArr.push("url(#cartoon-filter)");
        if (presetFilter === 'sketch') svgFiltersArr.push("url(#sketch-filter)");
        const svgFilters = svgFiltersArr.join(" ");
        
        const presetCSS = (() => {
          switch (presetFilter) {
            case "vivid": return "saturate(140%) contrast(110%)";
            case "vintage": return "sepia(40%) contrast(85%) hue-rotate(-10deg) saturate(90%)";
            case "bw": return "grayscale(100%) contrast(110%)";
            case "hdr": return "saturate(120%) contrast(115%) brightness(105%)";
            default: return "";
          }
        })();

        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blur}px) hue-rotate(${hueRotate}deg) ${presetCSS} ${svgFilters}`;
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        // Face slimming is applied horizontally
        ctx.scale((1 - faceSlimming * 0.001) * (flipH ? -1 : 1), flipV ? -1 : 1);

        ctx.drawImage(
          img,
          useCrop ? cropData.x : 0,
          useCrop ? cropData.y : 0,
          useCrop ? cropData.width : img.width,
          useCrop ? cropData.height : img.height,
          -canvas.width / 2,
          -canvas.height / 2,
          canvas.width,
          canvas.height
        );

        // Save original blob and settings to DB if imageKey is provided
        if (imageKey) {
          try {
            const response = await fetch(currentImageSrc);
            const originalBlob = await response.blob();
            const settings = {
              brightness, contrast, saturation, grayscale, sepia: 0, blur: 0, hueRotate,
              zoom, flipH, flipV, resizeWidth, resizeHeight, lockAspectRatio,
              sharpness, exposure, redBalance, greenBalance, blueBalance,
              skinSmoothing, teethWhitening, faceSlimming, eyeEnhancement,
              presetFilter, creativeBlur, curvesPoints,
              shadowsR, shadowsG, shadowsB, midtonesR, midtonesG, midtonesB, highlightsR, highlightsG, highlightsB
            };
            await saveImageState(imageKey, originalBlob, settings);
          } catch (dbErr) {
            console.error("Failed to save state to IndexedDB:", dbErr);
          }
        }

        canvas.toBlob((blob) => {
          if (blob) onConfirm(blob);
        }, "image/jpeg", 0.9);
      }
    };
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (activeTool !== "retouch" || !isBlemishBrushActive) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const imgElement = e.currentTarget;
    const clickX = ((e.clientX - rect.left) / rect.width) * imgElement.naturalWidth;
    const clickY = ((e.clientY - rect.top) / rect.height) * imgElement.naturalHeight;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = currentImageSrc;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);

        // Healing patch: copy from 20px to the left of the click
        const radius = 12;
        ctx.save();
        ctx.beginPath();
        ctx.arc(clickX, clickY, radius, 0, Math.PI * 2);
        ctx.clip();
        
        ctx.drawImage(
          img,
          clickX - radius - 20, clickY - radius, radius * 2, radius * 2,
          clickX - radius, clickY - radius, radius * 2, radius * 2
        );
        ctx.restore();

        setCurrentImageSrc(canvas.toDataURL("image/jpeg"));
        toast.success("Blemish removed!");
      }
    };
  };

  const presetCSS = (() => {
    switch (presetFilter) {
      case "vivid": return "saturate(140%) contrast(110%)";
      case "vintage": return "sepia(40%) contrast(85%) hue-rotate(-10deg) saturate(90%)";
      case "bw": return "grayscale(100%) contrast(110%)";
      case "hdr": return "saturate(120%) contrast(115%) brightness(105%)";
      default: return "";
    }
  })();

  const svgFiltersArr = [];
  if (sharpness !== 0) svgFiltersArr.push("url(#sharpen-filter)");
  if (redBalance !== 1 || greenBalance !== 1 || blueBalance !== 1) svgFiltersArr.push("url(#color-balance-filter)");
  if (exposure !== 1) svgFiltersArr.push("url(#exposure-filter)");
  if (skinSmoothing > 0) svgFiltersArr.push("url(#soft-focus-filter)");
  if (teethWhitening > 0) svgFiltersArr.push("url(#teeth-whitening-filter)");
  if (eyeEnhancement > 0) svgFiltersArr.push("url(#eye-enhancement-filter)");
  if (shadowsR !== 0 || midtonesR !== 0 || highlightsR !== 0 || curvesPoints.length > 3) svgFiltersArr.push("url(#curves-filter-r)");
  if (shadowsG !== 0 || midtonesG !== 0 || highlightsG !== 0 || curvesPoints.length > 3) svgFiltersArr.push("url(#curves-filter-g)");
  if (shadowsB !== 0 || midtonesB !== 0 || highlightsB !== 0 || curvesPoints.length > 3) svgFiltersArr.push("url(#curves-filter-b)");
  if (creativeBlur > 0) svgFiltersArr.push("url(#creative-blur-filter)");
  if (presetFilter === 'cartoon') svgFiltersArr.push("url(#cartoon-filter)");
  if (presetFilter === 'sketch') svgFiltersArr.push("url(#sketch-filter)");
  const svgFiltersStr = svgFiltersArr.join(" ");

  const filterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) blur(${blur}px) hue-rotate(${hueRotate}deg) ${presetCSS} ${svgFiltersStr}`.trim(),
    transform: `scale(${(1 - faceSlimming * 0.001) * (flipH ? -1 : 1)}, ${flipV ? -1 : 1})`,
  };



  return (
    <div className={
      fullScreen 
        ? "fixed inset-0 z-[100] bg-zinc-950 text-zinc-100 flex flex-col overflow-hidden w-full h-full"
        : "flex flex-col gap-3 w-full bg-zinc-900 text-zinc-100 p-4 rounded-2xl border border-zinc-800 shadow-xl max-h-[90vh] overflow-hidden"
    }>
      {/* Header bar */}
      <div className="flex justify-between items-center px-4 py-3 bg-zinc-900/90 border-b border-zinc-800 shrink-0">
        <h3 className="text-sm font-bold tracking-wide text-zinc-300 uppercase">{title}</h3>
        <div className="flex items-center gap-2">
          {hasMoreInQueue && onApplyToAll && (
            <Button
              variant="outline"
              size="sm"
              className="border-zinc-700 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-white"
              onClick={() => {
                const settings = {
                  brightness, contrast, saturation, grayscale, sepia, blur, hueRotate,
                  zoom, flipH, flipV, resizeWidth, resizeHeight, lockAspectRatio,
                  sharpness, exposure, redBalance, greenBalance, blueBalance,
                  skinSmoothing, teethWhitening, faceSlimming, eyeEnhancement,
                  presetFilter, creativeBlur, curvesPoints,
                  shadowsR, shadowsG, shadowsB, midtonesR, midtonesG, midtonesB, highlightsR, highlightsG, highlightsB
                };
                onApplyToAll(settings);
              }}
              disabled={isUploading}
            >
              Apply to All
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-xs text-zinc-400 hover:text-white" onClick={onCancel} disabled={isUploading}>
            Cancel
          </Button>
          <Button size="sm" className="bg-primary text-xs font-semibold px-4 rounded-full text-white" onClick={handleConfirm} disabled={isUploading}>
            {isUploading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
      
      {/* Main Image Viewport */}
      <div className="flex-1 relative bg-zinc-950 flex items-center justify-center p-2 min-h-0 overflow-hidden">
        {mode === "filter" ? (
          <img 
            src={currentImageSrc} 
            style={filterStyle} 
            className={`max-w-full max-h-full object-contain select-none ${isBlemishBrushActive ? 'cursor-crosshair border border-dashed border-primary/50' : ''}`} 
            onClick={handleImageClick}
            alt="Preview"
          />
        ) : (
          <Cropper
            className="w-full h-full"
            image={currentImageSrc}
            aspectRatio={aspectRatio}
            zoom={zoom}
            onZoomChange={setZoom}
            onCropChange={(area) => {
              setCropData((prev: any) => {
                if (
                  !prev ||
                  prev.x !== area?.x ||
                  prev.y !== area?.y ||
                  prev.width !== area?.width ||
                  prev.height !== area?.height
                ) {
                  return area;
                }
                return prev;
              });
            }}
          >
            <CropperDescription />
            <div style={filterStyle} className="w-full h-full">
              <CropperImage />
            </div>
            <CropperCropArea className="rounded-md border-primary/40" />
          </Cropper>
        )}
      </div>

      {/* Bottom Control Bar */}
      <div className="shrink-0 bg-zinc-900 border-t border-zinc-800 flex flex-col w-full z-10">
        <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-none justify-start md:justify-center bg-zinc-950/80 border-b border-zinc-800">
          {mode !== "filter" && (
            <>
              <button
                onClick={() => { setActiveTool(activeTool === "zoom" ? null : "zoom"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "zoom" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ZoomIn className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Zoom</span>
              </button>
              <button
                onClick={() => { setActiveTool(activeTool === "rotate" ? null : "rotate"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "rotate" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <RotateCw className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Rotate</span>
              </button>
              <button
                onClick={() => { setActiveTool(activeTool === "resize" ? null : "resize"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "resize" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Scaling className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Resize</span>
              </button>
            </>
          )}
          {mode !== "crop" && (
            <>
              <button
                onClick={() => { setActiveTool(activeTool === "color" ? null : "color"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "color" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sun className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Adjust</span>
              </button>
              <button
                onClick={() => { setActiveTool(activeTool === "curves" ? null : "curves"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "curves" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sliders className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Curves</span>
              </button>
              <button
                onClick={() => { setActiveTool(activeTool === "grading" ? null : "grading"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "grading" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <PaintBucket className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Grading</span>
              </button>
              <button
                onClick={() => { setActiveTool(activeTool === "presets" ? null : "presets"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "presets" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <ImageIcon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Presets</span>
              </button>
              <button
                onClick={() => { setActiveTool(activeTool === "retouch" ? null : "retouch"); setIsBlemishBrushActive(false); }}
                className={`flex flex-col items-center justify-center min-w-[70px] py-1 px-2 rounded-xl transition-all ${
                  activeTool === "retouch" ? "text-primary bg-zinc-800/60" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Sparkles className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">Retouch</span>
              </button>
            </>
          )}
        </div>

        {activeTool && (
          <div className="p-4 bg-zinc-900 text-zinc-100 max-h-[38vh] overflow-y-auto custom-scrollbar border-t border-zinc-800">
          {activeTool === "zoom" && mode !== "filter" && (
            <div className="space-y-2 max-w-md mx-auto">
              <label className="text-sm font-medium flex items-center gap-2">
                <ZoomIn className="w-4 h-4" /> Zoom ({Math.round(zoom * 100)}%)
              </label>
              <input 
                type="range" min="1" max="3" step="0.1" 
                value={zoom} 
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          )}

          {activeTool === "rotate" && mode !== "filter" && (
            <div className="space-y-4 max-w-md mx-auto text-center">
              <div className="space-y-2">
                <label className="text-sm font-medium block">Rotate Image</label>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" size="sm" onClick={() => handleRotate("left")} className="px-6 rounded-full flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" /> Left
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleRotate("right")} className="px-6 rounded-full flex-1">
                    <RotateCw className="w-4 h-4 mr-2" /> Right
                  </Button>
                </div>
              </div>
              <div className="space-y-2 border-t pt-3">
                <label className="text-sm font-medium block">Flip Image</label>
                <div className="flex gap-4 justify-center">
                  <Button 
                    variant={flipH ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setFlipH(!flipH)} 
                    className="px-4 rounded-full flex-1"
                  >
                    <FlipHorizontal className="w-4 h-4 mr-2" /> Horizontal
                  </Button>
                  <Button 
                    variant={flipV ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setFlipV(!flipV)} 
                    className="px-4 rounded-full flex-1"
                  >
                    <FlipVertical className="w-4 h-4 mr-2" /> Vertical
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTool === "resize" && mode !== "filter" && (
            <div className="space-y-4 max-w-sm mx-auto">
              <label className="text-sm font-medium block text-center">Resize Image (Dimensions in pixels)</label>
              
              {/* Quick Presets */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground block text-center">Quick Size Presets</label>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {[
                    { label: "Original", w: "", h: "" },
                    { label: "Full HD (1080p)", w: "1920", h: "1080" },
                    { label: "HD (720p)", w: "1280", h: "720" },
                    { label: "1:1 Square", w: "800", h: "800" },
                    { label: "Avatar", w: "300", h: "300" },
                  ].map((preset, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setResizeWidth(preset.w);
                        setResizeHeight(preset.h);
                      }}
                      className="text-[10px] h-7 px-2 rounded-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 items-center border-t border-zinc-800/60 pt-3">
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-zinc-400">Width (px)</label>
                  <input 
                    type="number" 
                    placeholder="Auto"
                    value={resizeWidth} 
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full p-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm text-zinc-100"
                  />
                </div>
                <span className="text-zinc-500 mt-5">x</span>
                <div className="flex-1 space-y-1">
                  <label className="text-xs text-zinc-400">Height (px)</label>
                  <input 
                    type="number" 
                    placeholder="Auto"
                    value={resizeHeight} 
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full p-2 border border-zinc-700 rounded-md bg-zinc-800 text-sm text-zinc-100"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs justify-center pt-2">
                <input 
                  type="checkbox" 
                  checked={lockAspectRatio} 
                  onChange={(e) => setLockAspectRatio(e.target.checked)}
                  className="rounded text-primary focus:ring-primary accent-primary"
                />
                <span>Lock Aspect Ratio</span>
              </label>
            </div>
          )}

          {activeTool === "color" && mode !== "crop" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto text-sm">
              {/* Exposure */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <SunDim className="w-3 h-3" /> Exposure ({Math.round(exposure * 100)}%)
                </label>
                <input 
                  type="range" min="0.5" max="2.0" step="0.05" 
                  value={exposure} 
                  onChange={(e) => setExposure(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <Sun className="w-3 h-3" /> Brightness ({brightness}%)
                </label>
                <input 
                  type="range" min="50" max="150" step="1" 
                  value={brightness} 
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <Contrast className="w-3 h-3" /> Contrast ({contrast}%)
                </label>
                <input 
                  type="range" min="50" max="150" step="1" 
                  value={contrast} 
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <Droplet className="w-3 h-3" /> Saturation ({saturation}%)
                </label>
                <input 
                  type="range" min="0" max="200" step="1" 
                  value={saturation} 
                  onChange={(e) => setSaturation(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>

              {/* Sharpness */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> Sharpness ({Math.round(sharpness * 100)}%)
                </label>
                <input 
                  type="range" min="0" max="2" step="0.1" 
                  value={sharpness} 
                  onChange={(e) => setSharpness(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>

              {/* Grayscale */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <ImageIcon className="w-3 h-3" /> Grayscale ({grayscale}%)
                </label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={grayscale} 
                  onChange={(e) => setGrayscale(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>

              {/* Hue Rotate */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <PaintBucket className="w-3 h-3" /> Hue Rotate ({hueRotate}°)
                </label>
                <input 
                  type="range" min="0" max="360" step="1" 
                  value={hueRotate} 
                  onChange={(e) => setHueRotate(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>

              {/* Color Balance section */}
              <div className="space-y-2 md:col-span-2 border-t pt-3 mt-1">
                <label className="text-xs font-bold flex items-center gap-2">
                  <Sliders className="w-3 h-3" /> Color Balance
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-red-500 font-medium">Red ({Math.round(redBalance * 100)}%)</label>
                    <input 
                      type="range" min="0.5" max="1.5" step="0.05" 
                      value={redBalance} 
                      onChange={(e) => setRedBalance(parseFloat(e.target.value))}
                      className="w-full accent-red-500 h-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-green-500 font-medium">Green ({Math.round(greenBalance * 100)}%)</label>
                    <input 
                      type="range" min="0.5" max="1.5" step="0.05" 
                      value={greenBalance} 
                      onChange={(e) => setGreenBalance(parseFloat(e.target.value))}
                      className="w-full accent-green-500 h-1"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-blue-500 font-medium">Blue ({Math.round(blueBalance * 100)}%)</label>
                    <input 
                      type="range" min="0.5" max="1.5" step="0.05" 
                      value={blueBalance} 
                      onChange={(e) => setBlueBalance(parseFloat(e.target.value))}
                      className="w-full accent-blue-500 h-1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTool === "retouch" && mode !== "crop" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto text-sm">
              {/* Skin Smoothing */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-pink-500" /> Skin Smoothing / Wrinkles ({skinSmoothing}%)
                </label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={skinSmoothing} 
                  onChange={(e) => setSkinSmoothing(parseInt(e.target.value))}
                  className="w-full accent-pink-500 h-1.5"
                />
              </div>

              {/* Teeth Whitening */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <Sun className="w-3 h-3 text-blue-400" /> Teeth Whitening ({teethWhitening}%)
                </label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={teethWhitening} 
                  onChange={(e) => setTeethWhitening(parseInt(e.target.value))}
                  className="w-full accent-blue-400 h-1.5"
                />
              </div>

              {/* Eye Enhancement */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <ZoomIn className="w-3 h-3 text-indigo-400" /> Eye Enhancement ({eyeEnhancement}%)
                </label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={eyeEnhancement} 
                  onChange={(e) => setEyeEnhancement(parseInt(e.target.value))}
                  className="w-full accent-indigo-400 h-1.5"
                />
              </div>

              {/* Face Slimming */}
              <div className="space-y-1">
                <label className="text-xs font-medium flex items-center gap-2">
                  <Scaling className="w-3 h-3 text-purple-400" /> Face Slimming ({faceSlimming}%)
                </label>
                <input 
                  type="range" min="0" max="100" step="1" 
                  value={faceSlimming} 
                  onChange={(e) => setFaceSlimming(parseInt(e.target.value))}
                  className="w-full accent-purple-400 h-1.5"
                />
              </div>

              {/* Interactive Blemish / Acne Healing Brush */}
              <div className="md:col-span-2 border-t pt-4 mt-2 flex flex-col items-center gap-2 text-center bg-muted/20 p-3 rounded-lg border">
                <label className="text-xs font-bold block text-primary">Blemish, Acne & Pimple Removal Brush</label>
                <p className="text-[11px] text-muted-foreground max-w-md">
                  Enable the brush and click directly on any spots, acne, pimples, or wrinkles in the image preview above to instantly remove them.
                </p>
                {mode !== "filter" ? (
                  <p className="text-[11px] text-amber-500 font-semibold mt-1">
                    Note: Switch to &quot;Filter&quot; mode (or complete cropping) to click and heal blemishes.
                  </p>
                ) : (
                  <Button 
                    variant={isBlemishBrushActive ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => setIsBlemishBrushActive(!isBlemishBrushActive)}
                    className="rounded-full mt-2"
                  >
                    {isBlemishBrushActive ? "Deactivate Acne Brush" : "Activate Acne Brush"}
                  </Button>
                )}
              </div>
            </div>
          )}

          {activeTool === "curves" && mode !== "crop" && (
            <div className="max-w-md mx-auto space-y-4 text-center">
              <label className="text-sm font-bold block text-primary">Tone Curve (Click to add points, drag to adjust)</label>
              <div className="flex justify-center">
                <svg 
                  width="200" 
                  height="200" 
                  className="border rounded bg-muted/40 cursor-crosshair overflow-visible touch-none"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = Math.max(0, Math.min(255, Math.round(((e.clientX - rect.left) / 200) * 255)));
                    const y = Math.max(0, Math.min(255, Math.round((1 - (e.clientY - rect.top) / 200) * 255)));
                    
                    if (curvesPoints.some(p => Math.abs(p.x - x) < 15)) return;
                    setCurvesPoints([...curvesPoints, { x, y }].sort((a,b) => a.x - b.x));
                  }}
                >
                  <line x1="50" y1="0" x2="50" y2="200" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="100" y1="0" x2="100" y2="200" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="150" y1="0" x2="150" y2="200" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="0" y1="100" x2="200" y2="100" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="0" y1="150" x2="200" y2="150" stroke="currentColor" strokeOpacity="0.1" />
                  <line x1="0" y1="200" x2="200" y2="0" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  <path
                    d={
                      [...curvesPoints].sort((a,b) => a.x - b.x).map((pt, idx) => {
                        const px = (pt.x / 255) * 200;
                        const py = (1 - pt.y / 255) * 200;
                        return `${idx === 0 ? 'M' : 'L'} ${px} ${py}`;
                      }).join(" ")
                    }
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                  />
                  
                  {curvesPoints.map((pt, idx) => {
                    const px = (pt.x / 255) * 200;
                    const py = (1 - pt.y / 255) * 200;
                    return (
                      <circle
                        key={idx}
                        cx={px}
                        cy={py}
                        r={idx === 0 || idx === curvesPoints.length - 1 ? 5 : 6}
                        fill={idx === 0 || idx === curvesPoints.length - 1 ? "gray" : "var(--primary)"}
                        className="cursor-pointer hover:scale-125 transition-transform"                         onMouseDown={(downEvent) => {
                          downEvent.stopPropagation();
                          if (idx === 0 || idx === curvesPoints.length - 1) return;
                          
                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            const rect = (downEvent.target as any).parentNode.getBoundingClientRect();
                            const nx = Math.max(1, Math.min(254, Math.round(((moveEvent.clientX - rect.left) / 200) * 255)));
                            const ny = Math.max(0, Math.min(255, Math.round((1 - (moveEvent.clientY - rect.top) / 200) * 255)));
                            
                            setCurvesPoints(prev => {
                              const copy = [...prev];
                              copy[idx] = { x: nx, y: ny };
                              return copy.sort((a,b) => a.x - b.x);
                            });
                          };
                          
                          const handleMouseUp = () => {
                            window.removeEventListener("mousemove", handleMouseMove);
                            window.removeEventListener("mouseup", handleMouseUp);
                          };
                          
                          window.addEventListener("mousemove", handleMouseMove);
                          window.addEventListener("mouseup", handleMouseUp);
                        }}
                        onTouchStart={(downEvent) => {
                          downEvent.stopPropagation();
                          if (idx === 0 || idx === curvesPoints.length - 1) return;
                          
                          const handleTouchMove = (moveEvent: TouchEvent) => {
                            const rect = (downEvent.target as any).parentNode.getBoundingClientRect();
                            const nx = Math.max(1, Math.min(254, Math.round(((moveEvent.touches[0].clientX - rect.left) / 200) * 255)));
                            const ny = Math.max(0, Math.min(255, Math.round((1 - (moveEvent.touches[0].clientY - rect.top) / 200) * 255)));
                            
                            setCurvesPoints(prev => {
                              const copy = [...prev];
                              copy[idx] = { x: nx, y: ny };
                              return copy.sort((a,b) => a.x - b.x);
                            });
                          };
                          
                          const handleTouchEnd = () => {
                            window.removeEventListener("touchmove", handleTouchMove);
                            window.removeEventListener("touchend", handleTouchEnd);
                          };
                          
                          window.addEventListener("touchmove", handleTouchMove, { passive: false });
                          window.addEventListener("touchend", handleTouchEnd);
                        }}
                        onDoubleClick={(dbEvent) => {
                          dbEvent.stopPropagation();
                          if (idx === 0 || idx === curvesPoints.length - 1) return;
                          setCurvesPoints(curvesPoints.filter((_, i) => i !== idx));
                        }}
                      />
                    );
                  })}
                </svg>
              </div>
              <p className="text-[10px] text-muted-foreground">Double-click grid to add control point. Drag to adjust. Double-click points to remove.</p>
              <Button size="sm" variant="outline" onClick={() => setCurvesPoints([{ x: 0, y: 0 }, { x: 128, y: 128 }, { x: 255, y: 255 }])}>
                Reset Curve
              </Button>
            </div>
          )}

          {activeTool === "grading" && mode !== "crop" && (
            <div className="space-y-4 max-w-2xl mx-auto text-sm">
              <label className="text-sm font-bold block text-primary text-center mb-2">Color Grading (Lift, Gamma, Gain)</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                  <span className="font-semibold text-xs block border-b pb-1 text-indigo-400">Shadows (Lift)</span>
                  <div className="space-y-1">
                    <label className="text-[10px] text-red-400 font-medium">Red ({shadowsR}%)</label>
                    <input type="range" min="-50" max="50" value={shadowsR} onChange={(e) => setShadowsR(parseInt(e.target.value))} className="w-full accent-red-500 h-1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-green-400 font-medium">Green ({shadowsG}%)</label>
                    <input type="range" min="-50" max="50" value={shadowsG} onChange={(e) => setShadowsG(parseInt(e.target.value))} className="w-full accent-green-500 h-1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-blue-400 font-medium">Blue ({shadowsB}%)</label>
                    <input type="range" min="-50" max="50" value={shadowsB} onChange={(e) => setShadowsB(parseInt(e.target.value))} className="w-full accent-blue-500 h-1" />
                  </div>
                </div>

                <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                  <span className="font-semibold text-xs block border-b pb-1 text-amber-400">Midtones (Gamma)</span>
                  <div className="space-y-1">
                    <label className="text-[10px] text-red-400 font-medium">Red ({midtonesR}%)</label>
                    <input type="range" min="-50" max="50" value={midtonesR} onChange={(e) => setMidtonesR(parseInt(e.target.value))} className="w-full accent-red-500 h-1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-green-400 font-medium">Green ({midtonesG}%)</label>
                    <input type="range" min="-50" max="50" value={midtonesG} onChange={(e) => setMidtonesG(parseInt(e.target.value))} className="w-full accent-green-500 h-1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-blue-400 font-medium">Blue ({midtonesB}%)</label>
                    <input type="range" min="-50" max="50" value={midtonesB} onChange={(e) => setMidtonesB(parseInt(e.target.value))} className="w-full accent-blue-500 h-1" />
                  </div>
                </div>

                <div className="space-y-3 p-3 border rounded-lg bg-muted/20">
                  <span className="font-semibold text-xs block border-b pb-1 text-emerald-400">Highlights (Gain)</span>
                  <div className="space-y-1">
                    <label className="text-[10px] text-red-400 font-medium">Red ({highlightsR}%)</label>
                    <input type="range" min="-50" max="50" value={highlightsR} onChange={(e) => setHighlightsR(parseInt(e.target.value))} className="w-full accent-red-500 h-1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-green-400 font-medium">Green ({highlightsG}%)</label>
                    <input type="range" min="-50" max="50" value={highlightsG} onChange={(e) => setHighlightsG(parseInt(e.target.value))} className="w-full accent-green-500 h-1" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-blue-400 font-medium">Blue ({highlightsB}%)</label>
                    <input type="range" min="-50" max="50" value={highlightsB} onChange={(e) => setHighlightsB(parseInt(e.target.value))} className="w-full accent-blue-500 h-1" />
                  </div>
                </div>
              </div>
              <div className="text-center pt-2">
                <Button size="sm" variant="outline" onClick={() => {
                  setShadowsR(0); setShadowsG(0); setShadowsB(0);
                  setMidtonesR(0); setMidtonesG(0); setMidtonesB(0);
                  setHighlightsR(0); setHighlightsG(0); setHighlightsB(0);
                }}>
                  Reset Color Grading
                </Button>
              </div>
            </div>
          )}

          {activeTool === "presets" && mode !== "crop" && (
            <div className="space-y-4 max-w-2xl mx-auto text-sm">
              <label className="text-sm font-bold block text-primary text-center">Select Preset Filter & Dynamic Effects</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { id: "normal", label: "Normal" },
                  { id: "vivid", label: "Vivid" },
                  { id: "vintage", label: "Vintage" },
                  { id: "bw", label: "Black & White" },
                  { id: "hdr", label: "HDR Effect" },
                  { id: "cartoon", label: "Cartoon" },
                  { id: "sketch", label: "Charcoal Sketch" },
                ].map((preset) => (
                  <Button
                    key={preset.id}
                    variant={presetFilter === preset.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPresetFilter(preset.id as any)}
                    className="rounded-xl py-4"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              
              <div className="border-t pt-4 space-y-2 max-w-md mx-auto">
                <label className="text-xs font-semibold flex items-center gap-2">
                  Creative Blur Amount ({creativeBlur}px)
                </label>
                <input
                  type="range" min="0" max="50" step="1"
                  value={creativeBlur}
                  onChange={(e) => setCreativeBlur(parseInt(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Dynamic SVG Filters */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="sharpen-filter">
          <feConvolveMatrix 
            order="3" 
            kernelMatrix={`0 -${sharpness} 0 -${sharpness} ${1 + 4 * sharpness} -${sharpness} 0 -${sharpness} 0`} 
          />
        </filter>
        <filter id="color-balance-filter">
          <feColorMatrix 
            type="matrix" 
            values={`
              ${redBalance} 0 0 0 0
              0 ${greenBalance} 0 0 0
              0 0 ${blueBalance} 0 0
              0 0 0 1 0
            `} 
          />
        </filter>
        <filter id="exposure-filter">
          <feComponentTransfer>
            <feFuncR type="linear" slope={exposure} />
            <feFuncG type="linear" slope={exposure} />
            <feFuncB type="linear" slope={exposure} />
          </feComponentTransfer>
        </filter>
        <filter id="soft-focus-filter">
          <feGaussianBlur stdDeviation={skinSmoothing * 0.12} result="blur" />
          <feColorMatrix type="matrix" values={`
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0
            0 0 0 ${skinSmoothing * 0.004} 0`} in="blur" result="glow" />
          <feBlend mode="screen" in="SourceGraphic" in2="glow" />
        </filter>
        <filter id="teeth-whitening-filter">
          <feColorMatrix type="matrix" values={`
            1 0 0 0 0
            0 1 0 0 0
            -${teethWhitening * 0.003} -${teethWhitening * 0.003} 1 0 0
            0 0 0 1 0
          `} />
        </filter>
        <filter id="eye-enhancement-filter">
          <feComponentTransfer>
            <feFuncR type="linear" slope={1 + eyeEnhancement * 0.0015} />
            <feFuncG type="linear" slope={1 + eyeEnhancement * 0.0015} />
            <feFuncB type="linear" slope={1 + eyeEnhancement * 0.0015} />
          </feComponentTransfer>
        </filter>
        
        {/* Dynamic Curves + Color Grading LUT Filters */}
        <filter id="curves-filter-r">
          <feComponentTransfer>
            <feFuncR type="table" tableValues={getChannelLUT('r')} />
          </feComponentTransfer>
        </filter>
        <filter id="curves-filter-g">
          <feComponentTransfer>
            <feFuncG type="table" tableValues={getChannelLUT('g')} />
          </feComponentTransfer>
        </filter>
        <filter id="curves-filter-b">
          <feComponentTransfer>
            <feFuncB type="table" tableValues={getChannelLUT('b')} />
          </feComponentTransfer>
        </filter>

        {/* Creative Blur Filter */}
        <filter id="creative-blur-filter">
          <feGaussianBlur stdDeviation={creativeBlur} />
        </filter>

        {/* Cartoon Cell-Shading Filter */}
        <filter id="cartoon-filter">
          <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" result="edges" />
          <feComponentTransfer in="SourceGraphic" result="posterized">
            <feFuncR type="discrete" tableValues="0 0.25 0.5 0.75 1.0" />
            <feFuncG type="discrete" tableValues="0 0.25 0.5 0.75 1.0" />
            <feFuncB type="discrete" tableValues="0 0.25 0.5 0.75 1.0" />
          </feComponentTransfer>
          <feBlend mode="multiply" in="edges" in2="posterized" />
        </filter>

        {/* Charcoal Sketch Outline Filter */}
        <filter id="sketch-filter">
          <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0" />
          <feConvolveMatrix order="3" kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1" bias="1" />
          <feComponentTransfer>
            <feFuncR type="linear" slope="-1" intercept="1" />
            <feFuncG type="linear" slope="-1" intercept="1" />
            <feFuncB type="linear" slope="-1" intercept="1" />
          </feComponentTransfer>
        </filter>
      </svg>

    </div>
  );
}
