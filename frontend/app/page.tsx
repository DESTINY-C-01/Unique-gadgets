import Storefront from "@/components/Storefront";
import { API, Product } from "@/lib/api";
import { withImages } from "@/lib/images";

export const dynamic = "force-dynamic";

async function load(): Promise<Product[]> {
  try {
    const r = await fetch(`${API}/products`, { cache: "no-store" });
    return r.ok ? ((await r.json()) as Product[]).filter((p) => p.inStock !== false) : [];
  } catch {
    return [];
  }
}

export default async function Page() {
  return <Storefront products={withImages(await load())} />;
}
