// Writes lib/images.json = list of files in public/images (runs before dev and build).
import fs from "fs";
const dir = "public/images";
fs.mkdirSync(dir, { recursive: true });
const list = fs.readdirSync(dir).filter((n) => /\.(jpe?g|png|webp|avif)$/i.test(n));
fs.writeFileSync("lib/images.json", JSON.stringify(list, null, 2) + "\n");
console.log(`Found ${list.length} product photo(s) in ${dir}`);
