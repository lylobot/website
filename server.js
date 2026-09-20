const http = require('node:http');
const https = require('node:https');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ContainerBuilder, MessageFlags, SeparatorBuilder, TextDisplayBuilder } = require('discord.js');

loadEnv();

const PORT = Number(process.env.PORT || 3000);
const CLIENT_ID = process.env.DISCORD_CLIENT_ID || '1550251663259082784';
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || `http://localhost:${PORT}/auth/callback`;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-this-session-secret';
const dataDirectory = path.join(__dirname, 'data');
const sessionFile = path.join(dataDirectory, 'sessions.json');
const linkedUsersFile = path.join(dataDirectory, 'linked-users.json');
const activationFile = path.join(dataDirectory, 'bot-activations.json');
const configFile = path.join(dataDirectory, 'guild-config.json');
const transcriptDirectory = path.join(dataDirectory, 'transcripts');
const publicDirectory = path.join(__dirname, 'public');

fs.mkdirSync(dataDirectory, { recursive: true });
fs.mkdirSync(transcriptDirectory, { recursive: true });
let sessions = readSessions();

function loadEnv() {
  const envFile = path.join(__dirname, '.env');
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

function readSessions() {
  try { return JSON.parse(fs.readFileSync(sessionFile, 'utf8')); } catch { return {}; }
}

function saveSessions() {
  fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, 2));
}

function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }
function saveJson(file, value) { fs.writeFileSync(file, JSON.stringify(value, null, 2)); }
function snowflakeDate(id) { return new Date(Number((BigInt(id) >> 22n) + 1420070400000n)); }
function upsertLinkedUser(user, linkedAt, guilds) { const users = readJson(linkedUsersFile, []); const next = { id: user.id, username: user.global_name || user.username, tag: user.username, avatar: user.avatar || null, createdAt: snowflakeDate(user.id).toISOString(), linkedAt, guilds: guilds.map((guild) => ({ id: guild.id, name: guild.name, icon: guild.icon || null })) }; const index = users.findIndex((item) => item.id === user.id); if (index >= 0) users[index] = { ...users[index], ...next }; else users.push(next); saveJson(linkedUsersFile, users); }
function adminAuthorized(request) { return (request.headers['x-lylo-admin'] || '') === (process.env.ADMIN_PANEL_PASSWORD || 'Lylo2026botv2'); }
function controlError(response) { return sendJson(response, 401, { error: 'Contraseña incorrecta.' }); }
function welcomeDmContainer(user) { return new ContainerBuilder().setAccentColor(0x1468e8).addTextDisplayComponents(new TextDisplayBuilder().setContent(`# VINCULACION\n\nGracias por vincularme con tu cuenta ${user.global_name || user.username}\n\n**Seguridad:**\n> No hacemos robo cuentas\n> No hacemos robo de servidores de discord, o raideos\n\nTu vinculación con nosotros solamente es para que puedas configurar los bots a tu gustos desde el panel que sale en la esquina de la pagina`)).addSeparatorComponents(new SeparatorBuilder().setDivider(true)).addActionRowComponents(new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Abrir Dashboard').setStyle(ButtonStyle.Link).setURL('https://site-wudf.onrender.com/'))); }
async function sendLinkDm(user) { const channel = await discordRequest('https://discord.com/api/v10/users/@me/channels', { method: 'POST', headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' } }, JSON.stringify({ recipient_id: user.id })); return discordRequest(`https://discord.com/api/v10/channels/${channel.id}/messages`, { method: 'POST', headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' } }, JSON.stringify({ flags: MessageFlags.IsComponentsV2, components: [welcomeDmContainer(user).toJSON()] })); }

function readGuildConfig() {
  try { return JSON.parse(fs.readFileSync(configFile, 'utf8')); } catch { return {}; }
}

function saveGuildConfig(config) {
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; if (body.length > 1000000) request.destroy(); });
    request.on('end', () => { try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); } });
    request.on('error', reject);
  });
}

