require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const COMMAND_ROLE_DEFINITIONS = [
  { name: 'addblock', label: '/addblock' },
  { name: 'blocklist', label: '/blocklist' },
  { name: 'removeblock', label: '/removeblock' },
  { name: 'rename', label: '/rename' },
  { name: 'setup:tickets', label: '/setup tickets' },
  { name: 'setup:honeypot', label: '/setup honeypot' },
  { name: 'clear', label: '/clear' },
  { name: 'unclaim', label: '/unclaim' }
];

const premiumAdminPassword = process.env.PREMIUM_ADMIN_PASSWORD || 'Ne26017462';
const discordGuildCache = new Map();
const discordGuildCacheMs = 10_000;

const app = express();
const port = Number(process.env.PORT || 3000);
const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectUri = process.env.DISCORD_REDIRECT_URI || `http://localhost:${port}/auth/callback`;
const sessionSecret = process.env.SESSION_SECRET;
const botApiUrl = String(process.env.BOT_API_URL || '').replace(/\/+$/, '');
const botApiSecret = process.env.BOT_API_SECRET;
const sessionFile = path.join(__dirname, 'data', 'sessions.json');

if (!clientId || !clientSecret || !sessionSecret || !botApiUrl || !botApiSecret) {
  console.error('Faltan DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, SESSION_SECRET, BOT_API_URL o BOT_API_SECRET en el entorno.');
  process.exit(1);
}

async function requestBotApi(action, body = {}) {
  const response = await fetch(`${botApiUrl}/internal/${encodeURIComponent(action)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${botApiSecret}` },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || 'bot_api_error');
    error.status = response.status;
    error.code = result.error;
    throw error;
  }
  return result;
}

async function respondWithBotApi(res, action, body = {}) {
  try {
    return res.json(await requestBotApi(action, body));
  } catch (error) {
    console.error(`Bot API request ${action} failed:`, error.message);
    const status = error.status && error.status < 500 ? error.status : 502;
    return res.status(status).json({ error: status === 502 ? 'bot_api_unavailable' : error.code || 'bot_api_error' });
  }
}

class JsonSessionStore extends session.Store {
  constructor(file) {
    super();
    this.file = file;
    const directory = path.dirname(file);
    if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
    try {
      this.sessions = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
      this.sessions = {};
    }
  }

  save(callback) {
    const directory = path.dirname(this.file);
    if (!fs.existsSync(directory)) fs.mkdirSync(directory, { recursive: true });
    fs.writeFile(this.file, JSON.stringify(this.sessions, null, 2), 'utf8', callback);
  }

  get(sessionId, callback) {
    const record = this.sessions[sessionId];
    if (!record) return callback(null, null);
    if (record.expiresAt && Date.now() > record.expiresAt) {
      delete this.sessions[sessionId];
      return this.save(() => callback(null, null));
    }
    callback(null, record.session);
  }

  set(sessionId, sessionData, callback) {
    const expiresAt = sessionData.cookie?.expires
      ? new Date(sessionData.cookie.expires).getTime()
      : Date.now() + 1000 * 60 * 60 * 24 * 365;
    this.sessions[sessionId] = { session: sessionData, expiresAt };
    this.save(callback);
  }

  touch(sessionId, sessionData, callback) {
    if (this.sessions[sessionId]) {
      this.sessions[sessionId].session = sessionData;
      this.sessions[sessionId].expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 365;
      return this.save(callback);
    }
    callback?.();
  }

  destroy(sessionId, callback) {
    delete this.sessions[sessionId];
    this.save(callback);
  }
}

