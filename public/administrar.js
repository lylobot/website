const guildId = new URLSearchParams(location.search).get('guildId');
const form = document.querySelector('[data-settings-form]');
const status = document.querySelector('[data-status]');
const founderRoleField = document.createElement('label');
const founderRoleSelect = document.createElement('select');
founderRoleSelect.name = 'founderRoleId';
founderRoleField.textContent = 'Rol Founder';
founderRoleField.append(founderRoleSelect);
form.elements.staffRoleId.closest('label').after(founderRoleField);

const categories = (channels) => channels.filter((channel) => channel.type === 4);
const textChannels = (channels) => channels.filter((channel) => channel.type === 0);
function optionList(element, items, placeholder, selected) {
  element.innerHTML = `<option value="">${placeholder}</option>`;
  items.forEach((item) => element.add(new Option(item.name, item.id, false, item.id === selected)));
}
function addButton(button = {}) {
  const row = document.createElement('div');
  row.className = 'dynamic-row ticket-button-row';
  row.dataset.buttonId = button.id || `button-${Date.now()}`;
  row.innerHTML = '<input name="buttonEmoji" maxlength="100" placeholder="🎫 o <:nombre:id>" aria-label="Emoji del botón"><input name="buttonLabel" maxlength="80" placeholder="Nombre del botón" aria-label="Nombre del botón"><select name="buttonCategoryId" aria-label="Categoría Discord"></select><button class="remove-button" type="button" aria-label="Borrar botón">×</button>';
  optionList(row.querySelector('select'), window.ticketCategories, 'Categoría Discord', button.categoryId);
  row.querySelector('[name="buttonEmoji"]').value = button.emoji || '';
  row.querySelector('[name="buttonLabel"]').value = button.label || '';
  row.querySelector('button').onclick = () => { if (document.querySelectorAll('.ticket-button-row').length > 1) { row.remove(); renderPanelPreview(); } else status.textContent = 'Debe quedar al menos un botón.'; };
  document.querySelector('[data-button-list]').append(row);
}
const availableCommands = ['addblock', 'removeblock', 'blocklist', 'adduser', 'removeuser', 'rename', 'clear', 'ticketpanel', 'embed', 'honeypot'];
function addCommandPermission(command = '', roleId = '') {
  const row = document.createElement('div');
  row.className = 'dynamic-row command-role-row';
  row.innerHTML = '<input name="permissionCommand" readonly maxlength="32"><select name="permissionRoleId"></select>';
  optionList(row.querySelector('select'), window.guildRoles, 'Seleccionar rol', roleId);
  row.querySelector('[name="permissionCommand"]').value = command;
  document.querySelector('[data-command-permission-list]').append(row);
}
function setValue(name, value) { const element = form.elements[name]; if (element) element.value = value ?? ''; }
function setChecked(name, value) { const element = form.elements[name]; if (element) element.checked = value === true; }
function previewMessage(value) {
  return String(value || 'Bienvenido {user} a {server}.')
    .replaceAll('{user}', '@NuevoUsuario').replaceAll('{username}', 'NuevoUsuario').replaceAll('{server}', 'Mi servidor')
    .replaceAll('{memberCount}', '128').replaceAll('{usercierre}', '@Staff').replaceAll('{staff}', '@Staff')
    .replaceAll('{reason}', 'No necesitamos más ayuda').replaceAll('{category}', 'Soporte');
}
function escapePreview(value) { return String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character])); }
function previewEmoji(value) {
  const emoji = String(value || '🎫').trim();
  const custom = emoji.match(/^<(?<animated>a?):(?<name>[A-Za-z0-9_]+):(?<id>\d+)>$/);
  if (!custom) return escapePreview(emoji);
  const extension = custom.groups.animated ? 'gif' : 'png';
  return `<img class="preview-emoji" src="https://cdn.discordapp.com/emojis/${custom.groups.id}.${extension}?size=32&quality=lossless" alt=":${escapePreview(custom.groups.name)}:" title=":${escapePreview(custom.groups.name)}:">`;
}
function previewContainer(element, content, color, buttons = []) {
  if (!element) return;
  element.classList.toggle('preview-no-color', color === 'none' || !color);
  element.dataset.previewColor = color || 'none';
  const time = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date());
  element.innerHTML = `<div class="preview-message"><img class="preview-avatar" src="/bot-image.png" alt="Lylo Bot"><div class="preview-message-body"><div class="preview-brand"><strong>Lylo</strong><small>APP</small><time>Hoy a las ${time}</time></div><div class="preview-copy">${escapePreview(content).replace(/\n/g, '<br>')}</div>${buttons.length ? `<div class="preview-buttons">${buttons.map((button) => `<button type="button">${previewEmoji(button.emoji)} <span>${escapePreview(button.label || 'Abrir ticket')}</span></button>`).join('')}</div>` : ''}</div></div>`;
}
function renderWelcomePreview() { previewContainer(document.querySelector('[data-welcome-preview]'), previewMessage(form.elements.welcomeMessage.value), form.elements.welcomeColorEnabled.checked ? form.elements.welcomeColor.value : 'none'); }
function renderPanelPreview() {
  const buttons = [...document.querySelectorAll('.ticket-button-row')].map((row) => ({ emoji: row.querySelector('[name="buttonEmoji"]').value, label: row.querySelector('[name="buttonLabel"]').value || row.querySelector('[name="buttonCategoryId"]').selectedOptions[0]?.textContent || 'Abrir ticket' }));
  previewContainer(document.querySelector('[data-panel-preview]'), `# ${form.elements.panelTitle.value || 'SOPORTE'}\n\n${form.elements.panelDescription.value || 'Espera que te responda un staff'}`, form.elements.panelColor.value, buttons);
}
function renderClosePreview() { previewContainer(document.querySelector('[data-close-preview]'), `# LOG TICKET CERRADO\n\n${previewMessage(form.elements.ticketCloseLog.value || 'Ticket cerrado por {usercierre}.')}`, form.elements.ticketCloseLogColorEnabled.checked ? form.elements.ticketCloseLogColor.value : 'none'); }
function renderPreviews() { renderWelcomePreview(); renderPanelPreview(); renderClosePreview(); }

