# Unique Gadgets: full-stack store (Next.js + NestJS + MongoDB)

```
unique-gadgets-fullstack/
  backend/    NestJS API: products, orders, admin protection, validation, rate limiting
  frontend/   Next.js (App Router, TypeScript): storefront, cart, /admin page
```

## How it works
1. The storefront (Next.js) loads products from the API.
2. The customer adds products to the cart and enters name, phone and town.
3. The API saves the order (prices are read from the database, never from the browser) and returns a WhatsApp link with the full order.
4. WhatsApp opens with the order ready to send to your number.
5. The owner manages everything at `/admin` (see below).

## Run it on your computer
You need Node.js 20+ and MongoDB (local, or a free MongoDB Atlas cluster).

**Backend**
```
cd backend
cp .env.example .env        # then edit MONGODB_URI, ADMIN_KEY, WHATSAPP_NUMBER
npm install
npm run seed                # loads the sample products (once)
npm run start:dev           # http://localhost:4000/products
```

**Frontend** (second terminal)
```
cd frontend
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
```

## Admin page for the owner
Open `/admin` (for example http://localhost:3000/admin) and log in with your `ADMIN_KEY`.
- **Post a product:** name, brand, price, optional old price (shows a deal), category, tested or brand new, the four specs, description, best-seller tick, and a **photo** straight from your phone or computer. Photos are shrunk automatically before upload.
- **Edit or delete** any product, and untick **In stock** to hide it from the shop without deleting it.
- **Orders:** see every order with the customer's name, phone, town and items, and set its status (new, confirmed, delivered, cancelled).
- Uploaded photos are stored in your MongoDB database, so they are not lost when the API is redeployed. Photos dropped in `frontend/public/images/` still work too.
- Keep the admin key private. You stay logged in until you close the browser tab or press Log out.

## Customise
- Store name, city, phone, free-delivery amount, social links and reviews: `frontend/lib/config.ts`
- All page text (English and French): `frontend/lib/i18n.ts`
- Colours and layout: `frontend/app/globals.css`
- Sample products: `backend/src/seed.ts`, or use `/admin`
- **Photos:** drop them in `frontend/public/images/`, named after the product (`iPhone 11 128GB` becomes `iphone-11-128gb.jpg`). They appear on the site automatically. Run `npm run photos` in `frontend/` to list the exact file name each product expects. After adding photos on a live site, redeploy so they are published.

## API
| Method | Route | Access |
|---|---|---|
| GET | `/products?category=pho&q=iphone&bestSeller=true` | public |
| GET | `/products/:id` | public |
| POST / PATCH / DELETE | `/products`, `/products/:id` | admin (`x-admin-key` header) |
| POST | `/orders` | public, rate limited |
| GET, PATCH | `/orders`, `/orders/:id` (set status) | admin |
| POST | `/media` (upload a photo) | admin |
| GET | `/media/:id` (show a photo) | public |

Categories: `pho` phones, `lap` laptops, `desk` desktops, `gad` smart gadgets, `acc` accessories.

## Put it online
1. **Database:** create a free MongoDB Atlas cluster and copy its connection string.
2. **API:** deploy `backend/` to Render or Railway. Build command `npm install && npm run build`, start command `npm run start:prod`. Set `MONGODB_URI`, `ADMIN_KEY` (long random text), `WHATSAPP_NUMBER`, and `CORS_ORIGIN` (your website address).
3. **Website:** deploy `frontend/` to Vercel. Set `NEXT_PUBLIC_API_URL` to your API address.
4. Run the seed once against the live database, or add products in `/admin`.

## Keep your secrets safe
Never commit `.env` files (they are in `.gitignore`). Use a long random `ADMIN_KEY`.

## Ideas for later
Mobile money payment link (MTN MoMo / Moov), customer accounts, several photos per product, blog for SEO.
