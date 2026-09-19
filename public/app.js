const translations = {
  es: { eyebrow: 'BOT DE DISCORD • HECHO PARA COMUNIDADES', heroTitle: 'Tu servidor,<br><em>más vivo.</em>', heroDescription: 'Lylo reúne herramientas útiles, automatizaciones sencillas y una experiencia que se siente parte de tu comunidad.', addBot: 'Añadir bot', linkAccount: 'Vincular cuenta', logout: 'Cerrar sesión', online: '● online', whyEyebrow: 'TODO EN UN SOLO LUGAR', whyTitle: 'Una base sólida<br>para tu comunidad.', featureOneTitle: 'Automatiza', featureOneText: 'Deja que Lylo se ocupe de las tareas repetitivas para que tu comunidad avance.', featureTwoTitle: 'Conecta', featureTwoText: 'Una cuenta, una vista clara de todos los servidores donde vive tu bot.', featureThreeTitle: 'Crece', featureThreeText: 'Nuevas herramientas llegarán para darte más control y mejores momentos.', comingSoon: 'PRÓXIMAMENTE', closingTitle: 'Esto apenas<br><em>comienza.</em>', closingText: 'Estamos construyendo un lugar donde administrar tu servidor sea simple, claro y un poco más tuyo.', terms: 'Terms', privacy: 'Privacy' },
  en: { eyebrow: 'DISCORD BOT • MADE FOR COMMUNITIES', heroTitle: 'Make your server<br><em>more alive.</em>', heroDescription: 'Lylo brings useful tools, simple automations and an experience that feels like part of your community.', addBot: 'Add bot', linkAccount: 'Link account', logout: 'Log out', online: '● online', whyEyebrow: 'EVERYTHING IN ONE PLACE', whyTitle: 'A solid base<br>for your community.', featureOneTitle: 'Automate', featureOneText: 'Let Lylo handle repetitive tasks so your community can keep moving.', featureTwoTitle: 'Connect', featureTwoText: 'One account, one clear view of every server where your bot lives.', featureThreeTitle: 'Grow', featureThreeText: 'More tools are coming to give you greater control and better moments.', comingSoon: 'COMING SOON', closingTitle: 'This is only<br><em>the beginning.</em>', closingText: 'We are building a place where managing your server feels simple, clear and more like yours.', terms: 'Terms', privacy: 'Privacy' }
};

function setLanguage(language) {
  localStorage.setItem('lylo_language', language);
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach((element) => { element.innerHTML = translations[language][element.dataset.i18n]; });
  document.querySelectorAll('[data-language]').forEach((button) => button.classList.toggle('active', button.dataset.language === language));
}

async function loadSession() {
  const response = await fetch('/api/me');
  const data = await response.json();
  document.querySelector('.auth-button')?.classList.toggle('hidden', data.authenticated);
  document.querySelector('.logout-button')?.classList.toggle('hidden', !data.authenticated);
  document.querySelector('[data-panel]')?.classList.toggle('hidden', !data.authenticated);
  if (data.authenticated && data.user) {
    const profile = document.createElement('span');
    profile.className = 'profile-chip';
    const avatar = document.createElement('img');
    avatar.src = data.user.avatar
      ? `https://cdn.discordapp.com/avatars/${data.user.id}/${data.user.avatar}.png?size=64`
      : 'https://cdn.discordapp.com/embed/avatars/0.png';
    avatar.alt = '';
    avatar.width = 24;
    avatar.height = 24;
    const name = document.createElement('span');
    name.textContent = data.user.global_name || data.user.username;
    profile.append(avatar, name);
    profile.title = data.user.username;
    document.querySelector('.nav-actions').prepend(profile);
  }
}

document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => setLanguage(button.dataset.language)));
setLanguage(localStorage.getItem('lylo_language') || 'es');
loadSession();
const error = new URLSearchParams(location.search).get('error');
if (error) { const messages = { missing_config: 'Configura DISCORD_CLIENT_SECRET en .env para iniciar sesión.', oauth_state: 'La sesión OAuth expiró. Intenta vincular la cuenta otra vez.', access_denied: 'Cancelaste la autorización de Discord.', session_expired: 'Tu sesión de Discord expiró. Vuelve a vincular tu cuenta.' }; const message = messages[error] || (error.includes('redirect') ? `Discord rechazó el callback: ${error}` : 'No se pudo conectar con Discord. Revisa la configuración OAuth.'); const errorElement = document.querySelector('[data-auth-error]'); if (errorElement) { errorElement.textContent = message; errorElement.classList.remove('hidden'); } }
