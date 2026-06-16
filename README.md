# The Dermal Archive

A curated catalog of acne-safe, non-comedogenic products — skincare, makeup, body,
hair, tools, and fragrance, each vetted against pore-clogging ingredients — plus a
**Routines** blog.

Static site: plain HTML/CSS/JS, **no build step**. Open any page in a browser, or
serve the folder with any static file server. Fully self-contained — nothing loads
from the original Isabella Sofia site.

## Structure

- `index.html` — the product list (shop) with category / subcategory filtering
- `routines.html` — Routines (blog homepage)
- `about.html` — about the archive + how products are vetted
- `contact.html` — contact form
- `products/` — individual product hero pages (one per item)
- `posts/beauty/` — Routine blog posts
- `images/`, `files/` — uploaded images and PDFs
- `css/style.css` — shared stylesheet used by the posts (the four top-level pages
  inline their own copy of the CSS)
- `editor/` — the two browser-based content editors (see below)

## Deploy (Vercel)

This repo is connected to Vercel. Settings: framework preset **Other**, **no build
command**, root output directory. **Any push to `main` auto-deploys** to
`the-dermal-archive.vercel.app`.

## Editors

Two browser-based editors, each gated by the password **`2626`**. To publish, they
ask once for a **GitHub Personal Access Token** with write access to this repo; the
token is stored only in your browser (localStorage) and is never committed.

- **Products** — `the-dermal-archive.vercel.app/editor/products.html`
  - Add / edit / remove shop products; the **Page** button generates a product hero
    page in `products/`.
  - **Publish** writes the product grid into `index.html` and re-syncs the
    `PRODUCT_PAGES` list, so product names automatically link to their hero pages.
- **Blog (Routines)** — `the-dermal-archive.vercel.app/editor/blog.html`
  - Write / edit Routine posts (saved to `posts/beauty/`); images upload to
    `images/uploads/YYYY/MM/`.

**Workflow:** edit in the browser → **Publish** → it commits to `main` → Vercel
rebuilds (~30s).

## Adding a Routine post — one manual step

The blog editor saves the post file, but the **Routines page grid** and the shop's
**"Clear Skin Routines" carousel** are static lists (the current 5 posts). After
publishing a new post, add a matching card in two places:

- `routines.html` → the `<div class="blog-grid">` block
- `index.html` → the `<div class="blog-carousel">` block

(Each card needs the post's title, date, `posts/beauty/<slug>.html` link, and a
`images/uploads/...` thumbnail.)

---

Brand is "The Dermal Archive" throughout; article bylines are "Isabella Rivera."
Spun off from the Isabella Sofia site and made fully self-contained.
