const loginSection = document.querySelector('[data-panel-login]');
const loginForm = document.querySelector('[data-panel-login-form]');
const panelContent = document.querySelector('[data-panel-content]');
const panelStatus = document.querySelector('[data-panel-status]');
const keyForm = document.querySelector('[data-key-form]');
const keyStatus = document.querySelector('[data-key-status]');
const keyList = document.querySelector('[data-key-list]');
const restoreButton = document.querySelector('[data-restore-customizations]');
const resetConfigButton = document.querySelector('[data-reset-config-all]');
const panelLanguages = {
  es: { back: 'Volver', loginTitle: 'Panel de keys', loginText: 'Introduce la contraseña del sistema para continuar.', password: 'Contraseña', enter: 'Entrar', title: 'Keys Premium', text: 'Genera keys de un solo uso y elimina keys generadas o activas.', duration: 'Duración de la key', generate: 'Generar key', used: 'EN USO', free: 'NO USADA', delete: 'Eliminar', empty: 'No hay keys activas.', server: 'Servidor', user: 'Usuario', wrongPassword: 'Contraseña incorrecta.', generated: 'Key generada', deleted: 'Key eliminada.', deleteConfirm: '¿Eliminar {{key}}? Si está en uso, revocará Premium y restaurará el perfil original de ese servidor.' },
  en: { back: 'Back', loginTitle: 'Key panel', loginText: 'Enter the system password to continue.', password: 'Password', enter: 'Enter', title: 'Premium keys', text: 'Generate one-use keys and remove generated or active keys.', duration: 'Key duration', generate: 'Generate key', used: 'IN USE', free: 'UNUSED', delete: 'Delete', empty: 'There are no active keys.', server: 'Server', user: 'User', wrongPassword: 'Incorrect password.', generated: 'Key generated', deleted: 'Key deleted.', deleteConfirm: 'Delete {{key}}? If active, Premium will be revoked and that server profile restored.' },
  fr: { back: 'Retour', loginTitle: 'Panneau des clés', loginText: 'Saisissez le mot de passe du système pour continuer.', password: 'Mot de passe', enter: 'Entrer', title: 'Clés Premium', text: 'Générez des clés à usage unique et supprimez les clés créées ou actives.', duration: 'Durée de la clé', generate: 'Générer une clé', used: 'UTILISÉE', free: 'NON UTILISÉE', delete: 'Supprimer', empty: 'Aucune clé active.', server: 'Serveur', user: 'Utilisateur', wrongPassword: 'Mot de passe incorrect.', generated: 'Clé générée', deleted: 'Clé supprimée.', deleteConfirm: 'Supprimer {{key}} ? Si elle est active, Premium sera révoqué et le profil du serveur rétabli.' },
  pt: { back: 'Voltar', loginTitle: 'Painel de keys', loginText: 'Digite a senha do sistema para continuar.', password: 'Senha', enter: 'Entrar', title: 'Keys Premium', text: 'Gere keys de uso único e remova keys geradas ou ativas.', duration: 'Duração da key', generate: 'Gerar key', used: 'EM USO', free: 'NÃO USADA', delete: 'Remover', empty: 'Não há keys ativas.', server: 'Servidor', user: 'Usuário', wrongPassword: 'Senha incorreta.', generated: 'Key gerada', deleted: 'Key removida.', deleteConfirm: 'Remover {{key}}? Se estiver ativa, o Premium será revogado e o perfil desse servidor será restaurado.' },
  id: { back: 'Kembali', loginTitle: 'Panel key', loginText: 'Masukkan kata sandi sistem untuk melanjutkan.', password: 'Kata sandi', enter: 'Masuk', title: 'Key Premium', text: 'Buat key sekali pakai dan hapus key yang dibuat atau aktif.', duration: 'Durasi key', generate: 'Buat key', used: 'DIGUNAKAN', free: 'BELUM DIGUNAKAN', delete: 'Hapus', empty: 'Tidak ada key aktif.', server: 'Server', user: 'Pengguna', wrongPassword: 'Kata sandi salah.', generated: 'Key dibuat', deleted: 'Key dihapus.', deleteConfirm: 'Hapus {{key}}? Jika aktif, Premium akan dicabut dan profil server dipulihkan.' },
  de: { back: 'Zurück', loginTitle: 'Key-Panel', loginText: 'Gib das Systempasswort ein, um fortzufahren.', password: 'Passwort', enter: 'Eingeben', title: 'Premium-Keys', text: 'Erstelle Einmal-Keys und entferne erstellte oder aktive Keys.', duration: 'Key-Dauer', generate: 'Key erstellen', used: 'IN VERWENDUNG', free: 'NICHT VERWENDET', delete: 'Löschen', empty: 'Keine aktiven Keys.', server: 'Server', user: 'Benutzer', wrongPassword: 'Falsches Passwort.', generated: 'Key erstellt', deleted: 'Key gelöscht.', deleteConfirm: '{{key}} löschen? Bei einem aktiven Key wird Premium widerrufen und das Serverprofil wiederhergestellt.' }
};

