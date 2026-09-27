const languagePage = document.querySelector('[data-language-page]');
const languageForm = document.querySelector('[data-language-form]');
const serverSelect = document.querySelector('#language-server');
const languageStatus = document.querySelector('[data-language-status]');
const languageSubmit = document.querySelector('[data-language-submit]');
let ownedServers = [];
const languageLabels = { en: 'English', fr: 'Français', es: 'Español', pt: 'Português', id: 'Indonesia', de: 'Deutsch' };
const siteText = (key) => window.lyloTranslate?.(key) || key;

function setLanguageStatus(text, isError = false) {
  languageStatus.textContent = text;
  languageStatus.classList.toggle('is-error', isError);
}

async function loadOwnedServers() {
  const response = await fetch('/api/owned-servers');
  if (response.status === 401) {
    window.location.replace('index.html');
    return;
  }
  if (!response.ok) throw new Error(siteText('languageLoadError'));

  const { guilds = [] } = await response.json();
  ownedServers = guilds;
  renderOwnedServers();
  serverSelect.disabled = guilds.length === 0;
  languageSubmit.disabled = guilds.length === 0;
  languagePage.hidden = false;
}

function renderOwnedServers() {
  serverSelect.replaceChildren(new Option(ownedServers.length ? siteText('languageChooseServer') : siteText('languageNoServers'), ''));
  ownedServers.forEach((guild) => {
    const language = languageLabels[guild.language] || languageLabels.es;
    const botStatus = guild.botAdded ? '' : ` (${siteText('languageNoBot')})`;
    serverSelect.add(new Option(`${guild.name} · ${language}${botStatus}`, guild.id));
  });
}

serverSelect.addEventListener('change', () => {
  const selectedServer = ownedServers.find((guild) => guild.id === serverSelect.value);
  if (!selectedServer) return;
  const selectedLanguage = languageForm.querySelector(`input[name="language"][value="${selectedServer.language}"]`);
  if (selectedLanguage) selectedLanguage.checked = true;
});

languageForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const guildId = serverSelect.value;
  const language = languageForm.querySelector('input[name="language"]:checked')?.value;
  if (!guildId || !language) return;
  if (!window.confirm(siteText('languageConfirm'))) return;

  languageSubmit.disabled = true;
  setLanguageStatus(siteText('languageWorking'));
  try {
    const response = await fetch(`/api/guild-language/${guildId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language })
    });
    const result = await response.json();
    if (response.status === 401) {
      window.location.replace('index.html');
      return;
    }
    if (response.status === 403) throw new Error(siteText('languageOwnerError'));
    if (!response.ok) throw new Error(siteText('languageChangeError'));

    const selectedServer = ownedServers.find((guild) => guild.id === guildId);
    if (selectedServer) selectedServer.language = result.language;
    renderOwnedServers();
    serverSelect.value = guildId;
    setLanguageStatus(result.commandsSynced
      ? siteText('languageDone')
      : result.botAdded
        ? siteText('languageSaved')
        : siteText('languageNeedsBot'));
  } catch (error) {
    setLanguageStatus(error.message || 'No se pudo cambiar el idioma.', true);
  } finally {
    languageSubmit.disabled = !ownedServers.length;
  }
});

document.addEventListener('lylo-language-change', renderOwnedServers);

loadOwnedServers().catch((error) => {
  languagePage.hidden = false;
  setLanguageStatus(error.message || siteText('languageLoadError'), true);
});
