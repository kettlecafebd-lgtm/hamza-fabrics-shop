# Hamza Fabrics customer shop

React + Vite storefront for Hamza Fabrics.

## Local development

```bash
cp .env.example .env
npm ci --legacy-peer-deps
npm run dev -- --host 0.0.0.0
```

The local API default is `http://localhost:5000`. Do not commit `.env`; it is intentionally ignored.

## Product-image / Cloudflare R2 contract

The app resolves every dynamic image through `src/utils/imageUrl.js`, so product cards, quick view, cart, checkout, order history, account avatars, and site-setting images use identical URL rules.

### Preferred API response

The API should persist and return a complete browser-accessible R2 URL:

```json
{
  "image_url": "https://assets.example.com/products/cotton/blue.webp"
}
```

Use an R2 public custom domain, a public-development (`r2.dev`) URL, or a valid signed URL for a private bucket. Do **not** return the S3-compatible `cloudflarestorage.com` endpoint as a browser image URL.

### Transitional support for existing records

If older product records store only an R2 key, for example `products/cotton/blue.webp`, set this build-time variable in the relevant environment and redeploy:

```bash
VITE_R2_PUBLIC_URL=https://assets.example.com
```

The resolver maps that key to `https://assets.example.com/products/cotton/blue.webp`. Legacy `/uploads/...` values continue to use the API origin so they work with the Docker proxy and Vercel proxy.

`VITE_*` variables are compiled into the browser bundle. Never put R2 access keys, secrets, or tokens in them.

## Deployment

### Vercel

`vercel.json` proxies `/api/*` and legacy `/uploads/*` to `https://bd.hamzafabrics.com` before the SPA fallback. This prevents API and legacy upload requests from receiving `index.html`.

- Leave `VITE_API_URL` unset to use the same-origin Vercel proxy, or set it to the HTTPS API origin if that API permits the storefront origin via CORS.
- Set `VITE_R2_PUBLIC_URL` when the API still returns bare R2 object keys.
- Redeploy after changing any `VITE_*` setting.

### Docker / Nginx

Nginx already proxies `/api/` and `/uploads/` to the backend. The same image resolver works there without a deployment-specific code path.

## Verification checklist

1. Open `/api/products` and inspect `image_url` for a product.
2. Open the resolved image URL in a new tab. It must return `200` with an `image/*` content type.
3. Check the shop card, quick view, cart, and checkout—the same image should use the same absolute URL.
4. A `403` indicates R2 public-domain or object-access configuration; a `404` indicates an incorrect stored key; HTML returned for an image means a routing problem.

## Commands

```bash
npm run dev
npm run build
npm run test:image-urls
npm run lint
```