async function load() {
  if (!guildId) { status.textContent = 'Falta seleccionar un servidor.'; return; }
  const response = await fetch(`/api/guild-config?guildId=${guildId}`);
  if (response.status === 401) return location.href = '/';
  if (response.status === 403) { status.textContent = 'No tienes permiso para administrar este servidor.'; return; }
  if (response.status === 503) { status.textContent = 'No se puede configurar: enciende el bot.'; form.querySelectorAll('input, textarea, select, button').forEach((element) => { element.disabled = true; }); return; }
  const data = await response.json();
  const config = data.config || {};
  window.ticketCategories = categories(data.channels || []);
  window.guildRoles = data.roles || [];
  const welcomeChannels = textChannels(data.channels || []);
  optionList(form.elements.welcomeChannelId, welcomeChannels, 'Seleccionar canal', config.welcome?.channelId);
  optionList(form.elements.welcomeRoleId, window.guildRoles, 'Sin rol automático', config.welcome?.roleId);
  optionList(form.elements.staffRoleId, window.guildRoles, 'Seleccionar rol', config.staffRoleId);
  optionList(founderRoleSelect, window.guildRoles, 'Seleccionar rol Founder', config.founderRoleId);
  optionList(form.elements.logChannelId, welcomeChannels, 'Seleccionar canal', config.logChannelId || config.logs?.channelId);
  availableCommands.forEach((command) => addCommandPermission(command, config.commandRoleIds?.[command] || ''));
  setChecked('welcomeEnabled', config.welcome?.enabled === true);
  setValue('welcomeMessage', config.welcome?.message || 'Bienvenido {user} a {server}.');
  setChecked('welcomeColorEnabled', config.welcome?.colorEnabled === true);
  setValue('welcomeColor', config.welcome?.color || 'none');
  setValue('panelTitle', config.panelTitle || 'SOPORTE');
  setValue('panelDescription', config.panelDescription || 'Espera que te responda un staff');
  setValue('panelColor', config.panelColor || 'none');
  setValue('ticketQuestion', config.ticketQuestion || 'Motivo del cierre del ticket');
  setChecked('ticketModal', config.ticketModal !== false);
  setChecked('ticketColorEnabled', config.ticketColorEnabled === true);
  setValue('ticketColor', config.ticketColor || 'blue');
  setValue('ticketCloseLog', config.ticketCloseLog || 'Ticket cerrado por {usercierre}.');
  setChecked('ticketCloseLogColorEnabled', config.ticketCloseLogColorEnabled === true);
  setValue('ticketCloseLogColor', config.ticketCloseLogColor || 'none');
  (config.buttons?.length ? config.buttons : [{ id: 'default', label: 'Abrir ticket', emoji: '🎫', categoryId: '' }]).forEach(addButton);
  renderPreviews();
}
async function deleteTranscript(file) { if (!confirm(`¿Borrar la transcripción ${file}?`)) return; const response = await fetch(`/api/transcripts?guildId=${encodeURIComponent(guildId)}&file=${encodeURIComponent(file)}`, { method: 'DELETE' }); if (!response.ok) { status.textContent = 'No se pudo borrar la transcripción.'; return; } loadTranscripts(); }
async function loadTranscripts() { const list = document.querySelector('[data-transcript-list]'); if (!list || !guildId) return; try { const response = await fetch(`/api/transcripts?guildId=${encodeURIComponent(guildId)}`); if (!response.ok) { list.textContent = 'No se pudieron cargar las transcripciones.'; return; } const data = await response.json(); list.innerHTML = data.transcripts?.length ? data.transcripts.map((item) => `<div class="transcript-row"><a href="${item.url}">Descargar ${item.file}</a><button class="remove-button" type="button" aria-label="Borrar transcripción" onclick="deleteTranscript('${item.file}')">×</button></div>`).join('') : '<p class="empty-state">Todavía no hay transcripciones guardadas.</p>'; } catch { list.textContent = 'No se pudieron cargar las transcripciones.'; } }

