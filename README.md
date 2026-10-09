# ISKCON Chandigarh · Hare Krishna Dham

Website and admin for Sri Sri Radha Madhava Mandir, Sector 36-B, Chandigarh.
Next.js 16 · Tailwind 4 · three.js / GSAP.

## Run locally

```bash
npm install
cp .env.example .env.local   # then set ADMIN_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run dev                  # http://localhost:3790  ·  admin at /admin
npm run verify               # checks the Vaishnava calendar against published ISKCON dates
```

## Content

Everything editable lives in `content/*.json` (homepage sections, page headers, campaigns,
sevas, blog, festivals, programs, calendar events, timings, settings, photo/video slots).
The admin at `/admin` edits these files; the site reads them on every request.

## Deploying to Vercel (no database yet)

1. Import this repo in Vercel. Framework: Next.js. No build settings to change.
2. Optional, to open the admin preview, add environment variables:
   - `ADMIN_SECRET`: 64 random hex characters
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: the admin login
3. Deploy.

On Vercel the filesystem is read-only, so the site runs in **read-only mode** automatically:

- every page works and shows the content committed in `content/`;
- the admin opens in preview mode: you can browse everything, but saving and uploads are off;
- donation and contact forms hand the visitor's details to the temple office by email
  (nothing is stored on the server);
- to change content for now: edit locally in the admin (`npm run dev`), commit, push.

To switch on saving, uploads and stored donations, connect a database and file storage
(replace `readContent` / `writeContent` in `src/lib/store.ts` and the upload store in
`src/lib/admin/uploads.ts`). Set `NEXT_PUBLIC_PAYMENTS_LIVE=1` once a payment gateway is connected.
