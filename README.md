# PropertyLooks

Live open board for Lucknow property demand. Anyone can list what they want. Everyone sees the same live list.

No account. No sample listings.

## Pages

- `index.html` — landing: **List**, **Clients**, and **View property**
- `list.html` — post a house or land demand
- `clients.html` — clients write a free-text requirement
- `view.html` — live list, filters, auto-refresh

## How listings are stored

Demands are saved on the server (`data/demands.json`) and pushed to every open View page in real time (SSE + 4s poll). There is no seed data. An empty board stays empty until someone posts.

## Run locally

```bash
npm install
npm start
```

Open http://localhost:4173

## Deploy on Render

**`/api/clients` 404 means Render is still a Static Site.** HTML files are served, but `node server.js` never runs, so every `/api/*` route is missing.

Delete the Static Site (the one like `propertydekho-skd9`), then create a **Web Service**.

This is a **Web Service** (not a static site), because listings are shared.

1. Open [Render Dashboard](https://dashboard.render.com/)
2. **New → Web Service**
3. Connect `imagineversestudioai-web/PropertyDekho`
4. Settings:

   | Field | Value |
   |---|---|
   | **Runtime** | Node |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Instance** | Free |

5. Optional but recommended: add a **persistent disk**
   - Mount path: `/var/data`
   - Env var: `DATA_DIR` = `/var/data`

   Without a disk, listings reset when Render restarts the free instance.

6. Deploy. Later pushes to `main` auto-deploy.

If you already created a **Static Site**, delete it and create a **Web Service** instead. Static hosting cannot store shared live data.

## License

MIT. See `LICENSE`.