app.use(session({
  secret: sessionSecret,
  store: new JsonSessionStore(sessionFile),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 1000 * 60 * 60 * 24 * 365 }
}));
app.use(express.json({ limit: '64kb' }));
const publicFiles = new Map([
  ['/', 'index.html'],
  ['/index.html', 'index.html'],
  ['/404.html', '404.html'],
  ['/configuracion.html', 'configuracion.html'],
  ['/gestion.html', 'gestion.html'],
  ['/idioma.html', 'idioma.html'],
  ['/panel.html', 'panel.html'],
  ['/policy.html', 'policy.html'],
  ['/premium.html', 'premium.html'],
  ['/terms.html', 'terms.html'],
  ['/styles.css', 'styles.css'],
  ['/script.js', 'script.js'],
  ['/configuracion.js', 'configuracion.js'],
  ['/gestion.js', 'gestion.js'],
  ['/idioma.js', 'idioma.js'],
  ['/panel.js', 'panel.js'],
  ['/premium.js', 'premium.js'],
  ['/BOTIMAGEN.png', 'BOTIMAGEN.png'],
  ['/DISCORD.png', 'DISCORD.png']
]);
app.use((req, res, next) => {
  const fileName = publicFiles.get(req.path);
  if (!fileName) return next();
  res.sendFile(path.join(__dirname, fileName));
});

app.get('/auth/login', (req, res) => {
  const state = crypto.randomBytes(24).toString('hex');
  req.session.oauthState = state;
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: 'identify guilds',
    state
  });
  res.redirect(`https://discord.com/oauth2/authorize?${params}`);
});

app.get('/auth/callback', async (req, res) => {
  const { code, state } = req.query;
  if (!code || !state || state !== req.session.oauthState) return res.status(400).send('OAuth state inválido. Vuelve a intentarlo.');
  delete req.session.oauthState;

  try {
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'authorization_code', code, redirect_uri: redirectUri })
    });
    if (!tokenResponse.ok) throw new Error('No se pudo obtener el token de Discord.');
    const token = await tokenResponse.json();

    const userResponse = await fetch('https://discord.com/api/users/@me', { headers: { Authorization: `${token.token_type} ${token.access_token}` } });
    if (!userResponse.ok) throw new Error('No se pudo obtener el perfil de Discord.');
    const user = await userResponse.json();
    req.session.user = {
      id: user.id,
      username: user.global_name || user.username,
      avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null,
      locale: user.locale || null,
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + (token.expires_in * 1000)
    };
    requestBotApi('sendLinkSuccessDm', { userId: user.id }).catch((error) => console.error('No se pudo enviar el DM de vinculación:', error.message));
    res.redirect('/');
  } catch (error) {
    console.error(error.message);
    res.status(502).send('No se pudo vincular la cuenta de Discord.');
  }
});

app.get('/api/me', (req, res) => res.json({ user: req.session.user || null }));

function requirePremiumAdmin(req, res, next) {
  if (!req.session.premiumAdmin) return res.status(401).json({ error: 'premium_admin_required' });
  next();
}

app.post('/api/premium/admin/login', (req, res) => {
  if (String(req.body?.password || '') !== premiumAdminPassword) return res.status(403).json({ error: 'invalid_password' });
  req.session.premiumAdmin = true;
  req.session.save(() => res.json({ ok: true }));
});

app.get('/api/premium/keys', requirePremiumAdmin, (req, res) => {
  return respondWithBotApi(res, 'premiumKeysList');
});

app.post('/api/premium/keys', requirePremiumAdmin, (req, res) => {
  return respondWithBotApi(res, 'premiumKeyCreate', { duration: req.body?.duration });
});

app.delete('/api/premium/keys/:key', requirePremiumAdmin, (req, res) => {
  return respondWithBotApi(res, 'premiumKeyDelete', { key: req.params.key });
});

app.post('/api/premium/customizations/restore', requirePremiumAdmin, (req, res) => {
  return respondWithBotApi(res, 'premiumRestoreCustomizations');
});

app.post('/api/premium/config/reset', requirePremiumAdmin, (req, res) => {
  return respondWithBotApi(res, 'premiumConfigReset');
});

