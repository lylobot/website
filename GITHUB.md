# Lylo

Bot y dashboard para Discord con panel de gestión, tickets, seguridad y OAuth.

## Descripción

Este proyecto combina:

- un bot de Discord
- un servidor web con autenticación por Discord
- panel de administración para servidores
- gestión de tickets
- protecciones anti-raid, anti-spam y anti-link
- exportación de transcripciones

## Estructura principal

- `bot.js` — bot principal de Discord
- `server.js` — servidor web + OAuth + API
- `package.json` — dependencias y scripts
- `public/` — frontend HTML/JS/CSS
- `commands/` — comandos del bot
- `data/` — configuración, sesiones y transcripciones
- `lib/` — utilidades

## Requisitos

- Node.js 18 o superior
- npm
- cuenta de Discord con bot
- acceso a Discord Developer Portal

## Instalación local

1. Clona el repositorio:

```bash
git clone <tu-url-del-repo>
cd Lylo
```

2. Instala dependencias:

```bash
npm install
```

3. Crea un archivo `.env` en la raíz:

```env
DISCORD_BOT_TOKEN=tu_token_del_bot
DISCORD_CLIENT_ID=tu_client_id
DISCORD_CLIENT_SECRET=tu_client_secret
SESSION_SECRET=una_clave_segura
PORT=3000
DISCORD_REDIRECT_URI=http://localhost:3000/auth/callback
```

4. Inicia elbot:

```bash
node bot.js
```

5. Inicia la web:

```bash
node server.js
```

6. Abre en el navegador:

```text
http://localhost:3000
```

## Scripts disponibles

En `package.json` ya vienen estos scripts:

```bash
npm start
npm run bot
```

## Importante sobre Vercel

Este proyecto no es compatible con Vercel como proyecto completo porque usa:

- un servidor Node.js backend
- dos procesos principales (`server.js` y `bot.js`)
- OAuth de Discord
- almacenamiento local en `data/`
- acceso a archivos del sistema

Vercel sirve mejor para frontend estático. Para este proyecto, una mejor opción es:

- Render
- Railway
- VPS / servidor propio

## Deployment recomendado: Render

### 1. Crear dos servicios

#### Web service
- Build Command: `npm install`
- Start Command: `node server.js`

#### Worker / Bot service
- Build Command: `npm install`
- Start Command: `node bot.js`

### 2. Variables de entorno
Setea en ambos servicios:

```env
DISCORD_BOT_TOKEN=tu_token_del_bot
DISCORD_CLIENT_ID=tu_client_id
DISCORD_CLIENT_SECRET=tu_client_secret
SESSION_SECRET=una_clave_segura
```

Para la web, además:

```env
DISCORD_REDIRECT_URI=https://tu-app.onrender.com/auth/callback
PORT=10000
```

### 3. Discord Developer Portal
En tu aplicación de Discord, configura:

- Redirect URI: `https://tu-app.onrender.com/auth/callback`
- URL de OAuth: `https://tu-app.onrender.com`

## Datos importantes

La app guarda información en la carpeta `data/`:

- `guild-config.json`
- `sessions.json`
- `bot-status.json`
- `transcripts/`

Eso significa que el hosting debe tener acceso persistente al sistema de archivos.

## .gitignore recomendado

```gitignore
node_modules
.env
.DS_Store
npm-debug.log*
```

## GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <URL_DE_GITHUB>
git push -u origin main
```

## Nota final

Si quieres una versión que sí sirva para Vercel, necesitas separarla en:

- frontend estático (Vercel)
- backend / bot (Render, Railway o VPS)

No conviene intentar dejar este proyecto completo en Vercel como un único app.
