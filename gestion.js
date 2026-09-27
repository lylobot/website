const inviteUrl = 'https://discord.com/oauth2/authorize?client_id=1550251663259082784&permissions=8&integration_type=0&scope=bot+applications.commands';
const fallbackServerIcon = 'https://cdn.discordapp.com/embed/avatars/0.png';
const serverList = document.querySelector('[data-server-list]');
const serverState = document.querySelector('[data-server-state]');
const searchInput = document.querySelector('[data-server-search]');
let servers = [];

const manageCopy = {
  es: { manageBack: 'Volver', manageTitle: 'Selecciona un servidor', manageText: 'Elige un servidor para configurar Lylo', manageSearch: 'Buscar servidores', manageLoading: 'Cargando servidores...', manageLogin: 'Inicia sesión para ver tus servidores.', login: 'Iniciar sesión', manageEmpty: 'No encontramos servidores administrables.', configure: 'Configurar', addBot: 'Añádeme' },
  en: { manageBack: 'Back', manageTitle: 'Select a server', manageText: 'Choose a server to configure Lylo', manageSearch: 'Search servers', manageLoading: 'Loading servers...', manageLogin: 'Log in to see your servers.', login: 'Log in', manageEmpty: 'No manageable servers found.', configure: 'Configure', addBot: 'Add me' },
  fr: { manageBack: 'Retour', manageTitle: 'Sélectionnez un serveur', manageText: 'Choisissez un serveur pour configurer Lylo', manageSearch: 'Rechercher des serveurs', manageLoading: 'Chargement des serveurs...', manageLogin: 'Connectez-vous pour voir vos serveurs.', login: 'Se connecter', manageEmpty: 'Aucun serveur administrable trouvé.', configure: 'Configurer', addBot: 'M’ajouter' },
  pt: { manageBack: 'Voltar', manageTitle: 'Selecione um servidor', manageText: 'Escolha um servidor para configurar o Lylo', manageSearch: 'Buscar servidores', manageLoading: 'Carregando servidores...', manageLogin: 'Entre para ver seus servidores.', login: 'Entrar', manageEmpty: 'Nenhum servidor gerenciável encontrado.', configure: 'Configurar', addBot: 'Adicionar-me' },
  id: { manageBack: 'Kembali', manageTitle: 'Pilih server', manageText: 'Pilih server untuk mengatur Lylo', manageSearch: 'Cari server', manageLoading: 'Memuat server...', manageLogin: 'Masuk untuk melihat servermu.', login: 'Masuk', manageEmpty: 'Tidak ada server yang dapat dikelola.', configure: 'Atur', addBot: 'Tambahkan saya' },
  de: { manageBack: 'Zurück', manageTitle: 'Wähle einen Server', manageText: 'Wähle einen Server, um Lylo zu konfigurieren', manageSearch: 'Server suchen', manageLoading: 'Server werden geladen...', manageLogin: 'Melde dich an, um deine Server zu sehen.', login: 'Anmelden', manageEmpty: 'Keine verwaltbaren Server gefunden.', configure: 'Konfigurieren', addBot: 'Mich hinzufügen' }
};

function currentManageCopy() {
  return manageCopy[document.documentElement.lang] || manageCopy.es;
}

function renderServers() {
  const copy = currentManageCopy();
  const query = (searchInput.value || '').trim().toLocaleLowerCase();
  const visibleServers = servers.filter((server) => server.name.toLocaleLowerCase().includes(query));
  if (!visibleServers.length) {
    serverList.innerHTML = `<div class="server-state"><strong>404</strong><span>${copy.manageEmpty}</span></div>`;
    return;
  }
  serverList.innerHTML = visibleServers.map((server) => `<article class="server-card"><img src="${server.icon || fallbackServerIcon}" alt="${escapeHtml(server.name)}"><div class="server-info"><h2>${escapeHtml(server.name)}</h2><p>${server.botAdded ? copy.configure : copy.addBot}</p></div><a class="server-action ${server.botAdded ? 'is-configure' : ''}" href="${server.botAdded ? `configuracion.html?guild=${server.id}` : inviteUrl}">${server.botAdded ? copy.configure : copy.addBot}</a></article>`).join('');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
}

function applyManageLanguage() {
  const copy = currentManageCopy();
  document.querySelectorAll('[data-i18n]').forEach((element) => { if (copy[element.dataset.i18n]) element.textContent = copy[element.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = copy[element.dataset.i18nPlaceholder]; });
  renderServers();
}

async function loadServers() {
  const response = await fetch('/api/manage-servers');
  if (response.status === 401) {
    serverList.innerHTML = `<div class="server-state"><strong>401</strong><span>${currentManageCopy().manageLogin}</span><a class="text-link" href="/auth/login">${currentManageCopy().login} <span>→</span></a></div>`;
    return;
  }
  const data = await response.json();
  servers = data.guilds || [];
  renderServers();
}

searchInput.addEventListener('input', renderServers);
document.addEventListener('lylo-language-change', applyManageLanguage);
applyManageLanguage();
loadServers().catch(() => { serverList.innerHTML = `<div class="server-state"><strong>404</strong><span>${currentManageCopy().manageEmpty}</span></div>`; });
