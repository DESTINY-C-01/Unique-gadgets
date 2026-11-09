import fs from "fs";
import path from "path";
import manifest from "./images.json";
import { slug } from "./slug";
import type { Product } from "./api";

const EXT = /\.(jpe?g|png|webp|avif)$/i;

/** Reads public/images directly; falls back to the list made at build time (npm run images). */
function files(): string[] {
  try {
    const f = fs.readdirSync(path.join(process.cwd(), "public", "images")).filter((n) => EXT.test(n));
    if (f.length) return f;
  } catch {}
  return manifest as string[];
}

/** A product gets its photo automatically when a file in public/images has the product's slug as its name. */
export function withImages(products: Product[]): Product[] {
  const byName = new Map(files().map((f) => [slug(f.replace(EXT, "")), f]));
  return products.map((p) => {
    if (p.image) return p;
    const f = byName.get(slug(p.name));
    return f ? { ...p, image: `/images/${f}` } : p;
  });
}
