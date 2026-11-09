"use client";
import { useEffect, useMemo, useState } from "react";
import { T } from "@/lib/i18n";
import { API, Product, fmt, img } from "@/lib/api";
import { BRAND, CITY, FREE, PHONE, REVIEWS, SOCIAL, WA } from "@/lib/config";

const CATS = ["all", "pho", "lap", "desk", "gad", "acc"];
const EM: Record<string, string> = { all: "🛍️", pho: "📱", lap: "💻", desk: "🖥️", gad: "🎧", acc: "🔌" };
type Line = { id: string; name: string; price: number; qty: number };

export default function Storefront({ products: initial, failed }: { products: Product[]; failed: boolean }) {
  const [products, setProducts] = useState(initial);
  const [loading, setLoading] = useState(failed && initial.length === 0);
  const [lang, setLang] = useState<"en" | "fr">("en");
  const [cat, setCat] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("new");
  const [cart, setCart] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ name: "", phone: "", town: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const t = T[lang];

  // Use the visitor's saved language, or French if their phone is set to French.
  useEffect(() => {
    try {
      const s = localStorage.getItem("ug_lang");
      if (s === "fr" || s === "en") setLang(s);
      else if (navigator.language.toLowerCase().startsWith("fr")) setLang("fr");
    } catch {}
  }, []);
  function switchLang() {
    const n = lang === "en" ? "fr" : "en";
    setLang(n);
    try { localStorage.setItem("ug_lang", n); } catch {}
  }

  // If the server was asleep when the page was built, keep trying from the browser.
  useEffect(() => {
    if (!failed || initial.length > 0) return;
    let tries = 0, stop = false;
    const go = async () => {
      try {
        const r = await fetch(`${API}/products`, { cache: "no-store" });
        if (r.ok) {
          const d: Product[] = await r.json();
          if (!stop) { setProducts(d.filter((p) => p.inStock !== false)); setLoading(false); }
          return;
        }
      } catch {}
      if (stop) return;
      if (++tries < 24) setTimeout(go, 5000); else setLoading(false);
    };
    go();
    return () => { stop = true; };
  }, [failed, initial.length]);

  const wa = (m: string) => `https://wa.me/${WA}?text=${encodeURIComponent(m)}`;
  const goto = (k: string) => { setCat(k); setQ(""); document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" }); };
  const shown = useMemo(() => {
    const l = products.filter((p) => (cat === "all" || p.category === cat) && p.name.toLowerCase().includes(q.trim().toLowerCase()));
    return sort === "lo" ? [...l].sort((a, b) => a.price - b.price) : sort === "hi" ? [...l].sort((a, b) => b.price - a.price) : l;
  }, [products, cat, q, sort]);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const ready = f.name.trim().length > 1 && f.phone.trim().length > 6 && f.town.trim().length > 1;

  function add(p: Product) {
    setCart((c) => {
      const x = c.find((l) => l.id === p._id);
      return x ? c.map((l) => (l.id === p._id ? { ...l, qty: l.qty + 1 } : l)) : [...c, { id: p._id, name: p.name, price: p.price, qty: 1 }];
    });
    setOpen(true);
  }
  const bump = (id: string, d: number) => setCart((c) => c.map((l) => (l.id === id ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));

  async function checkout() {
    setBusy(true); setErr("");
    try {
      const r = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName: f.name, phone: f.phone, town: f.town, language: lang, items: cart.map((c) => ({ productId: c.id, quantity: c.qty })) }),
      });
      if (!r.ok) throw new Error();
      const d = await r.json();
      window.open(d.whatsappUrl, "_blank");
      setCart([]); setOpen(false);
    } catch { setErr(t.err); } finally { setBusy(false); }
  }

  const card = (p: Product) => (
    <div className="card" key={p._id}>
      <div className="th">
        <span className="bd">{p.condition === "new" ? t.new : t.tested}</span>
        {p.oldPrice ? <span className="bd s">{t.save} {fmt(p.oldPrice - p.price)}</span> : null}
        {p.image ? <img src={img(p.image)} alt={p.name} loading="lazy" /> : <span>{p.emoji}</span>}
      </div>
      <div className="vd">{p.brand}{p.bestSeller ? ` · ★ ${t.bs}` : ""}</div>
      <h3>{p.name}</h3>
      {p.specs && p.specs.length === 4
        ? <div className="sg">{p.specs.map((v, i) => <div key={i}><b>{v}</b><small>{[t.dsp, t.cpu, t.ram, t.sto][i]}</small></div>)}</div>
        : <p className="sp">{p.description}</p>}
      <div className="pr2">{fmt(p.price)}{p.oldPrice ? <s>{fmt(p.oldPrice)}</s> : null}</div>
      <a className="btn wab" href={wa(`${t.msg}\n- 1 x ${p.name} (${fmt(p.price)})`)} target="_blank" rel="noopener">{t.wa}</a>
      <button className="btn o2" onClick={() => add(p)}>{t.add}</button>
    </div>
  );

  return (
    <>
      <div className="bar">{t.bar}</div>
      <header><div className="w">
        <a className="logo" href="#"><img src="/logo-emblem.jpg" alt="" width={50} height={38} /><span>{BRAND}</span></a>
        <nav><a href="#shop">{t.n1}</a><a href="#how">{t.n2}</a><a href="#faq">{t.n3}</a><a href="#contact">{t.n4}</a></nav>
        <button className="pill" onClick={switchLang} aria-label="Change language">{lang === "en" ? "Français" : "English"}</button>
        <button className="pill cartbtn" onClick={() => setOpen(!open)}>🛒 {t.cart} <b>{count}</b></button>
      </div></header>

      <div className="hero"><div className="w one">
        <h1>{t.h1b}</h1>
        <p>{t.hpb}</p>
        <div className="sbox"><input type="search" placeholder={"🔍 " + t.ph} aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <div className="st3"><span>① {t.st1}</span><span>② {t.st2}</span><span>③ {t.st3}</span></div>
        <div className="tk"><span>✅ {t.t1}</span><span>🛡️ {t.t2}</span><span>🚚 {t.t4}</span><span>💳 {t.t3}</span></div>
      </div></div>

      <div className="catbar"><div className="w">
        {CATS.map((k) => (
          <button key={k} aria-pressed={cat === k} onClick={() => setCat(k)}>
            {EM[k]} {t[k]} ({products.filter((p) => k === "all" || p.category === k).length})
          </button>
        ))}
      </div></div>

      <section id="shop" style={{ paddingTop: 24 }}><div className="w">
        <div className="tl">
          <b>{shown.length} {t.found}</b>
          <label>{t.sort}: <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="new">{t.snew}</option><option value="lo">{t.slo}</option><option value="hi">{t.shi}</option>
          </select></label>
        </div>
        <p className="hint">{t.hint}</p>
        {loading && <div className="msgbox">{t.loading} {t.wake}</div>}
        {!loading && !products.length && (
          <div className="msgbox">{t.failed} <button className="va" onClick={() => window.location.reload()}>{t.retry}</button></div>
        )}
        <div className="grid">
          {loading
            ? [1, 2, 3, 4].map((i) => <div className="skel" key={i} />)
            : shown.length ? shown.map(card) : products.length ? <p className="none">{t.none}</p> : null}
        </div>
      </div></section>

      <section className="band"><div className="w">
        <h2>{t.hw}</h2><p className="sub">{t.subw}</p>
        <div className="why">{t.why.map((x: string[]) => <div key={x[1]}><i>{x[0]}</i><h3>{x[1]}</h3><p>{x[2]}</p></div>)}</div>
      </div></section>

      {REVIEWS.length > 0 && (
        <section><div className="w"><h2>{t.hr}</h2><p className="sub">{t.subr}</p>
          <div className="rv">{REVIEWS.map((r) => <div key={r.name}><p>“{r.text}”</p><b>{r.name}{r.city ? `, ${r.city}` : ""}</b></div>)}</div>
        </div></section>
      )}

      <section id="how"><div className="w">
        <h2>{t.h3}</h2><p className="sub">{t.sub3}</p>
        <div className="steps">{[1, 2, 3].map((i) => <div className="step" key={i}><h3>{t[`s${i}h`]}</h3><p>{t[`s${i}p`]}</p></div>)}</div>
      </div></section>

      <section className="band" id="faq"><div className="w">
        <h2>{t.h4}</h2><p className="sub">{t.sub4}</p>
        {[1, 2, 3, 4].map((i) => <details key={i}><summary>{t[`q${i}`]}</summary><p>{t[`a${i}`]}</p></details>)}
      </div></section>

      <section className="cta2" id="contact"><div className="w">
        <h2>{t.h5}</h2><p>{t.p5}</p>
        <div className="ctas" style={{ justifyContent: "center" }}>
          <a className="btn" href={wa(t.hi)} target="_blank" rel="noopener">{t.wa}</a>
          <a className="btn o" href={wa(t.jm)} target="_blank" rel="noopener">{t.join}</a>
        </div>
      </div></section>

      <footer><div className="w">
        <div><strong style={{ color: "var(--ink)", fontSize: 18 }}>{BRAND}</strong><p style={{ margin: "8px 0 0" }}>{t.fabout}</p></div>
        <div><h4>{t.fshop}</h4>{CATS.map((k) => <button className="fl" key={k} onClick={() => goto(k)}>{t[k]}</button>)}</div>
        <div><h4>{t.finfo}</h4><a href="#how">{t.n2}</a><a href="#faq">{t.n3}</a><a href="#contact">{t.n4}</a></div>
        <div><h4>{t.fcont}</h4>
          <a href={wa(t.hi)} target="_blank" rel="noopener">{PHONE}</a>{CITY}<br />{t.hours}
          <div>{Object.entries(SOCIAL).filter(([, u]) => u).map(([n, u]) => <a key={n} href={u} target="_blank" rel="noopener">{n}</a>)}</div>
        </div>
        <div className="copy">© {new Date().getFullYear()} {BRAND}</div>
      </div></footer>

      <div className={"ov" + (open ? " open" : "")} onClick={() => setOpen(false)} />
      <aside className={"drawer" + (open ? " open" : "")} aria-label="Cart">
        <div className="dh"><h3>{t.cart}</h3><button className="x" onClick={() => setOpen(false)} aria-label="Close">×</button></div>
        <div id="cl">
          {cart.map((l) => (
            <div className="ci" key={l.id}>
              <div><b>{l.name}</b><br /><small>{fmt(l.price)}</small></div>
              <div className="qt"><button onClick={() => bump(l.id, -1)}>−</button><span>{l.qty}</span><button onClick={() => bump(l.id, 1)}>+</button></div>
            </div>
          ))}
        </div>
        {!count && <p style={{ color: "var(--mute)" }}>{t.empty}</p>}
        {count > 0 && (
          <div>
            <div className="tt"><span>{t.total}</span><span>{fmt(total)}</span></div>
            {total >= FREE && <p className="fr">{t.free}</p>}
            <div className="fm">
              <input placeholder={t.fn} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
              <input placeholder={t.fp} inputMode="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
              <input placeholder={t.ft} value={f.town} onChange={(e) => setF({ ...f, town: e.target.value })} />
            </div>
            {err && <p className="err">{err}</p>}
            <button className="btn g" style={{ width: "100%" }} disabled={!ready || busy} onClick={checkout}>{t.ck}</button>
          </div>
        )}
      </aside>
      <a className="btn g fab" href={wa(t.hi)} target="_blank" rel="noopener">💬 {t.wa}</a>
    </>
  );
}