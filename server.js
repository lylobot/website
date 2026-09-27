require('dotenv').config();

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const session = require('express-session');
const { MessageFlags } = require('discord.js');
const { startBot, getBotClient, sendLinkSuccessDm, sendUnlinkSuccessDm } = require('./bot/bot');
const { getConfig, setConfig, ticketPanel } = require('./bot/lib/tickets');
const { getWelcomeConfig, saveWelcomeConfig } = require('./bot/lib/welcome');
const { listGuildIds, resetGuildSettings } = require('./bot/lib/guild-settings');
const { COMMAND_ROLE_KEYS, COMMAND_ROLE_DEFINITIONS } = require('./bot/lib/moderation');
const { LANGUAGE_OPTIONS } = require('./bot/lib/i18n');
const { DURATIONS, generateKey, listAllKeys, removeKey, restoreAllGuildCustomizations } = require('./bot/lib/premium');

const premiumAdminPassword = process.env.PREMIUM_ADMIN_PASSWORD || 'Ne26017462';
const discordGuildCache = new Map();
const discordGuildCacheMs = 10_000;

function sanitizeEmoji(value) {
  const emoji = String(value || '').trim();
  if (!emoji) return '';
  if (/^<a?:[\w~]+:\d{17,20}>$/.test(emoji)) return emoji;
  return emoji.includes('<') || emoji.includes('>') || emoji.startsWith(':') ? '' : emoji.slice(0, 10);
}
function sanitizeColor(value, fallback = null) {
  const color = String(value || '').trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : fallback;
}

const app = express();
const port = Number(process.env.PORT || 3000);
const clientId = process.env.DISCORD_CLIENT_ID;
const clientSecret = process.env.DISCORD_CLIENT_SECRET;
const redirectUri = process.env.DISCORD_REDIRECT_URI || `http://localhost:${port}/auth/callback`;
const sessionSecret = process.env.SESSION_SECRET;
const sessionFile = path.join(__dirname, 'data', 'sessions.json');

if (!clientId || !clientSecret || !sessionSecret) {
  console.error('Faltan DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET o SESSION_SECRET en .env');
  process.exit(1);
}

startBot();

function getCommunities() {
  const discordClient = getBotClient();
  if (!discordClient) return [];
  return discordClient.guilds.cache.map((guild) => ({
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL({ extension: 'png', size: 128 }),
    memberCount: guild.memberCount || 0
  }));
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
    sendLinkSuccessDm(user.id).catch((error) => console.error('No se pudo enviar el DM de vinculación:', error.message));
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
  const now = Date.now();
  const keys = listAllKeys().filter((record) => !record.expiresAt || record.expiresAt > now).map((record) => ({
    key: record.key,
    duration: record.duration,
    used: Boolean(record.used),
    guildId: record.guildId,
    userId: record.userId,
    expiresAt: record.expiresAt
  }));
  res.json({ keys });
});

app.post('/api/premium/keys', requirePremiumAdmin, (req, res) => {
  const duration = String(req.body?.duration || '');
  if (!Object.hasOwn(DURATIONS, duration)) return res.status(400).json({ error: 'invalid_duration' });
  res.json({ key: generateKey(duration), duration });
});

app.delete('/api/premium/keys/:key', requirePremiumAdmin, async (req, res) => {
  try {
    if (!await removeKey(req.params.key, getBotClient())) return res.status(404).json({ error: 'key_not_found' });
    res.json({ ok: true });
  } catch (error) {
    console.error('No se pudo eliminar la key y restaurar el perfil Premium:', error.message);
    res.status(502).json({ error: 'customization_restore_failed' });
  }
});

app.post('/api/premium/customizations/restore', requirePremiumAdmin, async (req, res) => {
  const bot = getBotClient();
  if (!bot?.isReady()) return res.status(503).json({ error: 'bot_unavailable' });
  const result = await restoreAllGuildCustomizations(bot);
  res.json({ ok: result.failedGuildIds.length === 0, restoredCount: result.restoredGuildIds.length, failedGuildIds: result.failedGuildIds });
});

