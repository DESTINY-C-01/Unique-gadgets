// Prints the photo file name each product expects, and whether you already added it.
// Run: npm run photos   (the API must be running)
import fs from "fs";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const have = new Set(fs.existsSync("public/images") ? fs.readdirSync("public/images").map((f) => slug(f.replace(/\.[^.]+$/, ""))) : []);
const products = await (await fetch(`${API}/products`)).json();
for (const p of products) console.log(`${have.has(slug(p.name)) ? "[x]" : "[ ]"} ${slug(p.name)}.jpg   (${p.name})`);