const panelRestoreCopy = {
  es: { restoreCustomizations: 'Restablecer perfiles personalizados', restoreDescription: 'Restaura avatar, banner, nickname y biografía en los servidores que tienen cambios Premium guardados.', restoreConfirm: '¿Restablecer los perfiles guardados en los servidores con personalizaciones Premium?', restored: 'Perfiles restablecidos: {{count}}.', restorePartial: 'Perfiles restablecidos: {{restored}}. No se pudieron restaurar: {{failed}}.', restoreFailed: 'No se pudieron restablecer los perfiles.', deleteFailed: 'No se pudo eliminar la key o restaurar el perfil del servidor.' },
  en: { restoreCustomizations: 'Restore customized profiles', restoreDescription: 'Restore avatar, banner, nickname, and bio on servers with saved Premium changes.', restoreConfirm: 'Restore saved profiles on servers with Premium customizations?', restored: 'Profiles restored: {{count}}.', restorePartial: 'Profiles restored: {{restored}}. Could not restore: {{failed}}.', restoreFailed: 'Could not restore the profiles.', deleteFailed: 'Could not delete the key or restore the server profile.' },
  fr: { restoreCustomizations: 'Rétablir les profils personnalisés', restoreDescription: 'Rétablit l’avatar, la bannière, le pseudo et la bio sur les serveurs avec des modifications Premium enregistrées.', restoreConfirm: 'Rétablir les profils enregistrés sur les serveurs personnalisés avec Premium ?', restored: 'Profils rétablis : {{count}}.', restorePartial: 'Profils rétablis : {{restored}}. Échecs : {{failed}}.', restoreFailed: 'Impossible de rétablir les profils.', deleteFailed: 'Impossible de supprimer la clé ou de rétablir le profil du serveur.' },
  pt: { restoreCustomizations: 'Restaurar perfis personalizados', restoreDescription: 'Restaura avatar, banner, apelido e bio nos servidores com alterações Premium salvas.', restoreConfirm: 'Restaurar os perfis salvos nos servidores com personalizações Premium?', restored: 'Perfis restaurados: {{count}}.', restorePartial: 'Perfis restaurados: {{restored}}. Não foi possível restaurar: {{failed}}.', restoreFailed: 'Não foi possível restaurar os perfis.', deleteFailed: 'Não foi possível remover a key ou restaurar o perfil do servidor.' },
  id: { restoreCustomizations: 'Pulihkan profil kustom', restoreDescription: 'Pulihkan avatar, banner, nama panggilan, dan bio di server yang memiliki perubahan Premium tersimpan.', restoreConfirm: 'Pulihkan profil tersimpan di server dengan kustomisasi Premium?', restored: 'Profil dipulihkan: {{count}}.', restorePartial: 'Profil dipulihkan: {{restored}}. Gagal dipulihkan: {{failed}}.', restoreFailed: 'Profil tidak dapat dipulihkan.', deleteFailed: 'Key tidak dapat dihapus atau profil server tidak dapat dipulihkan.' },
  de: { restoreCustomizations: 'Angepasste Profile wiederherstellen', restoreDescription: 'Stellt Avatar, Banner, Spitzname und Bio auf Servern mit gespeicherten Premium-Änderungen wieder her.', restoreConfirm: 'Gespeicherte Profile auf Servern mit Premium-Anpassungen wiederherstellen?', restored: 'Profile wiederhergestellt: {{count}}.', restorePartial: 'Profile wiederhergestellt: {{restored}}. Fehlgeschlagen: {{failed}}.', restoreFailed: 'Profile konnten nicht wiederhergestellt werden.', deleteFailed: 'Key konnte nicht gelöscht oder das Serverprofil nicht wiederhergestellt werden.' }
};