app.post('/api/premium/config/reset', requirePremiumAdmin, async (req, res) => {
  const bot = getBotClient();
  const result = { resetCount: 0, ticketPanelsUpdated: 0, honeypotPanelsRemoved: 0, failedGuildIds: [] };

  for (const guildId of listGuildIds()) {
    try {
      const { ticketPanelMessageIds, honeypotConfig } = resetGuildSettings(guildId, 'es');
      result.resetCount += 1;
      const config = getConfig(guildId);
      if (!bot?.isReady() || !bot.guilds.cache.has(guildId)) continue;

      for (const panel of ticketPanelMessageIds) {
        try {
          const channel = await bot.channels.fetch(panel.channelId);
          const message = await channel.messages.fetch(panel.messageId);
          await message.edit({ components: [ticketPanel(config)], flags: MessageFlags.IsComponentsV2 });
          result.ticketPanelsUpdated += 1;
        } catch (error) {
          if (error.code !== 10008 && error.code !== 10003) {
            result.failedGuildIds.push(guildId);
            console.error(`No se pudo restablecer un panel de tickets en ${guildId}:`, error.message);
          }
        }
      }

      if (honeypotConfig.channelId && honeypotConfig.panelMessageId) {
        try {
          const channel = await bot.channels.fetch(honeypotConfig.channelId);
          const panel = await channel.messages.fetch(honeypotConfig.panelMessageId);
          await panel.delete();
          result.honeypotPanelsRemoved += 1;
        } catch (error) {
          if (error.code !== 10008 && error.code !== 10003) {
            result.failedGuildIds.push(guildId);
            console.error(`No se pudo retirar el panel honeypot de ${guildId}:`, error.message);
          }
        }
      }
    } catch (error) {
      result.failedGuildIds.push(guildId);
      console.error(`No se pudo restablecer toda la configuración de ${guildId}:`, error.message);
    }
  }

  result.failedGuildIds = [...new Set(result.failedGuildIds)];
  res.json({ ok: result.failedGuildIds.length === 0, ...result, premiumPreserved: true });
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
      })
      .map((guild) => ({
        id: guild.id,
        name: guild.name,
        icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : null,
        botAdded: Boolean(getBotClient()?.guilds.cache.has(guild.id))
      }));
    res.json({ guilds: manageableGuilds });
  } catch (error) {
    console.error('No se pudieron cargar los servidores administrables:', error.message);
    res.status(502).json({ error: 'guilds_unavailable' });
  }
});

app.get('/api/owned-servers', async (req, res) => {
  try {
    const guilds = await getDiscordUserGuilds(req);
    if (!guilds) return res.status(401).json({ error: 'login_required' });
    const bot = getBotClient();
    const ownedGuilds = guilds.filter((guild) => guild.owner === true).map((guild) => ({
      id: guild.id,
      name: guild.name,
      icon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : null,
      botAdded: Boolean(bot?.guilds.cache.has(guild.id)),
      language: getConfig(guild.id)?.language || 'es'
    }));
    res.json({ guilds: ownedGuilds });
  } catch (error) {
    console.error('No se pudieron cargar los servidores propios:', error.message);
    res.status(502).json({ error: 'guilds_unavailable' });
  }
});

app.put('/api/guild-language/:guildId', async (req, res) => {
  try {
    const language = String(req.body?.language || '');
    if (!LANGUAGE_OPTIONS.some((option) => option.code === language)) return res.status(400).json({ error: 'invalid_language' });
    const guilds = await getDiscordUserGuilds(req);
    if (!guilds) return res.status(401).json({ error: 'login_required' });
    const guildId = req.params.guildId;
    if (!guilds.some((guild) => guild.id === guildId && guild.owner === true)) return res.status(403).json({ error: 'owner_required' });

    const { honeypotConfig } = require('./bot/lib/guild-settings').resetGuildSettings(guildId, language);
    const config = getConfig(guildId);
    let commandsSynced = false;
    let ticketPanelsSynced = 0;
    const bot = getBotClient();
    if (bot?.isReady() && bot.guilds.cache.has(guildId)) {
      try {
        await bot.syncGuildCommands(guildId);
        commandsSynced = true;
      } catch (error) {
        console.error(`No se pudieron actualizar los comandos de ${guildId}:`, error.message);
      }
      const panelsStillAvailable = [];
      for (const panel of config.ticketPanelMessageIds) {
        try {
          const channel = await bot.channels.fetch(panel.channelId);
          const message = await channel.messages.fetch(panel.messageId);
          await message.edit({ components: [ticketPanel(config)], flags: MessageFlags.IsComponentsV2 });
          panelsStillAvailable.push(panel);
          ticketPanelsSynced += 1;
        } catch (error) {
          if (error.code !== 10008 && error.code !== 10003) {
            panelsStillAvailable.push(panel);
            console.error(`No se pudo actualizar un panel de tickets en ${guildId}:`, error.message);
          }
        }
      }
      config.ticketPanelMessageIds = panelsStillAvailable;
      setConfig(guildId, config);
      if (honeypotConfig.channelId && honeypotConfig.panelMessageId) {
        try {
          const channel = await bot.channels.fetch(honeypotConfig.channelId);
          const panelMessage = await channel.messages.fetch(honeypotConfig.panelMessageId);
          await panelMessage.delete();
        } catch (error) {
          if (error.code !== 10008 && error.code !== 10003) console.warn(`No se pudo retirar el panel honeypot anterior de ${guildId}:`, error.message);
        }
      }
    }
    res.json({ ok: true, language, commandsSynced, ticketPanelsSynced, botAdded: Boolean(bot?.guilds.cache.has(guildId)) });
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
    res.json({ config: getConfig(req.params.guildId) || null });
  } catch (error) {
    res.status(502).json({ error: 'guild_unavailable' });
  }
});