document.querySelector('[data-add-button]').onclick = () => { addButton(); renderPanelPreview(); };
document.querySelector('[data-add-command-permission]')?.addEventListener('click', () => addCommandPermission());
form.addEventListener('input', renderPreviews);
form.addEventListener('change', renderPreviews);
form.onsubmit = async (event) => {
  event.preventDefault();
  status.textContent = 'Guardando...';
  const buttons = [...document.querySelectorAll('.ticket-button-row')].map((row) => ({ id: row.dataset.buttonId, emoji: row.querySelector('[name="buttonEmoji"]').value, label: row.querySelector('[name="buttonLabel"]').value || row.querySelector('[name="buttonCategoryId"]').selectedOptions[0]?.textContent || 'Abrir ticket', categoryId: row.querySelector('[name="buttonCategoryId"]').value }));
  if (!buttons.length || buttons.some((button) => !button.categoryId)) { status.textContent = 'Cada botón debe tener una categoría de Discord.'; return; }
  const commandRoleIds = Object.fromEntries([...document.querySelectorAll('[name="permissionCommand"]')].map((element) => [element.value.trim().toLowerCase(), element.closest('.command-role-row').querySelector('[name="permissionRoleId"]').value]).filter(([command, roleId]) => /^[a-z0-9-]+$/.test(command) && roleId));
  const payload = { guildId, welcome: { enabled: form.welcomeEnabled.checked, channelId: form.welcomeChannelId.value, roleId: form.welcomeRoleId.value, message: form.welcomeMessage.value, colorEnabled: form.welcomeColorEnabled.checked, color: form.welcomeColor.value, separator: true }, panelTitle: form.panelTitle.value, panelDescription: form.panelDescription.value, panelColor: form.panelColor.value, staffRoleId: form.staffRoleId.value, founderRoleId: founderRoleSelect.value, commandRoleIds, logChannelId: form.logChannelId.value, ticketQuestion: form.ticketQuestion.value, ticketModal: form.ticketModal.checked, ticketColorEnabled: form.ticketColorEnabled.checked, ticketColor: form.ticketColor.value, ticketCloseLog: form.ticketCloseLog.value, ticketCloseLogColorEnabled: form.ticketCloseLogColorEnabled.checked, ticketCloseLogColor: form.ticketCloseLogColor.value, buttons };
  const response = await fetch('/api/guild-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json().catch(() => ({}));
  status.textContent = response.ok ? 'Configuración guardada.' : (result.error || 'No se pudo guardar.');
};
load();
loadTranscripts();
