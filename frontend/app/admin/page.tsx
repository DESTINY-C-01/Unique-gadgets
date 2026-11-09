"use client";
import { useEffect, useState } from "react";
import { API, Product, fmt, img } from "@/lib/api";

const EMOJI: Record<string, string> = { pho: "📱", lap: "💻", desk: "🖥️", gad: "🎧", acc: "🔌" };
const CAT_NAMES: Record<string, string> = { pho: "Phones", lap: "Laptops", desk: "Desktops", gad: "Smart Gadgets", acc: "Accessories" };
const STATUSES = ["new", "confirmed", "delivered", "cancelled"];
const blank = {
  name: "", brand: "", price: "", oldPrice: "", category: "pho", condition: "tested",
  s0: "", s1: "", s2: "", s3: "", description: "", image: "", bestSeller: false, inStock: true,
};

/** Shrinks a phone photo to about 1000 px so it uploads fast on mobile data. */
async function shrink(file: File, max = 1000): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * k);
  c.height = Math.round(bmp.height * k);
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("resize failed"))), "image/jpeg", 0.82));
}

export default function Admin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"products" | "form" | "orders">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k: string, v: any) => setF((s) => ({ ...s, [k]: v }));
  const auth = (k = key) => ({ "x-admin-key": k });

  async function loadProducts() {
    setProducts(await (await fetch(`${API}/products`, { cache: "no-store" })).json());
  }
  async function login(k = key) {
    setMsg("");
    try {
      const r = await fetch(`${API}/orders`, { headers: auth(k) });
      if (!r.ok) { setMsg("Wrong admin key"); return; }
      setOrders(await r.json());
      await loadProducts();
      sessionStorage.setItem("ug_key", k);
      setKey(k); setAuthed(true);
    } catch { setMsg("Cannot reach the API. Is it running?"); }
  }
  useEffect(() => {
    const k = sessionStorage.getItem("ug_key");
    if (k) login(k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() { sessionStorage.removeItem("ug_key"); setAuthed(false); setKey(""); }
  function newProduct() { setF(blank); setEditing(""); setMsg(""); setTab("form"); }
  function edit(p: Product) {
    setF({
      name: p.name, brand: p.brand, price: String(p.price), oldPrice: p.oldPrice ? String(p.oldPrice) : "",
      category: p.category, condition: p.condition, s0: p.specs?.[0] ?? "", s1: p.specs?.[1] ?? "", s2: p.specs?.[2] ?? "",
      s3: p.specs?.[3] ?? "", description: p.description ?? "", image: p.image ?? "", bestSeller: !!p.bestSeller, inStock: p.inStock !== false,
    });
    setEditing(p._id); setMsg(""); setTab("form"); window.scrollTo({ top: 0 });
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setMsg("Uploading photo...");
    try {
      const blob = await shrink(file);
      const fd = new FormData();
      fd.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
      const r = await fetch(`${API}/media`, { method: "POST", headers: auth(), body: fd });
      if (!r.ok) throw new Error();
      set("image", (await r.json()).path);
      setMsg("Photo uploaded");
    } catch { setMsg("Photo upload failed. Try a smaller JPG or PNG."); }
    setBusy(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const specs = [f.s0, f.s1, f.s2, f.s3].map((s) => s.trim());
    if (specs.some(Boolean) && !specs.every(Boolean)) { setMsg("Fill all four spec boxes, or leave them all empty"); return; }
    const body = {
      name: f.name.trim(), brand: f.brand.trim(), price: Number(f.price), oldPrice: f.oldPrice ? Number(f.oldPrice) : 0,
      category: f.category, condition: f.condition, emoji: EMOJI[f.category], bestSeller: f.bestSeller, inStock: f.inStock,
      specs: specs.every(Boolean) ? specs : [], description: f.description.trim(), image: f.image,
    };
    const r = await fetch(editing ? `${API}/products/${editing}` : `${API}/products`, {
      method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json", ...auth() }, body: JSON.stringify(body),
    });
    if (!r.ok) { setMsg(r.status === 401 ? "Wrong admin key" : "Check the form: prices must be whole numbers"); return; }
    await loadProducts();
    setMsg(editing ? "Product updated" : "Product posted. It is now live on the site.");
    setF(blank); setEditing(""); setTab("products");
  }

  async function patchProduct(id: string, data: object) {
    await fetch(`${API}/products/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...auth() }, body: JSON.stringify(data) });
    loadProducts();
  }
  async function del(p: Product) {
    if (!confirm(`Delete "${p.name}"?`)) return;
    await fetch(`${API}/products/${p._id}`, { method: "DELETE", headers: auth() });
    loadProducts();
  }
  async function setStatus(id: string, status: string) {
    await fetch(`${API}/orders/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json", ...auth() }, body: JSON.stringify({ status }) });
    setOrders((o) => o.map((x) => (x._id === id ? { ...x, status } : x)));
  }

  if (!authed) {
    return (
      <main className="ad">
        <h1>Store admin</h1>
        <p className="sub">Enter your admin key to manage products and orders.</p>
        <form onSubmit={(e) => { e.preventDefault(); login(); }}>
          <input type="password" placeholder="Admin key" value={key} onChange={(e) => setKey(e.target.value)} autoFocus />
          <button className="btn g" type="submit">Log in</button>
        </form>
        {msg && <p className="err">{msg}</p>}
      </main>
    );
  }

  const fresh = orders.filter((o) => o.status === "new").length;
  return (
    <main className="ad">
      <div className="hd"><h1>Store admin</h1><button className="va" onClick={logout}>Log out</button></div>
      <div className="tabs">
        <button aria-pressed={tab === "products"} onClick={() => setTab("products")}>Products ({products.length})</button>
        <button aria-pressed={tab === "form"} onClick={newProduct}>+ Post a product</button>
        <button aria-pressed={tab === "orders"} onClick={() => setTab("orders")}>Orders{fresh ? ` (${fresh} new)` : ""}</button>
      </div>
      {msg && <p className="ok">{msg}</p>}

      {tab === "form" && (
        <form onSubmit={save}>
          <h2>{editing ? "Edit product" : "Post a new product"}</h2>
          <div className="g2">
            <input required placeholder="Name, e.g. iPhone 11 128GB" value={f.name} onChange={(e) => set("name", e.target.value)} />
            <input required placeholder="Brand, e.g. Apple" value={f.brand} onChange={(e) => set("brand", e.target.value)} />
            <input required type="number" min={0} placeholder="Price (FCFA)" value={f.price} onChange={(e) => set("price", e.target.value)} />
            <input type="number" min={0} placeholder="Old price (optional, shows a deal)" value={f.oldPrice} onChange={(e) => set("oldPrice", e.target.value)} />
            <select value={f.category} onChange={(e) => set("category", e.target.value)} style={{ width: "100%" }}>
              {Object.entries(CAT_NAMES).map(([k, n]) => <option key={k} value={k}>{n}</option>)}
            </select>
            <select value={f.condition} onChange={(e) => set("condition", e.target.value)} style={{ width: "100%" }}>
              <option value="tested">Tested (used)</option><option value="new">Brand new</option>
            </select>
          </div>
          <p className="sub" style={{ margin: 0 }}>Specs (for phones, laptops and desktops). Fill all four or leave empty.</p>
          <div className="g2">
            <input placeholder="Display, e.g. 6.1-inch" value={f.s0} onChange={(e) => set("s0", e.target.value)} />
            <input placeholder="Processor, e.g. Core i5" value={f.s1} onChange={(e) => set("s1", e.target.value)} />
            <input placeholder="RAM, e.g. 8GB" value={f.s2} onChange={(e) => set("s2", e.target.value)} />
            <input placeholder="Storage, e.g. 256GB SSD" value={f.s3} onChange={(e) => set("s3", e.target.value)} />
          </div>
          <input placeholder="Short description (for gadgets and accessories)" value={f.description} onChange={(e) => set("description", e.target.value)} />
          <div>
            <p className="sub" style={{ margin: "0 0 8px" }}>Photo</p>
            {f.image && <img className="ph" src={img(f.image)} alt="Preview" />}
            <input type="file" accept="image/*" onChange={onFile} disabled={busy} style={{ marginTop: 8 }} />
          </div>
          <label><input type="checkbox" style={{ width: "auto" }} checked={f.bestSeller} onChange={(e) => set("bestSeller", e.target.checked)} /> Best seller</label>
          <label><input type="checkbox" style={{ width: "auto" }} checked={f.inStock} onChange={(e) => set("inStock", e.target.checked)} /> In stock (untick to hide it from the shop)</label>
          <button className="btn g" type="submit" disabled={busy}>{editing ? "Save changes" : "Post product"}</button>
        </form>
      )}

      {tab === "products" && (
        <table><tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.image ? <img className="pt" src={img(p.image)} alt="" /> : <span className="pt">{p.emoji}</span>}</td>
              <td><b>{p.name}</b><br /><small>{p.brand} · {CAT_NAMES[p.category]}</small></td>
              <td>{fmt(p.price)}</td>
              <td><label><input type="checkbox" style={{ width: "auto" }} checked={p.inStock !== false} onChange={(e) => patchProduct(p._id, { inStock: e.target.checked })} /> In stock</label></td>
              <td><button className="va" onClick={() => edit(p)}>Edit</button> <button className="va" onClick={() => del(p)}>Delete</button></td>
            </tr>
          ))}
          {!products.length && <tr><td>No products yet. Click “Post a product”.</td></tr>}
        </tbody></table>
      )}

      {tab === "orders" && (
        <table><tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>{o.orderNumber}<br /><small>{new Date(o.createdAt).toLocaleString()}</small></td>
              <td><b>{o.customerName}</b><br /><a href={`tel:${o.phone}`}>{o.phone}</a><br /><small>{o.town}</small></td>
              <td>{o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(", ")}</td>
              <td>{fmt(o.total)}</td>
              <td><select value={o.status} onChange={(e) => setStatus(o._id, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
            </tr>
          ))}
          {!orders.length && <tr><td>No orders yet.</td></tr>}
        </tbody></table>
      )}
    </main>
  );
}