app.get('/api/guild-options/:guildId', async (req, res) => {
  try {
    if (!(await canManageGuild(req, req.params.guildId))) return res.status(403).json({ error: 'forbidden' });
    const guild = getBotClient()?.guilds.cache.get(req.params.guildId);
    if (!guild) return res.status(404).json({ error: 'bot_not_added' });
    const roles = guild.roles.cache.filter((role) => role.id !== guild.id && !role.managed).map((role) => ({ id: role.id, name: role.name }));
    const categories = guild.channels.cache.filter((channel) => channel.type === 4).map((channel) => ({ id: channel.id, name: channel.name }));
    const channels = guild.channels.cache.filter((channel) => channel.isTextBased() && channel.type !== 4).map((channel) => ({ id: channel.id, name: channel.name }));
    res.json({ roles, categories, channels });
  } catch (error) {
    res.status(502).json({ error: 'guild_options_unavailable' });
  }
});

app.get('/api/guild-welcome/:guildId', async (req, res) => {
  try {
    if (!(await canManageGuild(req, req.params.guildId))) return res.status(403).json({ error: 'forbidden' });
    res.json({ config: getWelcomeConfig(req.params.guildId) });
  } catch (error) {
    res.status(502).json({ error: 'welcome_config_unavailable' });
  }
});

app.put('/api/guild-welcome/:guildId', async (req, res) => {
  try {
    const guildId = req.params.guildId;
    if (!(await canManageGuild(req, guildId))) return res.status(403).json({ error: 'forbidden' });
    const guild = getBotClient()?.guilds.cache.get(guildId);
    if (!guild) return res.status(404).json({ error: 'bot_not_added' });

    const body = req.body || {};
    const enabled = body.enabled === true;
    const channelId = String(body.channelId || '');
    const linkChannelId = String(body.linkChannelId || '');
    const roleId = String(body.roleId || '');
    const welcomeChannel = channelId ? guild.channels.cache.get(channelId) : null;
    const linkChannel = linkChannelId ? guild.channels.cache.get(linkChannelId) : null;
    const role = roleId ? guild.roles.cache.get(roleId) : null;
    const botMember = guild.members.me;

    if (enabled && (!welcomeChannel?.isTextBased() || typeof welcomeChannel.send !== 'function')) {
      return res.status(400).json({ error: 'welcome_channel_required' });
    }
    if (linkChannelId && (!linkChannel?.isTextBased() || typeof linkChannel.send !== 'function')) {
      return res.status(400).json({ error: 'invalid_link_channel' });
    }
    if (roleId && (!role || role.id === guild.id || role.managed)) {
      return res.status(400).json({ error: 'invalid_welcome_role' });
    }
    if (enabled && roleId && (!botMember?.permissions.has('ManageRoles') || botMember.roles.highest.comparePositionTo(role) <= 0)) {
      return res.status(400).json({ error: 'welcome_role_not_assignable' });
    }
    if (enabled && !welcomeChannel.permissionsFor(botMember)?.has(['ViewChannel', 'SendMessages'])) {
      return res.status(400).json({ error: 'welcome_channel_permissions' });
    }

    const config = saveWelcomeConfig(guildId, {
      enabled,
      channelId,
      linkChannelId,
      roleId,
      title: String(body.title || '').slice(0, 250),
      text: String(body.text || '').slice(0, 3000)
    });
    res.json({ config });
  } catch (error) {
    console.error('No se pudo guardar la configuración de bienvenida:', error.message);
    res.status(502).json({ error: 'welcome_config_save_failed' });
  }
});

