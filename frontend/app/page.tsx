import Storefront from "@/components/Storefront";
import { API, Product } from "@/lib/api";
import { withImages } from "@/lib/images";

// Pages are rebuilt at most once a minute, so visitors get a fast page and admin changes show up within about 60 seconds.
export const revalidate = 60;

async function load(): Promise<{ products: Product[]; failed: boolean }> {
  try {
    const r = await fetch(`${API}/products`, { next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error("bad response");
    const all = (await r.json()) as Product[];
    return { products: all.filter((p) => p.inStock !== false), failed: false };
  } catch {
    // The free Render server may be asleep. The browser retries by itself (see Storefront).
    return { products: [], failed: true };
  }
}

export default async function Page() {
  const { products, failed } = await load();
  return <Storefront products={withImages(products)} failed={failed} />;
}