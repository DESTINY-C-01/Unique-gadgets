export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type Product = {
  _id: string; name: string; brand: string; description?: string; specs?: string[];
  price: number; oldPrice?: number; category: string; emoji: string;
  condition: "tested" | "new"; bestSeller?: boolean; inStock?: boolean; image?: string;
};

export const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u202f") + " FCFA";

/** Photos uploaded from the admin page live on the API ("/media/..."); folder photos live on the site ("/images/..."). */
export const img = (p?: string) => (!p ? undefined : p.startsWith("/media/") ? API + p : p);