app.put('/api/guild-config/:guildId', async (req, res) => {
  try {
    if (!(await canManageGuild(req, req.params.guildId))) return res.status(403).json({ error: 'forbidden' });
    const body = req.body || {};
    const language = getConfig(req.params.guildId)?.language || 'es';
    if (!Array.isArray(body.buttons) || body.buttons.length === 0) return res.status(400).json({ error: 'button_required' });
    const commandRoles = {};
    if (body.commandRoles && typeof body.commandRoles === 'object') {
      for (const [commandName, roleId] of Object.entries(body.commandRoles)) {
        const key = String(commandName || '').trim();
        if (!COMMAND_ROLE_KEYS.has(key)) continue;
        const value = roleId ? String(roleId).trim() : '';
        if (value) commandRoles[key] = value;
      }
    }
    const config = {
      language,
      panelTitle: String(body.panelTitle || 'TICKETS').slice(0, 100),
      panelText: String(body.panelText || 'Abre ticket si necesitas ayuda.').slice(0, 2000),
      panelColor: sanitizeColor(body.panelColor),
      panelButtons: body.panelButtons !== false,
      ticketTitle: String(body.ticketTitle || 'TICKET CREADO').slice(0, 100),
      ticketText: String(body.ticketText || '').slice(0, 3000),
      ticketColor: sanitizeColor(body.ticketColor),
      logsTitle: String(body.logsTitle || 'TICKET CERRADO').slice(0, 100),
      logsText: String(body.logsText || '').slice(0, 3000),
      logsColor: sanitizeColor(body.logsColor, '#ff1717'),
      staffRoleId: body.staffRoleId ? String(body.staffRoleId) : null,
      logsChannelId: body.logsChannelId ? String(body.logsChannelId) : null,
      categoryId: body.categoryId ? String(body.categoryId) : null,
      claimEmoji: sanitizeEmoji(body.claimEmoji),
      closeEmoji: sanitizeEmoji(body.closeEmoji),
      askCloseReason: body.askCloseReason !== false,
      maxOpenTickets: Number.isInteger(Number(body.maxOpenTickets)) && Number(body.maxOpenTickets) > 0 ? Number(body.maxOpenTickets) : null,
      commandRoles,
      ticketPanelMessageIds: getConfig(req.params.guildId)?.ticketPanelMessageIds || [],
      buttons: body.buttons.slice(0, 10).map((button) => ({ label: String(button.label || 'Crear Ticket').slice(0, 80), emoji: sanitizeEmoji(button.emoji), categoryId: button.categoryId ? String(button.categoryId) : null }))
    };
    setConfig(req.params.guildId, config);
    res.json({ config });
  } catch (error) {
    console.error(`No se pudo guardar la configuración de tickets para ${req.params.guildId}:`, error.message);
    res.status(502).json({ error: 'config_save_failed' });
  }
});

app.get('/api/communities', (req, res) => {
  const communities = getCommunities();
  if (!communities.length) return res.status(404).json({ communities: [] });
  res.json({ communities });
});

app.post('/auth/logout', async (req, res) => {
  const user = req.session.user;
  const loginUrl = new URL('/auth/login', process.env.PUBLIC_URL || new URL(redirectUri).origin).toString();
  const resetGuilds = [];
  let guilds = null;
  if (user?.id) {
    try {
      guilds = await getDiscordUserGuilds(req);
      for (const guild of guilds || []) {
        const permissions = BigInt(guild.permissions || 0);
        if (guild.owner !== true && (permissions & (0x8n | 0x20n)) === 0n) continue;
        try {
          require('./bot/lib/guild-settings').resetGuildSettings(guild.id);
          resetGuilds.push(guild.id);
        } catch (error) {
          console.error(`No se pudo restablecer la configuración de ${guild.id} al desvincular:`, error.message);
        }
      }
    } catch (error) {
      console.warn('No se pudo comprobar los servidores para restablecer la configuración al desvincular:', error.message);
    }
  }
  const finishLogout = () => req.session.destroy(() => res.json({ ok: true, resetGuilds: resetGuilds.length, configurationReset: !user?.id || Boolean(guilds) }));
  if (!user?.id) return finishLogout();
  sendUnlinkSuccessDm(user.id, loginUrl)
    .catch((error) => console.warn(`No se pudo enviar el DM de desvinculación a ${user.id}:`, error.message))
    .finally(finishLogout);
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

app.listen(port, () => console.log(`Lylo web disponible en http://localhost:${port}`));
