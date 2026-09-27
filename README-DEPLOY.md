# Lylo site deployment on Render

This folder contains only the Express website, Discord OAuth routes, static pages, and website dependencies. Discord operations are sent to the separately hosted bot API.

## Render settings

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Set the environment variables shown in `.env.example` in the Render dashboard. Use the exact public callback URL in the Discord Developer Portal. Set `BOT_API_URL` to the public HTTPS base URL of the bot API and use the same strong `BOT_API_SECRET` on both hosts.
- Render provides `PORT`; do not set it manually unless needed.

## Architecture and storage

Render handles website pages, Discord OAuth, and user permissions. The bot host runs the Discord client and private API. The API accepts only authenticated requests from the website using `BOT_API_SECRET`.

The bot host owns the JSON configuration in its `data/` directory; keep persistent storage there. Render only writes OAuth sessions under `data/sessions.json`, so configure a persistent disk if sessions must survive redeploys.

Never upload a real `.env` file. Configure secrets in Render's environment settings.
