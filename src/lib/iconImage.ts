import { renderToStaticMarkup } from "react-dom/server";
import { iconSvgString } from "@/components/ui/Icons";

const cache = new Map<string, HTMLImageElement>();

/** Cartoon icon as an <img> (for drawing on canvas). Returns null on the server / unknown icon. */
export function getIconImage(n: string): HTMLImageElement | null {
  if (typeof window === "undefined") return null;
  const hit = cache.get(n);
  if (hit) return hit;
  const svg = iconSvgString(n, renderToStaticMarkup);
  if (!svg) return null;
  const img = new Image();
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  cache.set(n, img);
  return img;
}

/** Draw the icon centred at (x, y) with the given pixel size. Returns false if it isn't loaded yet. */
export function drawIcon(ctx: CanvasRenderingContext2D, n: string, x: number, y: number, size: number): boolean {
  const img = getIconImage(n);
  if (!img || !img.complete || img.naturalWidth === 0) return false;
  ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
  return true;
}
