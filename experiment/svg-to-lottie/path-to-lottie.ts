/**
 * SVG path "d" attribute → Lottie shape ({ v, i, o, c }) converter
 *
 * Supported commands: M, L, C, Z (absolute only — Recraft SVGs use absolute)
 *
 * Lottie shape format:
 *   v: vertex positions [[x,y], ...]
 *   i: in-tangent offsets (relative to vertex) — handle arriving at vertex
 *   o: out-tangent offsets (relative to vertex) — handle leaving vertex
 *   c: closed path boolean
 */

export interface LottieShape {
  v: number[][];
  i: number[][];
  o: number[][];
  c: boolean;
}

interface PathCommand {
  type: "M" | "L" | "C" | "Z";
  args: number[];
}

function tokenize(d: string): PathCommand[] {
  const commands: PathCommand[] = [];
  // Split on command letters, keeping the letter
  const tokens = d.match(/[MLCZmlcz][^MLCZmlcz]*/g);
  if (!tokens) return commands;

  for (const token of tokens) {
    const type = token[0].toUpperCase() as PathCommand["type"];
    const argsStr = token.slice(1).trim();
    const args = argsStr
      ? argsStr
          .replace(/,/g, " ")
          .split(/\s+/)
          .filter((s) => s.length > 0)
          .map(Number)
      : [];

    if (type === "Z") {
      commands.push({ type: "Z", args: [] });
    } else if (type === "M") {
      // M can have implicit L commands after the first pair
      for (let j = 0; j < args.length; j += 2) {
        commands.push({
          type: j === 0 ? "M" : "L",
          args: [args[j], args[j + 1]],
        });
      }
    } else if (type === "L") {
      for (let j = 0; j < args.length; j += 2) {
        commands.push({ type: "L", args: [args[j], args[j + 1]] });
      }
    } else if (type === "C") {
      for (let j = 0; j < args.length; j += 6) {
        commands.push({
          type: "C",
          args: args.slice(j, j + 6),
        });
      }
    }
  }

  return commands;
}

export function svgPathToLottieShape(d: string): LottieShape[] {
  const commands = tokenize(d);
  const shapes: LottieShape[] = [];

  let v: number[][] = [];
  let i: number[][] = []; // in tangents
  let o: number[][] = []; // out tangents
  let curX = 0;
  let curY = 0;

  function finishSubpath(closed: boolean) {
    if (v.length === 0) return;
    // Ensure the last vertex has an out-tangent
    if (o.length < v.length) {
      o.push([0, 0]);
    }
    shapes.push({ v: [...v], i: [...i], o: [...o], c: closed });
    v = [];
    i = [];
    o = [];
  }

  for (const cmd of commands) {
    switch (cmd.type) {
      case "M": {
        // If we have an in-progress subpath, finish it (unclosed)
        if (v.length > 0) {
          finishSubpath(false);
        }
        curX = cmd.args[0];
        curY = cmd.args[1];
        v.push([curX, curY]);
        i.push([0, 0]); // first vertex in-tangent
        break;
      }

      case "L": {
        const x = cmd.args[0];
        const y = cmd.args[1];
        // Previous vertex out-tangent = [0,0] (straight line)
        o.push([0, 0]);
        // New vertex
        v.push([x, y]);
        i.push([0, 0]); // in-tangent = [0,0] (straight line)
        curX = x;
        curY = y;
        break;
      }

      case "C": {
        const [x1, y1, x2, y2, x, y] = cmd.args;
        // Previous vertex out-tangent: control point 1 relative to prev vertex
        o.push([x1 - curX, y1 - curY]);
        // New vertex
        v.push([x, y]);
        // New vertex in-tangent: control point 2 relative to new vertex
        i.push([x2 - x, y2 - y]);
        curX = x;
        curY = y;
        break;
      }

      case "Z": {
        finishSubpath(true);
        break;
      }
    }
  }

  // Flush any remaining unclosed subpath
  if (v.length > 0) {
    finishSubpath(false);
  }

  return shapes;
}