const panelConfigResetCopy = {
  es: { resetConfigAll: 'Restablecer config all', resetConfigDescription: 'Restablece la configuración de Lylo en todos los servidores. Conserva keys y suscripciones Premium.', resetConfigConfirm: '¿Restablecer tickets, AutoMod, honeypot, bienvenidas, roles, bloqueos e idioma en TODOS los servidores? Las keys y suscripciones Premium se conservarán.', resettingConfig: 'Restableciendo configuración de todos los servidores...', resetConfigDone: 'Configuración restablecida en {{count}} servidores. Paneles de tickets actualizados: {{panels}}.', resetConfigPartial: 'Restablecida en {{count}} servidores. Paneles actualizados: {{panels}}. Servidores con errores: {{failed}}.', resetConfigFailed: 'No se pudo restablecer toda la configuración.' },
  en: { resetConfigAll: 'Reset config all', resetConfigDescription: 'Reset Lylo settings in every server. Premium keys and subscriptions are preserved.', resetConfigConfirm: 'Reset tickets, AutoMod, honeypot, welcomes, roles, blocks, and language in ALL servers? Premium keys and subscriptions will be preserved.', resettingConfig: 'Resetting configuration in all servers...', resetConfigDone: 'Settings reset in {{count}} servers. Ticket panels updated: {{panels}}.', resetConfigPartial: 'Reset in {{count}} servers. Panels updated: {{panels}}. Servers with errors: {{failed}}.', resetConfigFailed: 'Could not reset all settings.' },
  fr: { resetConfigAll: 'Réinitialiser toute la configuration', resetConfigDescription: 'Réinitialise Lylo sur tous les serveurs. Les clés et abonnements Premium sont conservés.', resetConfigConfirm: 'Réinitialiser tickets, AutoMod, honeypot, accueils, rôles, blocages et langue sur TOUS les serveurs ? Les clés et abonnements Premium seront conservés.', resettingConfig: 'Réinitialisation de tous les serveurs...', resetConfigDone: 'Configuration réinitialisée sur {{count}} serveurs. Panneaux mis à jour : {{panels}}.', resetConfigPartial: 'Réinitialisée sur {{count}} serveurs. Panneaux mis à jour : {{panels}}. Serveurs en erreur : {{failed}}.', resetConfigFailed: 'Impossible de réinitialiser toute la configuration.' },
  pt: { resetConfigAll: 'Redefinir config all', resetConfigDescription: 'Redefine as configurações do Lylo em todos os servidores. Keys e assinaturas Premium serão mantidas.', resetConfigConfirm: 'Redefinir tickets, AutoMod, honeypot, boas-vindas, cargos, bloqueios e idioma em TODOS os servidores? Keys e assinaturas Premium serão mantidas.', resettingConfig: 'Redefinindo configurações de todos os servidores...', resetConfigDone: 'Configurações redefinidas em {{count}} servidores. Painéis atualizados: {{panels}}.', resetConfigPartial: 'Redefinidas em {{count}} servidores. Painéis atualizados: {{panels}}. Servidores com erro: {{failed}}.', resetConfigFailed: 'Não foi possível redefinir todas as configurações.' },
  id: { resetConfigAll: 'Atur ulang config all', resetConfigDescription: 'Atur ulang pengaturan Lylo di semua server. Key dan langganan Premium tetap disimpan.', resetConfigConfirm: 'Atur ulang tiket, AutoMod, honeypot, sambutan, peran, pemblokiran, dan bahasa di SEMUA server? Key dan langganan Premium tetap disimpan.', resettingConfig: 'Mengatur ulang konfigurasi semua server...', resetConfigDone: 'Pengaturan diatur ulang di {{count}} server. Panel tiket diperbarui: {{panels}}.', resetConfigPartial: 'Diatur ulang di {{count}} server. Panel diperbarui: {{panels}}. Server bermasalah: {{failed}}.', resetConfigFailed: 'Semua pengaturan tidak dapat diatur ulang.' },
  de: { resetConfigAll: 'Gesamte Konfiguration zurücksetzen', resetConfigDescription: 'Setzt Lylo-Einstellungen auf allen Servern zurück. Premium-Keys und Abos bleiben erhalten.', resetConfigConfirm: 'Tickets, AutoMod, Honeypot, Begrüßungen, Rollen, Sperren und Sprache auf ALLEN Servern zurücksetzen? Premium-Keys und Abos bleiben erhalten.', resettingConfig: 'Einstellungen aller Server werden zurückgesetzt...', resetConfigDone: 'Einstellungen auf {{count}} Servern zurückgesetzt. Ticket-Panel aktualisiert: {{panels}}.', resetConfigPartial: 'Auf {{count}} Servern zurückgesetzt. Panels aktualisiert: {{panels}}. Server mit Fehlern: {{failed}}.', resetConfigFailed: 'Alle Einstellungen konnten nicht zurückgesetzt werden.' }
};

function panelCopy() { const language = document.documentElement.lang; return { ...(panelLanguages[language] || panelLanguages.es), ...(panelRestoreCopy[language] || panelRestoreCopy.es), ...(panelConfigResetCopy[language] || panelConfigResetCopy.es) }; }
function applyPanelLanguage() {
  const copy = panelCopy();
  document.querySelectorAll('[data-panel]').forEach((element) => { if (copy[element.dataset.panel]) element.textContent = copy[element.dataset.panel]; });
  document.querySelectorAll('[data-panel-placeholder]').forEach((element) => { element.placeholder = copy[element.dataset.panelPlaceholder]; });
  document.querySelectorAll('[data-duration]').forEach((option) => { option.textContent = ({ '1s': copy.duration + ' · 1s', '1m': copy.duration + ' · 1m', '1h': copy.duration + ' · 1h', '1mes': copy.duration + ' · 1mes', '1a': copy.duration + ' · 1a' })[option.dataset.duration]; });
}
applyPanelLanguage();
document.addEventListener('lylo-language-change', applyPanelLanguage);

function escapePanelHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

function durationLabel(duration) {
  const copy = panelCopy();
  return ({ '1s': `${copy.duration} · 1s`, '1m': `${copy.duration} · 1m`, '1h': `${copy.duration} · 1h`, '1mes': `${copy.duration} · 1mes`, '1a': `${copy.duration} · 1a` })[duration] || duration;
}

function renderKeys(keys) {
  const copy = panelCopy();
  keyList.innerHTML = keys.length ? keys.map((record) => `<div class="premium-key-row"><strong>${escapePanelHtml(record.key)}</strong><span>${durationLabel(record.duration)}</span><span class="premium-key-state ${record.used ? 'is-used' : 'is-free'}">${record.used ? copy.used : copy.free}</span>${record.guildId ? `<small>${copy.server}: ${escapePanelHtml(record.guildId)}</small>` : ''}${record.userId ? `<small>${copy.user}: ${escapePanelHtml(record.userId)}</small>` : ''}<button type="button" class="panel-delete-key" data-delete-key="${escapePanelHtml(record.key)}">${copy.delete}</button></div>`).join('') : `<p class="premium-admin-empty">${copy.empty}</p>`;
  keyList.querySelectorAll('[data-delete-key]').forEach((button) => button.addEventListener('click', () => deleteKey(button.dataset.deleteKey)));
}

async function loadKeys() {
  const response = await fetch('/api/premium/keys');
  if (!response.ok) throw new Error('No se pudieron cargar las keys.');
  renderKeys((await response.json()).keys || []);
}

async function deleteKey(key) {
  if (!window.confirm(panelCopy().deleteConfirm.replace('{{key}}', key))) return;
  const response = await fetch(`/api/premium/keys/${encodeURIComponent(key)}`, { method: 'DELETE' });
  keyStatus.textContent = response.ok ? panelCopy().deleted : panelCopy().deleteFailed;
  if (response.ok) await loadKeys();
}

async function restoreCustomizations() {
  const copy = panelCopy();
  if (!window.confirm(copy.restoreConfirm)) return;
  restoreButton.disabled = true;
  keyStatus.textContent = copy.restoreCustomizations + '...';
  try {
    const response = await fetch('/api/premium/customizations/restore', { method: 'POST' });
    const result = await response.json();
    if (!response.ok) throw new Error(copy.restoreFailed);
    keyStatus.textContent = result.failedGuildIds.length
      ? copy.restorePartial.replace('{{restored}}', result.restoredCount).replace('{{failed}}', result.failedGuildIds.length)
      : copy.restored.replace('{{count}}', result.restoredCount);
  } catch {
    keyStatus.textContent = copy.restoreFailed;
  } finally {
    restoreButton.disabled = false;
  }
}

async function resetAllConfigurations() {
  const copy = panelCopy();
  if (!window.confirm(copy.resetConfigConfirm)) return;
  resetConfigButton.disabled = true;
  keyStatus.textContent = copy.resettingConfig;
  try {
    const response = await fetch('/api/premium/config/reset', { method: 'POST' });
    const result = await response.json();
    if (!response.ok) throw new Error(copy.resetConfigFailed);
    keyStatus.textContent = result.failedGuildIds.length
      ? copy.resetConfigPartial.replace('{{count}}', result.resetCount).replace('{{panels}}', result.ticketPanelsUpdated).replace('{{failed}}', result.failedGuildIds.length)
      : copy.resetConfigDone.replace('{{count}}', result.resetCount).replace('{{panels}}', result.ticketPanelsUpdated);
  } catch {
    keyStatus.textContent = copy.resetConfigFailed;
  } finally {
    resetConfigButton.disabled = false;
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const response = await fetch('/api/premium/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: loginForm.elements.password.value }) });
  if (!response.ok) { panelStatus.textContent = panelCopy().wrongPassword; return; }
  loginSection.hidden = true;
  panelContent.hidden = false;
  await loadKeys();
});

keyForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const response = await fetch('/api/premium/keys', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ duration: keyForm.elements.duration.value }) });
  if (!response.ok) { keyStatus.textContent = 'No se pudo generar la key.'; return; }
  const result = await response.json();
  keyStatus.textContent = `${panelCopy().generated}: ${result.key}`;
  await loadKeys();
});

restoreButton.addEventListener('click', restoreCustomizations);
resetConfigButton.addEventListener('click', resetAllConfigurations);