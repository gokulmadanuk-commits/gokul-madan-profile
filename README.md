# gokulmadan.com

Personal site and resume for Gokul Madan Alikkal. Live at **https://gokulmadan.com**, deployed on Vercel from `main`.

## Stack

Vite, React, TypeScript, Tailwind CSS and shadcn/ui components.

## Run locally

```sh
npm install
npm run dev
```

## Editing content and the resume

All copy for the homepage and the `/resume` page lives in `src/data/profile.ts`.
After changing it, regenerate the downloadable PDF and commit it:

```sh
npm run resume:pdf   # builds the site and prints /resume to public/resume.pdf (needs Playwright + Chromium)
```

The download file name is `person.resumeFileName` in the same file; keep it in step with the
`Content-Disposition` header for `/resume.pdf` in `vercel.json`.

## Assets

- `public/images/` — logos and photos used across the site
- `public/work/` — prototype and case-study screenshots
- `public/community/` — Belfast Builds AI images
- `public/favicon.ico`, `public/icon-192.png`, `public/apple-touch-icon.png` — site icon
