# Lylo site deployment on Render

This folder contains the current Express website, Discord OAuth routes, static pages, bot code required by the web API, and configuration JSON files.

## Render settings

- Runtime: Node
- Build command: `npm install`
- Start command: `npm start`
- Set the environment variables shown in `.env.example` in the Render dashboard. Use the exact public callback URL in the Discord Developer Portal.
- Render provides `PORT`; do not set it manually unless needed.

## Important architecture notes

`server.js` currently starts the Discord bot and the website API uses that bot client for server configuration, role/channel lists, and command synchronization. This deployment therefore runs both the site and bot together. Do not also run the separate `bot hosting` package with the same bot token; that can create duplicate bot connections and conflicting actions.

The JSON files in `data/` are local state. Render's filesystem may be ephemeral, so settings and sessions can be lost on redeploy unless persistent storage is configured. The current code expects storage under this folder's `data/` path; a mounted disk or shared database requires a matching storage-path change.

Never upload a real `.env` file or `data/sessions.json`. Configure secrets in Render's environment settings.
