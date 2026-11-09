/** "iPhone 11 128GB" -> "iphone-11-128gb". Photo files are matched to products by this name. */
export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
