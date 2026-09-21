const translations = {
  es: {
    homeNav: 'Inicio', panelNav: 'PANEL', linked: 'Cuenta vinculada', notLinked: 'Cuenta no vinculada',
    eyebrow: 'BOT DE DISCORD • HECHO PARA COMUNIDADES',
    heroTitle: 'Tu servidor,<br><em>más vivo.</em>',
    heroDescription: 'Lylo combina automatización, control y atención al usuario para que cada comunidad se sienta más ordenada, más activa y más segura. Diseñado para servidores que quieren crecer sin perder claridad ni tiempo.',
    addBot: 'Añadir bot', linkAccount: 'Vincular cuenta', logout: 'Cerrar sesión', online: '● online',
    whyEyebrow: 'TODO EN UN SOLO LUGAR', whyTitle: 'Una base sólida<br>para tu comunidad.',
    featureOneTitle: 'Automatiza', featureOneText: 'Reduce tareas repetitivas como avisos, cierres, moderación y organización del soporte. Lylo trabaja en segundo plano para que tu comunidad avance con menos fricción.',
    featureTwoTitle: 'Conecta', featureTwoText: 'Todo queda centrado en una sola experiencia: dashboard, gestión de servidores, panel de soporte y control de configuración sin perder el contexto.',
    featureThreeTitle: 'Crece', featureThreeText: 'Diseñado para comunidades activas que necesitan orden, seguridad y estructura para escalar sin complicaciones ni pérdidas de tiempo.',
    commandsEyebrow: 'LYLO / COMANDOS', commandsTitle: 'Herramientas pensadas<br><em>para administrar mejor.</em>',
    commandKiss: 'Un toque más casual para dar vida al chat y generar interacciones amenas dentro de la comunidad.',
    commandServer: 'Consulta los datos clave del servidor, roles y estructura para mantener todo ordenado y visible.',
    commandBot: 'Información útil, enlaces y acceso al soporte para que los usuarios puedan entender mejor el bot.',
    commandTicket: 'Publica paneles de support con configuraciones rápidas para notificar, atender y gestionar tickets.',
    commandHoneypot: 'Protección para canales trampa y detección de actividad sospechosa sin sobrecargar la experiencia del server.',
    commandHelp: 'Acceso rápido a las funcionalidades principales del bot para usuarios y administradores.',
    securityEyebrow: 'LYLO / SEGURIDAD', securityTitle: 'Protección, control y<br>tranquilidad para tu comunidad.',
    securityOneTitle: 'Moderación inteligente', securityOneText: 'Monitorea actividad sospechosa y responde con herramientas útiles para mantener el orden sin caer en procesos manuales complejos.',
    securityTwoTitle: 'Soporte estructurado', securityTwoText: 'Creación de tickets, canales de atención y mensajes limpios para brindar una experiencia más clara para usuarios y staff.',
    securityThreeTitle: 'Configuración centralizada', securityThreeText: 'Desde el dashboard puedes ajustar roles, canales, paneles y funciones clave sin depender de procesos manuales largos.',
    communityEyebrow: 'LYLO / COMUNIDADES', communityTitle: 'Comunidades que nos ayudan a crecer.', communityLoading: 'Cargando comunidades...',
    experienceEyebrow: 'LYLO / EXPERIENCIA', experienceTitle: 'La herramienta que hace que tu servidor se sienta más profesional.',
    experienceOneTitle: 'Gestión rápida', experienceOneText: 'Configura roles, canales y paneles sin perder tiempo ni depender de procesos complejos o manuales.',
    experienceTwoTitle: 'Comunidad más activa', experienceTwoText: 'Ayuda a que cada miembro sienta que el servidor está cuidado, ordenado y preparado para crecer.',
    experienceThreeTitle: 'Soporte real', experienceThreeText: 'Organiza dudas, consultas y atención del staff en un flujo más claro para mejorar la experiencia general.',
    terms: 'Términos', privacy: 'Privacidad'
  },
  en: {
    homeNav: 'Home', panelNav: 'PANEL', linked: 'Linked account', notLinked: 'Account not linked',
    eyebrow: 'DISCORD BOT • MADE FOR COMMUNITIES',
    heroTitle: 'Your server,<br><em>more alive.</em>',
    heroDescription: 'Lylo combines automation, control, and user support so every community feels more organized, active, and safe. Built for servers that want to grow without losing clarity or time.',
    addBot: 'Add bot', linkAccount: 'Link account', logout: 'Log out', online: '● online',
    whyEyebrow: 'EVERYTHING IN ONE PLACE', whyTitle: 'A solid foundation<br>for your community.',
    featureOneTitle: 'Automate', featureOneText: 'Reduce repetitive tasks like announcements, closures, moderation, and support organization. Lylo works in the background so your community can move forward with less friction.',
    featureTwoTitle: 'Connect', featureTwoText: 'Everything stays in one experience: dashboard, server management, support panel, and configuration controls without losing context.',
    featureThreeTitle: 'Grow', featureThreeText: 'Built for active communities that need order, security, and structure to scale without complications or wasted time.',
    commandsEyebrow: 'LYLO / COMMANDS', commandsTitle: 'Tools designed<br><em>for better management.</em>',
    commandKiss: 'A casual way to bring chat to life and create friendly interactions within the community.',
    commandServer: 'Check key server details, roles, and structure to keep everything organized and visible.',
    commandBot: 'Useful information, links, and support access so users can better understand the bot.',
    commandTicket: 'Publish support panels with quick settings for notifying, assisting, and managing tickets.',
    commandHoneypot: 'Protect honeypot channels and detect suspicious activity without weighing down the server experience.',
    commandHelp: 'Quick access to the bot’s main features for users and administrators.',
    securityEyebrow: 'LYLO / SECURITY', securityTitle: 'Protection, control, and<br>peace of mind for your community.',
    securityOneTitle: 'Smart moderation', securityOneText: 'Monitor suspicious activity and respond with useful tools to keep order without complex manual processes.',
    securityTwoTitle: 'Structured support', securityTwoText: 'Tickets, support channels, and clean messages provide a clearer experience for users and staff.',
    securityThreeTitle: 'Centralized configuration', securityThreeText: 'Adjust roles, channels, panels, and key features from the dashboard without lengthy manual processes.',
    communityEyebrow: 'LYLO / COMMUNITIES', communityTitle: 'Communities that help us grow.', communityLoading: 'Loading communities...',
    experienceEyebrow: 'LYLO / EXPERIENCE', experienceTitle: 'The tool that makes your server feel more professional.',
    experienceOneTitle: 'Fast management', experienceOneText: 'Configure roles, channels, and panels without wasting time or relying on complex manual processes.',
    experienceTwoTitle: 'More active community', experienceTwoText: 'Help every member feel that the server is cared for, organized, and ready to grow.',
    experienceThreeTitle: 'Real support', experienceThreeText: 'Organize questions, requests, and staff support in a clearer flow to improve the overall experience.',
    terms: 'Terms', privacy: 'Privacy'
  }
};