async function getDiscordUserGuilds(req) {
  const user = req.session.user;
  if (!user?.accessToken) return null;

  const cached = discordGuildCache.get(user.id);
  if (cached?.guilds && cached.expiresAt > Date.now()) return cached.guilds;
  if (cached?.pending) return cached.pending;

  const pending = (async () => {
    if (user.expiresAt && Date.now() >= user.expiresAt && user.refreshToken) {
      const refreshResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: 'refresh_token', refresh_token: user.refreshToken })
      });
      if (refreshResponse.ok) {
        const refreshed = await refreshResponse.json();
        user.accessToken = refreshed.access_token;
        user.refreshToken = refreshed.refresh_token || user.refreshToken;
        user.expiresAt = Date.now() + (refreshed.expires_in * 1000);
        await new Promise((resolve) => req.session.save(resolve));
      }
    }

    const response = await fetch('https://discord.com/api/users/@me/guilds', { headers: { Authorization: `Bearer ${user.accessToken}` } });
    if (!response.ok) return null;
    return response.json();
  })();
  discordGuildCache.set(user.id, { pending });

  try {
    const guilds = await pending;
    if (!guilds) {
      discordGuildCache.delete(user.id);
      return null;
    }
    discordGuildCache.set(user.id, { guilds, expiresAt: Date.now() + discordGuildCacheMs });
    return guilds;
  } catch (error) {
    discordGuildCache.delete(user.id);
    throw error;
  }
}

app.get('/api/manage-servers', async (req, res) => {
  try {
    const guilds = await getDiscordUserGuilds(req);
    if (!guilds) return res.status(401).json({ error: 'login_required' });
    const manageableGuilds = guilds
      .filter((guild) => {
        const permissions = BigInt(guild.permissions || 0);
        return (permissions & 0x8n) !== 0n || (permissions & 0x20n) !== 0n;
      });
    const { statuses = {} } = await requestBotApi('guildStatuses', { guildIds: manageableGuilds.map((guild) => guild.id) });
    res.json({ guilds: manageableGuilds.map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : null,
        botAdded: Boolean(statuses[guild.id]?.botAdded)
      })) });
  } catch (error) {
    console.error('No se pudieron cargar los servidores administrables:', error.message);
    res.status(502).json({ error: 'guilds_unavailable' });
  }
});

app.get('/api/owned-servers', async (req, res) => {
  try {
    const guilds = await getDiscordUserGuilds(req);
    if (!guilds) return res.status(401).json({ error: 'login_required' });
    const ownedGuilds = guilds.filter((guild) => guild.owner === true);
    const { statuses = {} } = await requestBotApi('guildStatuses', { guildIds: ownedGuilds.map((guild) => guild.id) });
    res.json({ guilds: ownedGuilds.map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : null,
      botAdded: Boolean(statuses[guild.id]?.botAdded),
      language: statuses[guild.id]?.language || 'es'
    })) });
  } catch (error) {
    console.error('No se pudieron cargar los servidores propios:', error.message);
    res.status(502).json({ error: 'guilds_unavailable' });
  }
});

app.put('/api/guild-language/:guildId', async (req, res) => {
  try {
    const language = String(req.body?.language || '');
    const guilds = await getDiscordUserGuilds(req);
    if (!guilds) return res.status(401).json({ error: 'login_required' });
    const guildId = req.params.guildId;
    if (!guilds.some((guild) => guild.id === guildId && guild.owner === true)) return res.status(403).json({ error: 'owner_required' });
    return await respondWithBotApi(res, 'guildLanguageChange', { guildId, language });
  } catch (error) {
    console.error('No se pudo cambiar el idioma del servidor:', error.message);
    res.status(502).json({ error: 'language_update_failed' });
  }
});

async function canManageGuild(req, guildId) {
  const guilds = await getDiscordUserGuilds(req);
  const guild = guilds?.find((item) => item.id === guildId);
  if (!guild) return false;
  if (guild.owner === true) return true;
  const permissions = BigInt(guild.permissions || 0);
  return (permissions & 0x8n) !== 0n || (permissions & 0x20n) !== 0n;
}

