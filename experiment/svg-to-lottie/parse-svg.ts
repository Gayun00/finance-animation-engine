/**
 * SVG Parser for Recraft-generated SVGs
 * Extracts paths, fills (solid + gradient), and viewBox from Recraft SVG output.
 */

export interface SvgGradientStop {
  offset: number;
  color: [number, number, number]; // r,g,b normalized 0-1
  opacity: number;
}

export interface SvgGradient {
  id: string;
  stops: SvgGradientStop[];
}

export interface SvgPath {
  d: string;
  fill: [number, number, number, number]; // r,g,b,a normalized 0-1
  fillRaw: string; // original fill attribute for debugging
}

export interface ParsedSvg {
  viewBox: { x: number; y: number; w: number; h: number };
  gradients: Map<string, SvgGradient>;
  paths: SvgPath[];
}

function parseRgb(raw: string): [number, number, number] {
  const m = raw.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (!m) throw new Error(`Cannot parse rgb: ${raw}`);
  return [Number(m[1]) / 255, Number(m[2]) / 255, Number(m[3]) / 255];
}

function parseViewBox(vb: string): { x: number; y: number; w: number; h: number } {
  const parts = vb.trim().split(/\s+/).map(Number);
  return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

export function parseSvg(svgText: string): ParsedSvg {
  // Parse viewBox
  const vbMatch = svgText.match(/viewBox="([^"]+)"/);
  if (!vbMatch) throw new Error("No viewBox found");
  const viewBox = parseViewBox(vbMatch[1]);

  // Parse gradients
  const gradients = new Map<string, SvgGradient>();
  const gradientRegex = /<linearGradient[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/linearGradient>/g;
  let gMatch: RegExpExecArray | null;
  while ((gMatch = gradientRegex.exec(svgText)) !== null) {
    const id = gMatch[1];
    const body = gMatch[2];
    const stops: SvgGradientStop[] = [];
    const stopRegex = /offset="([^"]*)"[^>]*stop-color="([^"]*)"[^>]*stop-opacity="([^"]*)"/g;
    let sMatch: RegExpExecArray | null;
    while ((sMatch = stopRegex.exec(body)) !== null) {
      stops.push({
        offset: Number(sMatch[1]),
        color: parseRgb(sMatch[2]),
        opacity: Number(sMatch[3]),
      });
    }
    gradients.set(id, { id, stops });
  }

  // Parse paths
  const paths: SvgPath[] = [];
  const pathRegex = /<path\s+d="([^"]+)"[^>]*fill="([^"]+)"[^>]*>/g;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = pathRegex.exec(svgText)) !== null) {
    const d = pMatch[1];
    const fillRaw = pMatch[2];
    let fill: [number, number, number, number];

    if (fillRaw.startsWith("url(#")) {
      // Gradient reference -> use first stop color
      const gradId = fillRaw.match(/url\(#(\w+)\)/)?.[1];
      const grad = gradId ? gradients.get(gradId) : undefined;
      if (grad && grad.stops.length > 0) {
        const [r, g, b] = grad.stops[0].color;
        fill = [r, g, b, grad.stops[0].opacity];
      } else {
        fill = [0.5, 0.5, 0.5, 1]; // fallback gray
      }
    } else if (fillRaw.startsWith("rgb(")) {
      const [r, g, b] = parseRgb(fillRaw);
      fill = [r, g, b, 1];
    } else {
      fill = [0, 0, 0, 1]; // default black
    }

    paths.push({ d, fill, fillRaw });
  }

  return { viewBox, gradients, paths };
}

/**
 * Remove the first path if it's a full-canvas background rectangle.
 * Recraft SVGs typically start with a solid color rect covering the viewBox.
 */
export function stripBackground(parsed: ParsedSvg): ParsedSvg {
  if (parsed.paths.length === 0) return parsed;
  const first = parsed.paths[0];
  // Check if the path is only M/L/Z (no curves) — a simple polygon
  if (/C/i.test(first.d)) return parsed;
  // Check if it covers the full viewBox area (approximate)
  const coords = first.d.match(/[\d.]+/g)?.map(Number) || [];
  const xs = coords.filter((_, i) => i % 2 === 0);
  const ys = coords.filter((_, i) => i % 2 === 1);
  if (xs.length < 3) return parsed;
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const { w, h } = parsed.viewBox;
  // If it spans ≥95% of the viewBox, it's a background
  if ((maxX - minX) >= w * 0.95 && (maxY - minY) >= h * 0.95) {
    return { ...parsed, paths: parsed.paths.slice(1) };
  }
  return parsed;
}