function parseCookies(request) {
  return Object.fromEntries((request.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const index = part.indexOf('=');
    return [part.slice(0, index).trim(), decodeURIComponent(part.slice(index + 1).trim())];
  }));
}

function sign(value) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(value).digest('hex');
}

function sessionKey() {
  return crypto.createHash('sha256').update(SESSION_SECRET).digest();
}

function encodeSession(session) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', sessionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(session), 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url');
}

function decodeSession(value) {
  try {
    const payload = Buffer.from(value, 'base64url');
    if (payload.length < 28) return null;
    const decipher = crypto.createDecipheriv('aes-256-gcm', sessionKey(), payload.subarray(0, 12));
    decipher.setAuthTag(payload.subarray(12, 28));
    return JSON.parse(Buffer.concat([decipher.update(payload.subarray(28)), decipher.final()]).toString('utf8'));
  } catch {
    return null;
  }
}

function createSession(session) {
  const id = crypto.randomBytes(24).toString('hex');
  const value = { ...session, createdAt: Date.now() };
  sessions[id] = value;
  saveSessions();
  return `v2.${encodeSession(value)}`;
}

function getSession(request) {
  const value = parseCookies(request).lylo_session || '';
  if (value.startsWith('v2.')) {
    const session = decodeSession(value.slice(3));
    return session ? { ...session } : null;
  }
  const [id, signature] = value.split('.');
  const expectedSignature = sign(id || '');
  if (!id || !signature || signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature)) || !sessions[id]) return null;
  return { id, ...sessions[id] };
}

function sendJson(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function redirect(response, location, cookie) {
  response.writeHead(302, { Location: location, ...(cookie ? { 'Set-Cookie': cookie } : {}) });
  response.end();
}

function discordRequest(url, options = {}, body) {
  return new Promise((resolve, reject) => {
    const request = https.request(url, { ...options, headers: { Accept: 'application/json', 'User-Agent': 'Lylo/1.0 (Discord bot dashboard)', ...(options.headers || {}) } }, (response) => {
      let data = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        let parsed;
        try { parsed = data ? JSON.parse(data) : {}; } catch { parsed = { raw: data }; }
        if (response.statusCode >= 400) return reject(new Error(parsed.message || `Discord returned ${response.statusCode}`));
        resolve(parsed);
      });
    });
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });
}

function getDiscordUser(token) {
  return discordRequest('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bearer ${token}` } });
}

function getBotGuilds() {
  if (!BOT_TOKEN) return Promise.resolve([]);
  return discordRequest('https://discord.com/api/v10/users/@me/guilds', { headers: { Authorization: `Bot ${BOT_TOKEN}` } });
}

function getUserGuilds(token) {
  return discordRequest('https://discord.com/api/v10/users/@me/guilds', { headers: { Authorization: `Bearer ${token}` } });
}

async function getUserGuildsForSession(session, response) {
  try {
    return await getUserGuilds(session.token);
  } catch (error) {
    if (!session.refreshToken || !/401|unauthorized|invalid token/i.test(error.message)) throw error;
    const body = new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET || '', grant_type: 'refresh_token', refresh_token: session.refreshToken }).toString();
    const token = await discordRequest('https://discord.com/api/v10/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, body);
    session.token = token.access_token;
    session.refreshToken = token.refresh_token || session.refreshToken;
    const refreshedCookie = createSession(session);
    response.setHeader('Set-Cookie', `lylo_session=${refreshedCookie}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`);
    return getUserGuilds(session.token);
  }
}

async function getManageableGuild(session, guildId) {
  const guilds = await getUserGuilds(session.token);
  const guild = guilds.find((item) => item.id === guildId);
  if (!guild || !guild.owner) throw new Error('Not allowed');
  return guild;
}

function botApi(pathname, options = {}) {
  return discordRequest(`https://discord.com/api/v10${pathname}`, { ...options, headers: { Authorization: `Bot ${BOT_TOKEN}`, ...(options.headers || {}) } });
}

