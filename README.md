# Yeo Yedjande — Portfolio

Professional portfolio for **Yeo Yedjande, Senior Full Stack Developer**, targeting international
recruitment (Canada, France, Belgium, Luxembourg, Switzerland, Germany).

Live site: [https://yeoyedjande.com](https://yeoyedjande.com)

## Stack

Intentionally a **static site** — semantic HTML, modern CSS, a small vanilla JS file. No framework,
no build step, no dependencies. This keeps it fast (perfect Lighthouse scores are achievable),
SEO-friendly and deployable anywhere (GitHub Pages, Netlify, Vercel, any web host).

```
index.html          All content, organized in commented sections
css/styles.css      Design system (colors, layout, responsive, animations)
js/main.js          Mobile nav, scroll reveal, active nav link
assets/favicon.svg  Favicon
assets/cv/          Put your CV PDF here (see below)
```

## Run locally

Any static file server works:

```bash
# Python
python3 -m http.server 8000

# or Node
npx serve .
```

Then open http://localhost:8000.

## Editing content

All texts live in `index.html`, grouped under clearly commented section banners
(`HERO`, `ABOUT`, `CORE EXPERTISE`, `TECH STACK`, `FEATURED PROJECTS`, `EXPERIENCE`,
`WHY WORK WITH ME`, `CONTACT`). Edit the HTML directly — no rebuild needed.

- **Colors / design tokens**: top of `css/styles.css` (`:root` variables).
- **Projects**: duplicate a `<article class="project-card">` block to add one.
- **Tech stack**: plain `<li>` items — no percentages, by design.

## Things to complete

1. **CV file**: place your PDF at `assets/cv/Yeo-Yedjande-CV.pdf` (the "Download CV" button
   points there). Keep an English version — the target audience is international recruiters.
2. **LinkedIn URL**: verify the slug in `index.html` (currently
   `https://www.linkedin.com/in/yeo-yedjande` — appears in the contact section, footer and
   JSON-LD). Replace with your exact profile URL.
3. **Open Graph image** (optional): add a 1200×630 `assets/og-image.png` and an
   `og:image` meta tag for richer link previews on LinkedIn.

## Deploying

Upload the repository content as-is to your host, or enable GitHub Pages on this repo
(Settings → Pages → deploy from branch). Point the `yeoyedjande.com` DNS at your host.