function languageKey(language) { return language === 'en' || language === 'en-US' ? 'en' : 'es'; }

function setLanguage(language) {
  const key = languageKey(language);
  localStorage.setItem('lylo_language', key === 'en' ? 'en-US' : 'es');
  document.documentElement.lang = key === 'en' ? 'en-US' : 'es-ES';
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.innerHTML = translations[key][element.dataset.i18n]; });
  document.querySelectorAll('[data-language]').forEach((button) => button.classList.toggle('active', languageKey(button.dataset.language) === key));
}

function communityIcon(guild) {
  return guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` : 'https://cdn.discordapp.com/embed/avatars/0.png';
}

async function loadCommunities() {
  const track = document.querySelector('[data-community-track]');
  if (!track) return;
  try {
    const response = await fetch('/api/public-guilds', { cache: 'no-store' });
    if (!response.ok) throw new Error('Communities unavailable');
    const data = await response.json();
    const guilds = Array.isArray(data.guilds) ? data.guilds : [];
    if (!guilds.length) {
      track.innerHTML = `<p class="community-empty">${translations[languageKey(localStorage.getItem('lylo_language'))].communityLoading}</p>`;
      return;
    }
    const cards = guilds.map((guild) => `<article class="community-card"><img src="${communityIcon(guild)}" alt=""><div><span>${escapeHtml(guild.name)}</span><small>${Number(guild.memberCount) > 0 ? `${Number(guild.memberCount).toLocaleString(languageKey(localStorage.getItem('lylo_language')) === 'en' ? 'en-US' : 'es-ES')} ${languageKey(localStorage.getItem('lylo_language')) === 'en' ? 'Members' : 'Miembros'}` : (languageKey(localStorage.getItem('lylo_language')) === 'en' ? 'Members unavailable' : 'Miembros no disponibles')}</small></div></article>`).join('');
    track.innerHTML = cards + cards;
  } catch (error) {
    track.innerHTML = `<p class="community-empty">${translations[languageKey(localStorage.getItem('lylo_language'))].communityLoading}</p>`;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character]));
}

async function loadSession() {
  const response = await fetch('/api/me', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Session check failed (${response.status})`);
  const data = await response.json();
  document.querySelector('.auth-button')?.classList.toggle('hidden', data.authenticated);
  document.querySelector('.logout-button')?.classList.toggle('hidden', !data.authenticated);
  document.querySelector('[data-hero-panel]')?.classList.toggle('hidden', !data.authenticated);
  document.querySelector('[data-panel]')?.classList.toggle('hidden', !data.authenticated);
  const connected = document.querySelector('[data-connected]');
  if (connected) {
    connected.dataset.i18n = data.authenticated ? 'linked' : 'notLinked';
    connected.textContent = translations[languageKey(localStorage.getItem('lylo_language'))][connected.dataset.i18n];
    connected.classList.toggle('is-linked', data.authenticated);
    connected.classList.toggle('is-not-linked', !data.authenticated);
  }
  if (data.authenticated && data.user) {
    const profile = document.createElement('span');
    profile.className = 'profile-chip';
    const avatar = document.createElement('img');
    avatar.src = data.user.avatar ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png?size=64` : 'https://cdn.discordapp.com/embed/avatars/0.png';
    avatar.alt = ''; avatar.width = 24; avatar.height = 24;
    const name = document.createElement('span');
    name.textContent = data.user.global_name || data.user.username;
    profile.append(avatar, name); profile.title = data.user.username;
      document.querySelector('.nav-actions').prepend(profile);
      const mobileAccount = document.querySelector('[data-mobile-account]');
      if (mobileAccount) {
        mobileAccount.append(avatar.cloneNode(true), name.cloneNode(true));
        mobileAccount.title = data.user.username;
        mobileAccount.classList.remove('hidden');
      }
  }
}

function showAuthError(message) { const errorElement = document.querySelector('[data-auth-error]'); if (errorElement) { errorElement.textContent = message; errorElement.classList.remove('hidden'); } }

document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
setLanguage(localStorage.getItem('lylo_language') || 'es');
loadCommunities();
loadSession().catch(() => showAuthError(languageKey(localStorage.getItem('lylo_language')) === 'en' ? 'Could not check your Discord connection. Please try again.' : 'No se pudo comprobar la vinculación con Discord. Intenta de nuevo.'));
const error = new URLSearchParams(location.search).get('error');
if (error === 'session_expired') window.location.replace('/');
if (error && error !== 'session_expired') {
  const isEnglish = languageKey(localStorage.getItem('lylo_language')) === 'en';
  const messages = isEnglish
    ? { missing_config: 'Configure DISCORD_CLIENT_SECRET in .env to sign in.', oauth_state: 'The OAuth session expired. Try linking your account again.', access_denied: 'You canceled Discord authorization.', oauth_failed: 'Discord could not complete the connection.' }
    : { missing_config: 'Configura DISCORD_CLIENT_SECRET en .env para iniciar sesión.', oauth_state: 'La sesión OAuth expiró. Intenta vincular la cuenta otra vez.', access_denied: 'Cancelaste la autorización de Discord.', oauth_failed: 'Discord no pudo completar la vinculación.' };
  const fallback = isEnglish ? 'Could not connect to Discord. Check your OAuth configuration.' : 'No se pudo conectar con Discord. Revisa la configuración OAuth.';
  const detail = new URLSearchParams(location.search).get('message');
  showAuthError(`${messages[error] || fallback}${detail ? ` ${isEnglish ? 'Details' : 'Detalle'}: ${detail}` : ''}`);
}