app.get('/api/command-definitions', (req, res) => {
  res.json({ commands: COMMAND_ROLE_DEFINITIONS });
});

app.get('/api/guild-config/:guildId', async (req, res) => {
  try {
    if (!(await canManageGuild(req, req.params.guildId))) return res.status(403).json({ error: 'forbidden' });
    return await respondWithBotApi(res, 'guildConfigGet', { guildId: req.params.guildId });
  } catch (error) {
    res.status(502).json({ error: 'guild_unavailable' });
  }
});

app.get('/api/guild-options/:guildId', async (req, res) => {
  try {
    if (!(await canManageGuild(req, req.params.guildId))) return res.status(403).json({ error: 'forbidden' });
    return await respondWithBotApi(res, 'guildOptions', { guildId: req.params.guildId });
  } catch (error) {
    res.status(502).json({ error: 'guild_options_unavailable' });
  }
});

app.get('/api/guild-welcome/:guildId', async (req, res) => {
  try {
    if (!(await canManageGuild(req, req.params.guildId))) return res.status(403).json({ error: 'forbidden' });
    return await respondWithBotApi(res, 'guildWelcomeGet', { guildId: req.params.guildId });
  } catch (error) {
    res.status(502).json({ error: 'welcome_config_unavailable' });
  }
});

app.put('/api/guild-welcome/:guildId', async (req, res) => {
  try {
    const guildId = req.params.guildId;
    if (!(await canManageGuild(req, guildId))) return res.status(403).json({ error: 'forbidden' });
    return await respondWithBotApi(res, 'guildWelcomeSave', { guildId, body: req.body || {} });
  } catch (error) {
    console.error('No se pudo guardar la configuración de bienvenida:', error.message);
    res.status(502).json({ error: 'welcome_config_save_failed' });
  }
});

app.put('/api/guild-config/:guildId', async (req, res) => {
  try {
    if (!(await canManageGuild(req, req.params.guildId))) return res.status(403).json({ error: 'forbidden' });
    return await respondWithBotApi(res, 'guildConfigSave', { guildId: req.params.guildId, body: req.body || {} });
  } catch (error) {
    console.error(`No se pudo guardar la configuración de tickets para ${req.params.guildId}:`, error.message);
    res.status(502).json({ error: 'config_save_failed' });
  }
});

app.get('/api/communities', async (req, res) => {
  try {
    const { communities = [] } = await requestBotApi('communities');
    if (!communities.length) return res.status(404).json({ communities: [] });
    res.json({ communities });
  } catch (error) {
    console.error('No se pudieron cargar las comunidades:', error.message);
    res.status(502).json({ communities: [] });
  }
});

app.post('/auth/logout', async (req, res) => {
  const user = req.session.user;
  const loginUrl = new URL('/auth/login', process.env.PUBLIC_URL || new URL(redirectUri).origin).toString();
  let resetGuilds = 0;
  let guilds = null;
  if (user?.id) {
    try {
      guilds = await getDiscordUserGuilds(req);
      const manageableGuilds = (guilds || []).filter((guild) => {
        const permissions = BigInt(guild.permissions || 0);
        return guild.owner === true || (permissions & (0x8n | 0x20n)) !== 0n;
      });
      const result = await requestBotApi('resetGuilds', { guildIds: manageableGuilds.map((guild) => guild.id) });
      resetGuilds = result.resetCount;
    } catch (error) {
      console.warn('No se pudo comprobar los servidores para restablecer la configuración al desvincular:', error.message);
    }
  }
  const finishLogout = () => req.session.destroy(() => res.json({ ok: true, resetGuilds, configurationReset: !user?.id || Boolean(guilds) }));
  if (!user?.id) return finishLogout();
  requestBotApi('sendUnlinkSuccessDm', { userId: user.id, loginUrl })
    .catch((error) => console.warn(`No se pudo enviar el DM de desvinculación a ${user.id}:`, error.message))
    .finally(finishLogout);
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(port, () => console.log(`Lylo web disponible en http://localhost:${port}`));
