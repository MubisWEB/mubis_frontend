import { useEffect, useMemo, useRef, useState } from "react";

import { cn } from "@/lib/utils";

type RGB = [number, number, number];

function rgbDistance(a: RGB, b: RGB) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function getSaturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === 0) return 0;
  return (max - min) / max;
}

export type ChromaKeyImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Extra safety: remove very light, low-saturation pixels (good for white/grey/checker backgrounds). */
  threshold?: {
    /** 0..255 */
    minValue: number;
    /** 0..1 */
    maxSaturation: number;
    /** 0..255 */
    maxDistanceToCorners: number;
  };
};

/**
 * Removes near-white / near-grey backgrounds client-side.
 * Useful when assets come with a baked checkerboard/white background.
 */
export default function ChromaKeyImage({
  src,
  alt,
  className,
  threshold,
}: ChromaKeyImageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isReady, setIsReady] = useState(false);

  const t = useMemo(
    () =>
      threshold ?? {
        minValue: 230,
        maxSaturation: 0.18,
        maxDistanceToCorners: 40,
      },
    [threshold],
  );

  useEffect(() => {
    let cancelled = false;

    const img = new Image();
    // local assets are same-origin, but keep this safe if it ever becomes remote
    img.crossOrigin = "anonymous";
    img.decoding = "async";

    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      canvas.width = w;
      canvas.height = h;

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      const sample = (x: number, y: number): RGB => {
        const i = (y * w + x) * 4;
        return [data[i] ?? 0, data[i + 1] ?? 0, data[i + 2] ?? 0];
      };

      const corners: RGB[] = [
        sample(0, 0),
        sample(w - 1, 0),
        sample(0, h - 1),
        sample(w - 1, h - 1),
      ];

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        const a = data[i + 3] ?? 255;
        if (a === 0) continue;

        const value = Math.max(r, g, b);
        const sat = getSaturation(r, g, b);

        // 1) Remove very light, low-saturation pixels
        let isBg = value >= t.minValue && sat <= t.maxSaturation;

        // 2) Also remove pixels close to any corner background sample
        if (!isBg) {
          const p: RGB = [r, g, b];
          let minD = Infinity;
          for (const c of corners) {
            const d = rgbDistance(p, c);
            if (d < minD) minD = d;
          }
          isBg = minD <= t.maxDistanceToCorners;
        }

        if (isBg) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setIsReady(true);
    };

    img.onerror = () => {
      if (cancelled) return;
      setIsReady(false);
    };

    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, t.maxDistanceToCorners, t.maxSaturation, t.minValue]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={alt}
      className={cn(
        "block w-full h-full",
        !isReady && "opacity-0",
        className,
      )}
    />
  );
}