function serveFile(response, filename, contentType) {
  const filePath = path.join(publicDirectory, filename);
  if (!fs.existsSync(filePath)) return sendJson(response, 404, { error: 'Not found' });
  response.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
  try {
    if (url.pathname === '/auth/discord') {
      if (!CLIENT_SECRET) return redirect(response, '/?error=missing_config');
      const state = crypto.randomBytes(18).toString('hex');
      const query = new URLSearchParams({ client_id: CLIENT_ID, redirect_uri: REDIRECT_URI, response_type: 'code', scope: 'identify guilds', state });
      return redirect(response, `https://discord.com/oauth2/authorize?${query}`, `lylo_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`);
    }

    if (url.pathname === '/auth/callback') {
      const cookies = parseCookies(request);
      if (url.searchParams.get('error')) return redirect(response, `/?error=${encodeURIComponent(url.searchParams.get('error_description') || url.searchParams.get('error'))}`);
      if (!url.searchParams.get('code') || url.searchParams.get('state') !== cookies.lylo_oauth_state) return redirect(response, '/?error=oauth_state');
      const body = new URLSearchParams({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET || '', grant_type: 'authorization_code', code: url.searchParams.get('code'), redirect_uri: REDIRECT_URI }).toString();
      const token = await discordRequest('https://discord.com/api/v10/oauth2/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } }, body);
      const user = await getDiscordUser(token.access_token);
      const linkedAt = new Date().toISOString();
      const userGuilds = await getUserGuilds(token.access_token);
      upsertLinkedUser(user, linkedAt, userGuilds);
      try { await sendLinkDm(user); } catch (error) { console.error('No se pudo enviar el DM de vinculación:', error.message); }
      const sessionCookie = createSession({ token: token.access_token, refreshToken: token.refresh_token, user });
      return redirect(response, '/', `lylo_session=${sessionCookie}; HttpOnly; SameSite=Lax; Path=/; Max-Age=31536000; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`);
    }

    if (url.pathname === '/api/me') {
      const session = getSession(request);
      return sendJson(response, 200, { authenticated: Boolean(session), user: session?.user || null });
    }

    if (url.pathname === '/api/control/users') {
      if (!adminAuthorized(request)) return controlError(response);
      const users = readJson(linkedUsersFile, []);
      const botGuilds = await getBotGuilds();
      const botById = new Map(botGuilds.map((guild) => [guild.id, guild]));
      const refreshedUsers = await Promise.all(users.map(async (user) => {
        const activeSession = Object.values(sessions).find((session) => session.user?.id === user.id);
        if (!activeSession?.token) return user;
        try {
          const guilds = await getUserGuilds(activeSession.token);
          const next = { ...user, guilds: guilds.map((guild) => ({ id: guild.id, name: guild.name, icon: guild.icon || null })) };
          const index = users.findIndex((item) => item.id === user.id);
          if (index >= 0) users[index] = next;
          return next;
        } catch (error) {
          console.error(`No se pudieron actualizar los servidores de ${user.id}:`, error.message);
          return user;
        }
      }));
      saveJson(linkedUsersFile, users);
      const linkedUsers = refreshedUsers.map((user) => ({
        ...user,
        guilds: (user.guilds || [])
          .filter((guild) => botById.has(guild.id))
          .map((guild) => {
            const botGuild = botById.get(guild.id);
            return {
              ...guild,
              name: botGuild.name || guild.name,
              link: botGuild.vanity_url_code ? `https://discord.gg/${botGuild.vanity_url_code}` : `https://discord.com/channels/${guild.id}`
            };
          })
      }));
      return sendJson(response, 200, { users: linkedUsers });
    }
    if (url.pathname === '/api/control/servers') { if (!adminAuthorized(request)) return controlError(response); return sendJson(response, 200, { servers: readJson(activationFile, []) }); }
    if (url.pathname.startsWith('/api/control/servers/') && request.method === 'DELETE') { if (!adminAuthorized(request)) return controlError(response); const guildId = url.pathname.split('/').pop(); await botApi(`/users/@me/guilds/${guildId}`, { method: 'DELETE' }); return sendJson(response, 200, { removed: guildId }); }

    if (url.pathname === '/api/guilds') {
      const session = getSession(request);
      if (!session) return sendJson(response, 401, { error: 'Not authenticated' });
      const [userGuilds, botGuilds] = await Promise.all([getUserGuildsForSession(session, response), getBotGuilds()]);
      const botIds = new Set(botGuilds.map((guild) => guild.id));
      return sendJson(response, 200, { guilds: userGuilds.filter((guild) => guild.owner && botIds.has(guild.id)) });
    }

    if (url.pathname === '/api/guild-config' && request.method === 'GET') {
      const session = getSession(request);
      const guildId = url.searchParams.get('guildId');
      if (!session || !guildId) return sendJson(response, 401, { error: 'Not authenticated' });
      await getManageableGuild(session, guildId);
      const [channels, roles] = await Promise.all([botApi(`/guilds/${guildId}/channels`), botApi(`/guilds/${guildId}/roles`)]);
      return sendJson(response, 200, { config: readGuildConfig()[guildId] || {}, channels: channels.filter((channel) => channel.type === 0 || channel.type === 4), roles: roles.filter((role) => role.name !== '@everyone') });
    }

    if (url.pathname === '/api/guild-config' && request.method === 'PUT') {
      const session = getSession(request);
      const body = await readBody(request);
      if (!session || !body.guildId) return sendJson(response, 401, { error: 'Not authenticated' });
      await getManageableGuild(session, body.guildId);
      const config = readGuildConfig();
      const previous = config[body.guildId] || {};
      if (!Array.isArray(body.buttons) || !body.buttons.some((button) => String(button.label || '').trim())) return sendJson(response, 400, { error: 'Debes conservar al menos un botón de ticket.' });
      if (body.buttons.some((button) => !String(button.categoryId || '').trim())) return sendJson(response, 400, { error: 'Cada botón debe tener una categoría de Discord.' });
      config[body.guildId] = {
        ...previous,
        activated: previous.activated === true,
        welcome: {
          enabled: body.welcome?.enabled === true,
          channelId: String(body.welcome?.channelId || '').slice(0, 30),
          roleId: String(body.welcome?.roleId || '').slice(0, 30),
          message: String(body.welcome?.message || 'Bienvenido {user} a {server}.').slice(0, 1000),
          colorEnabled: body.welcome?.colorEnabled === true,
          color: ['none', 'blue', 'green', 'red', 'gold', 'pink'].includes(body.welcome?.color) ? body.welcome.color : 'none',
          separator: body.welcome?.separator !== false
        },
        staffRoleId: String(body.staffRoleId || ''),
        founderRoleId: String(body.founderRoleId || ''),
        ticketModerationRoleIds: Array.isArray(body.ticketModerationRoleIds) ? body.ticketModerationRoleIds.map((roleId) => String(roleId)).filter(Boolean).slice(0, 20) : [],
        logChannelId: String(body.logChannelId || ''),
        panelTitle: String(body.panelTitle || 'SOPORTE').slice(0, 80),
        panelDescription: String(body.panelDescription || 'Espera que te responda un staff').slice(0, 1000),
        panelEmoji: String(body.panelEmoji || '').slice(0, 100),
        panelColor: ['none', 'blue', 'green', 'red', 'gold', 'pink'].includes(body.panelColor) ? body.panelColor : 'none',
        ticketQuestion: String(body.ticketQuestion || 'Motivo del cierre del ticket').slice(0, 200),
        ticketModal: body.ticketModal === true,
        ticketColorEnabled: body.ticketColorEnabled === true,
        ticketColor: ['none', 'blue', 'green', 'gold', 'pink'].includes(body.ticketColor) ? body.ticketColor : 'blue',
        ticketCloseLog: String(body.ticketCloseLog || 'Ticket cerrado por {usercierre}.').slice(0, 1000),
        ticketCloseLogColorEnabled: body.ticketCloseLogColorEnabled === true,
        ticketCloseLogColor: ['none', 'blue', 'green', 'red', 'gold', 'pink'].includes(body.ticketCloseLogColor) ? body.ticketCloseLogColor : 'none',
        lines: Array.isArray(body.lines) ? body.lines.map((line) => String(line).trim()).filter(Boolean).slice(0, 20) : [],
        buttons: Array.isArray(body.buttons) ? body.buttons.map((button, index) => ({ id: String(button.id || `button-${index + 1}`).replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || `button-${index + 1}`, emoji: String(button.emoji || '').slice(0, 100), label: String(button.label || '').trim().slice(0, 80), categoryId: String(button.categoryId || '') })).filter((button) => button.label).slice(0, 25) : [],
        antiRaid: {
          enabled: body.antiRaid?.enabled === true,
          windowSeconds: Math.min(300, Math.max(5, Number(body.antiRaid?.windowSeconds) || 30)),
          maxJoins: Math.min(100, Math.max(2, Number(body.antiRaid?.maxJoins) || 5)),
          timeoutSeconds: Math.min(3600, Math.max(5, Number(body.antiRaid?.timeoutSeconds) || 600))
        },
        antiSpam: {
          enabled: body.antiSpam?.enabled === true,
          windowSeconds: Math.min(60, Math.max(2, Number(body.antiSpam?.windowSeconds) || 8)),
          maxMessages: Math.min(30, Math.max(2, Number(body.antiSpam?.maxMessages) || 5)),
          timeoutSeconds: Math.min(3600, Math.max(5, Number(body.antiSpam?.timeoutSeconds) || 60))
        },
        antiLink: { enabled: body.antiLink?.enabled === true },
        logs: {
          channelId: String(body.logs?.channelId || body.logChannelId || ''),
          memberJoins: body.logs?.memberJoins !== false,
          moderation: body.logs?.moderation !== false,
          messages: body.logs?.messages === true,
          tickets: body.logs?.tickets !== false,
          templates: {
            memberJoin: String(body.logs?.templates?.memberJoin || 'Nuevo miembro: {user}').slice(0, 300),
            antiRaid: String(body.logs?.templates?.antiRaid || 'Anti-raid activado para {user}').slice(0, 300),
            antiSpam: String(body.logs?.templates?.antiSpam || 'Anti-spam: {user} superó el límite').slice(0, 300),
            antiLink: String(body.logs?.templates?.antiLink || 'Enlace eliminado de {user}').slice(0, 300),
            message: String(body.logs?.templates?.message || 'Mensaje de {user}: {content}').slice(0, 300)
          }
        }
      };
      saveGuildConfig(config);
      return sendJson(response, 200, { config: config[body.guildId] });
    }

    if (url.pathname === '/api/transcripts' && request.method === 'GET') {
      const session = getSession(request);
      const guildId = url.searchParams.get('guildId');
      if (!session || !guildId) return sendJson(response, 401, { error: 'Not authenticated' });
      await getManageableGuild(session, guildId);
      const files = fs.readdirSync(transcriptDirectory).filter((file) => file.startsWith(`${guildId}-`) && file.endsWith('.html')).sort().reverse();
      return sendJson(response, 200, { transcripts: files.map((file) => ({ file, url: `/api/transcripts/download?guildId=${encodeURIComponent(guildId)}&file=${encodeURIComponent(file)}` })) });
    }

    if (url.pathname === '/api/transcripts' && request.method === 'DELETE') {
      const session = getSession(request);
      const guildId = url.searchParams.get('guildId');
      const file = url.searchParams.get('file') || '';
      if (!session || !guildId || !/^[0-9]+-[0-9]+-[0-9]+\.html$/.test(file) || !file.startsWith(`${guildId}-`)) return sendJson(response, 401, { error: 'Not authorized' });
      await getManageableGuild(session, guildId);
      const filePath = path.join(transcriptDirectory, file);
      if (!fs.existsSync(filePath)) return sendJson(response, 404, { error: 'Transcript not found' });
      fs.unlinkSync(filePath);
      return sendJson(response, 200, { deleted: file });
    }

    if (url.pathname === '/api/transcripts/download' && request.method === 'GET') {
      const session = getSession(request);
      const guildId = url.searchParams.get('guildId');
      const file = url.searchParams.get('file') || '';
      if (!session || !guildId || !/^[0-9]+-[0-9]+-[0-9]+\.html$/.test(file) || !file.startsWith(`${guildId}-`)) return sendJson(response, 401, { error: 'Not authorized' });
      await getManageableGuild(session, guildId);
      const filePath = path.join(transcriptDirectory, file);
      if (!fs.existsSync(filePath)) return sendJson(response, 404, { error: 'Transcript not found' });
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Disposition': `attachment; filename="${file}"` });
      return fs.createReadStream(filePath).pipe(response);
    }

    if (url.pathname === '/logout') {
      const session = getSession(request);
      if (session) { delete sessions[session.id]; saveSessions(); }
      return redirect(response, '/', 'lylo_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    }

    if (url.pathname === '/' || url.pathname === '/index.html') return serveFile(response, 'index.html', 'text/html; charset=utf-8');
    if (url.pathname === '/admin.html') return serveFile(response, 'admin.html', 'text/html; charset=utf-8');
    if (url.pathname === '/administrar.html') return serveFile(response, 'administrar.html', 'text/html; charset=utf-8');
    if (url.pathname === '/control.html') return serveFile(response, 'control.html', 'text/html; charset=utf-8');
    if (url.pathname === '/styles.css') return serveFile(response, 'styles.css', 'text/css; charset=utf-8');
    if (url.pathname === '/app.js') return serveFile(response, 'app.js', 'text/javascript; charset=utf-8');
    if (url.pathname === '/admin.js') return serveFile(response, 'admin.js', 'text/javascript; charset=utf-8');
    if (url.pathname === '/administrar.js') return serveFile(response, 'administrar.js', 'text/javascript; charset=utf-8');
    if (url.pathname === '/control.js') return serveFile(response, 'control.js', 'text/javascript; charset=utf-8');
    if (url.pathname === '/bot-image.png') return serveFile(response, 'bot-image.png', 'image/png');
    sendJson(response, 404, { error: 'Not found' });
  } catch (error) {
    console.error(error.message);
    if (error.message === 'Not allowed') return sendJson(response, 403, { error: 'No tienes permiso para administrar este servidor. Necesitas ser propietario o tener Administrar servidor.' });
    if (/401|unauthorized|invalid token/i.test(error.message)) {
      if (url.pathname === '/auth/callback') return redirect(response, `/?error=oauth_failed&message=${encodeURIComponent(`Discord rechazó la vinculación: ${error.message}`)}`);
      const session = getSession(request);
      if (session) { delete sessions[session.id]; saveSessions(); }
      if (url.pathname.startsWith('/api/')) {
        response.setHeader('Set-Cookie', 'lylo_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
        return sendJson(response, 401, { error: 'La sesión de Discord expiró. Vuelve a vincular tu cuenta.' });
      }
      return redirect(response, '/?error=session_expired', 'lylo_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    }
    if (url.pathname.startsWith('/api/')) return sendJson(response, 500, { error: 'Discord is unavailable right now' });
    redirect(response, `/?error=oauth_failed&message=${encodeURIComponent(error.message || 'Error desconocido')}`);
  }
});

server.listen(PORT, () => console.log(`Lylo listening on http://localhost:${PORT}`));
