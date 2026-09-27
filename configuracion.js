const guildId = new URLSearchParams(location.search).get('guild');
const form = document.querySelector('[data-config-form]');
const buttonsBox = document.querySelector('[data-buttons]');
const message = document.querySelector('[data-config-message]');
const preview = document.querySelector('[data-preview-content]');
const commandRolesBox = document.querySelector('[data-command-roles]');
const configCopy = {
  es: { lyloBrand: 'Lylo', configTitle: 'Configura tus tickets', configIntro: 'Todo se guarda por servidor. Personaliza cada container y mira el resultado en vivo.', configNote: 'Los cambios solo afectan al servidor seleccionado. Los emojis pueden ser Unicode o emojis personalizados de Discord.', panelSection: 'Panel de tickets', ticketSection: 'Ticket creado', logsSection: 'Logs de cierre', permissionsSection: 'Permisos y categorías', panelButtonsSection: 'Botones del panel', commandPermissionsSection: 'Permisos por comando', commandPermissionsNote: 'El propietario siempre puede usarlos. Sin rol asignado, solo el propietario; al elegir un rol, también podrán usarlo sus miembros.', fieldTitle: 'Título', fieldDescription: 'Descripción', fieldExtraText: 'Texto extra', fieldColor: 'Color hexadecimal', maxOpenTicketsLabel: 'Máximo de tickets abiertos por usuario', logsChannel: 'Canal de logs', staffRole: 'Rol staff', defaultCategory: 'Categoría predeterminada', askReason: 'Preguntar motivo al cerrar', emojiClaim: 'Emoji Reclamar', emojiClose: 'Emoji Cerrar', addButton: '+ Añadir botón', saveConfig: 'Guardar configuración', previewLabel: 'Vista previa real', previewPanel: 'Panel', previewTicket: 'Ticket', previewLogs: 'Logs', previewTime: 'Hoy a las 12:00', pickRole: 'Selecciona un rol', pickChannel: 'Selecciona un canal', noCategory: 'Sin categoría', noRole: 'Solo propietario', addButtonLabel: 'Añadir botón', newButton: 'Nuevo botón' },
  en: { lyloBrand: 'Lylo', configTitle: 'Configure your tickets', configIntro: 'Everything is saved per server. Customize each container and preview the result live.', configNote: 'Changes only affect the selected server. Emojis can be Unicode or custom Discord emojis.', panelSection: 'Ticket panel', ticketSection: 'Ticket created', logsSection: 'Close logs', permissionsSection: 'Permissions and categories', panelButtonsSection: 'Panel buttons', commandPermissionsSection: 'Command permissions', commandPermissionsNote: 'The owner can always use them. Without a role assigned, only the owner can; choosing a role lets members use them too.', fieldTitle: 'Title', fieldDescription: 'Description', fieldExtraText: 'Extra text', fieldColor: 'Hex color', maxOpenTicketsLabel: 'Max tickets open per user', logsChannel: 'Logs channel', staffRole: 'Staff role', defaultCategory: 'Default category', askReason: 'Ask for reason when closing', emojiClaim: 'Claim emoji', emojiClose: 'Close emoji', addButton: '+ Add button', saveConfig: 'Save settings', previewLabel: 'Live preview', previewPanel: 'Panel', previewTicket: 'Ticket', previewLogs: 'Logs', previewTime: 'Today at 12:00', pickRole: 'Select a role', pickChannel: 'Select a channel', noCategory: 'No category', noRole: 'Owner only', addButtonLabel: 'Add button', newButton: 'New button' },
  fr: { lyloBrand: 'Lylo', configTitle: 'Configurez vos tickets', configIntro: 'Tout est enregistré par serveur. Personnalisez chaque panneau et voyez le résultat en direct.', configNote: 'Les changements affectent uniquement le serveur sélectionné. Les emojis peuvent être Unicode ou personnalisés Discord.', panelSection: 'Panneau de tickets', ticketSection: 'Ticket créé', logsSection: 'Journaux de fermeture', permissionsSection: 'Permissions et catégories', panelButtonsSection: 'Boutons du panneau', commandPermissionsSection: 'Permissions des commandes', commandPermissionsNote: 'Le propriétaire peut toujours les utiliser. Sans rôle, seul le propriétaire peut; avec un rôle, ses membres peuvent aussi.', fieldTitle: 'Titre', fieldDescription: 'Description', fieldExtraText: 'Texte supplémentaire', fieldColor: 'Couleur hexadécimale', maxOpenTicketsLabel: 'Nombre maximum de tickets ouverts par utilisateur', logsChannel: 'Canal des logs', staffRole: 'Rôle staff', defaultCategory: 'Catégorie par défaut', askReason: 'Demander la raison à la fermeture', emojiClaim: 'Emoji de réclamation', emojiClose: 'Emoji de fermeture', addButton: '+ Ajouter un bouton', saveConfig: 'Enregistrer la configuration', previewLabel: 'Aperçu réel', previewPanel: 'Panneau', previewTicket: 'Ticket', previewLogs: 'Logs', previewTime: 'Aujourd’hui à 12:00', pickRole: 'Sélectionner un rôle', pickChannel: 'Sélectionner un canal', noCategory: 'Aucune catégorie', noRole: 'Propriétaire uniquement', addButtonLabel: 'Ajouter un bouton', newButton: 'Nouveau bouton' },
  pt: { lyloBrand: 'Lylo', configTitle: 'Configure seus tickets', configIntro: 'Tudo é salvo por servidor. Personalize cada container e veja o resultado ao vivo.', configNote: 'As alterações afetam apenas o servidor selecionado. Os emojis podem ser Unicode ou emojis personalizados do Discord.', panelSection: 'Painel de tickets', ticketSection: 'Ticket criado', logsSection: 'Logs de fechamento', permissionsSection: 'Permissões e categorias', panelButtonsSection: 'Botões do painel', commandPermissionsSection: 'Permissões por comando', commandPermissionsNote: 'O proprietário pode usá-los sempre. Sem cargo, apenas o proprietário pode; ao escolher um cargo, também poderão usá-los.', fieldTitle: 'Título', fieldDescription: 'Descrição', fieldExtraText: 'Texto extra', fieldColor: 'Cor hexadecimal', maxOpenTicketsLabel: 'Máximo de tickets abertos por usuário', logsChannel: 'Canal de logs', staffRole: 'Cargo da equipe', defaultCategory: 'Categoria padrão', askReason: 'Perguntar motivo ao fechar', emojiClaim: 'Emoji de reclamar', emojiClose: 'Emoji de fechar', addButton: '+ Adicionar botão', saveConfig: 'Salvar configuração', previewLabel: 'Pré-visualização', previewPanel: 'Painel', previewTicket: 'Ticket', previewLogs: 'Logs', previewTime: 'Hoje às 12:00', pickRole: 'Selecione um cargo', pickChannel: 'Selecione um canal', noCategory: 'Sem categoria', noRole: 'Somente proprietário', addButtonLabel: 'Adicionar botão', newButton: 'Novo botão' },
  id: { lyloBrand: 'Lylo', configTitle: 'Atur tiketmu', configIntro: 'Semua disimpan per server. Sesuaikan setiap panel dan lihat hasilnya langsung.', configNote: 'Perubahan hanya berlaku untuk server yang dipilih. Emoji bisa Unicode atau emoji kustom Discord.', panelSection: 'Panel tiket', ticketSection: 'Tiket dibuat', logsSection: 'Log penutupan', permissionsSection: 'Izin dan kategori', panelButtonsSection: 'Tombol panel', commandPermissionsSection: 'Izin per perintah', commandPermissionsNote: 'Pemilik bisa selalu menggunakannya. Tanpa peran, hanya pemilik yang bisa; jika memilih peran, anggotanya juga bisa.', fieldTitle: 'Judul', fieldDescription: 'Deskripsi', fieldExtraText: 'Teks tambahan', fieldColor: 'Warna hex', maxOpenTicketsLabel: 'Maksimal tiket terbuka per pengguna', logsChannel: 'Kanal log', staffRole: 'Peran staff', defaultCategory: 'Kategori default', askReason: 'Tanya alasan saat menutup', emojiClaim: 'Emoji ambil', emojiClose: 'Emoji tutup', addButton: '+ Tambah tombol', saveConfig: 'Simpan pengaturan', previewLabel: 'Pratinjau', previewPanel: 'Panel', previewTicket: 'Tiket', previewLogs: 'Log', previewTime: 'Hari ini pukul 12:00', pickRole: 'Pilih peran', pickChannel: 'Pilih kanal', noCategory: 'Tanpa kategori', noRole: 'Hanya pemilik', addButtonLabel: 'Tambah tombol', newButton: 'Tombol baru' },
  de: { lyloBrand: 'Lylo', configTitle: 'Konfiguriere deine Tickets', configIntro: 'Alles wird pro Server gespeichert. Passe jedes Element an und sieh dir das Ergebnis live an.', configNote: 'Änderungen betreffen nur den ausgewählten Server. Emojis können Unicode oder Discord-Custom-Emojis sein.', panelSection: 'Ticket-Panel', ticketSection: 'Ticket erstellt', logsSection: 'Schließungsprotokoll', permissionsSection: 'Berechtigungen und Kategorien', panelButtonsSection: 'Panel-Schaltflächen', commandPermissionsSection: 'Befehlsrechte', commandPermissionsNote: 'Der Besitzer kann sie immer nutzen. Ohne Rolle kann nur der Besitzer; mit Rolle auch Mitglieder.', fieldTitle: 'Titel', fieldDescription: 'Beschreibung', fieldExtraText: 'Zusätzlicher Text', fieldColor: 'Hex-Farbe', maxOpenTicketsLabel: 'Maximal offene Tickets pro Benutzer', logsChannel: 'Log-Kanal', staffRole: 'Staff-Rolle', defaultCategory: 'Standardkategorie', askReason: 'Grund beim Schließen fragen', emojiClaim: 'Übernahme-Emoji', emojiClose: 'Schließen-Emoji', addButton: '+ Schaltfläche hinzufügen', saveConfig: 'Einstellungen speichern', previewLabel: 'Live-Vorschau', previewPanel: 'Panel', previewTicket: 'Ticket', previewLogs: 'Logs', previewTime: 'Heute um 12:00', pickRole: 'Rolle auswählen', pickChannel: 'Kanal auswählen', noCategory: 'Keine Kategorie', noRole: 'Nur Besitzer', addButtonLabel: 'Schaltfläche hinzufügen', newButton: 'Neue Schaltfläche' }
};
const welcomeConfigCopy = {
  es: { welcomeSystem: 'Bienvenidas System', welcomeEnabled: 'Activar bienvenidas y autorol', welcomeChannel: 'Canal de bienvenida', welcomeLinkChannel: 'Canal para la variable {channel}', welcomeTitleLabel: 'Título del container', welcomeTextLabel: 'Texto del container', welcomeVariables: 'Variables: {username}, {server}, {memberCount}, {channel}. El color se elige al azar y no se puede configurar.', welcomeRole: 'Rol automático', previewWelcome: 'Bienvenida', noWelcomeChannel: 'Selecciona un canal', noLinkChannel: 'Sin canal vinculado', noAutoRole: 'Sin rol automático', defaultWelcomeTitle: 'Bienvenido/a `{username}`', defaultWelcomeText: 'Gracias por unirte a **{server}**. Contigo somos **{memberCount}**' },
  en: { welcomeSystem: 'Welcome System', welcomeEnabled: 'Enable welcome and auto-role', welcomeChannel: 'Welcome channel', welcomeLinkChannel: 'Channel for the {channel} variable', welcomeTitleLabel: 'Container title', welcomeTextLabel: 'Container text', welcomeVariables: 'Variables: {username}, {server}, {memberCount}, {channel}. The accent color is random and cannot be configured.', welcomeRole: 'Automatic role', previewWelcome: 'Welcome', noWelcomeChannel: 'Select a channel', noLinkChannel: 'No linked channel', noAutoRole: 'No automatic role', defaultWelcomeTitle: 'Welcome, `{username}`', defaultWelcomeText: 'Thanks for joining **{server}**. There are now **{memberCount}** of us.' },
  fr: { welcomeSystem: 'Système de bienvenue', welcomeEnabled: 'Activer bienvenue et rôle automatique', welcomeChannel: 'Salon de bienvenue', welcomeLinkChannel: 'Salon pour la variable {channel}', welcomeTitleLabel: 'Titre du container', welcomeTextLabel: 'Texte du container', welcomeVariables: 'Variables : {username}, {server}, {memberCount}, {channel}. La couleur est aléatoire et non configurable.', welcomeRole: 'Rôle automatique', previewWelcome: 'Bienvenue', noWelcomeChannel: 'Choisir un salon', noLinkChannel: 'Aucun salon lié', noAutoRole: 'Aucun rôle automatique', defaultWelcomeTitle: 'Bienvenue, `{username}`', defaultWelcomeText: 'Merci d’avoir rejoint **{server}**. Nous sommes maintenant **{memberCount}**.' },
  pt: { welcomeSystem: 'Sistema de boas-vindas', welcomeEnabled: 'Ativar boas-vindas e cargo automático', welcomeChannel: 'Canal de boas-vindas', welcomeLinkChannel: 'Canal para a variável {channel}', welcomeTitleLabel: 'Título do container', welcomeTextLabel: 'Texto do container', welcomeVariables: 'Variáveis: {username}, {server}, {memberCount}, {channel}. A cor é aleatória e não pode ser configurada.', welcomeRole: 'Cargo automático', previewWelcome: 'Boas-vindas', noWelcomeChannel: 'Selecione um canal', noLinkChannel: 'Sem canal vinculado', noAutoRole: 'Sem cargo automático', defaultWelcomeTitle: 'Boas-vindas, `{username}`', defaultWelcomeText: 'Obrigado por entrar em **{server}**. Agora somos **{memberCount}**.' },
  id: { welcomeSystem: 'Sistem Sambutan', welcomeEnabled: 'Aktifkan sambutan dan peran otomatis', welcomeChannel: 'Kanal sambutan', welcomeLinkChannel: 'Kanal untuk variabel {channel}', welcomeTitleLabel: 'Judul container', welcomeTextLabel: 'Teks container', welcomeVariables: 'Variabel: {username}, {server}, {memberCount}, {channel}. Warna dipilih acak dan tidak dapat diatur.', welcomeRole: 'Peran otomatis', previewWelcome: 'Sambutan', noWelcomeChannel: 'Pilih kanal', noLinkChannel: 'Tidak ada kanal tertaut', noAutoRole: 'Tanpa peran otomatis', defaultWelcomeTitle: 'Selamat datang, `{username}`', defaultWelcomeText: 'Terima kasih telah bergabung dengan **{server}**. Sekarang ada **{memberCount}** orang.' },
  de: { welcomeSystem: 'Willkommenssystem', welcomeEnabled: 'Willkommen und automatische Rolle aktivieren', welcomeChannel: 'Willkommenskanal', welcomeLinkChannel: 'Kanal für die Variable {channel}', welcomeTitleLabel: 'Container-Titel', welcomeTextLabel: 'Container-Text', welcomeVariables: 'Variablen: {username}, {server}, {memberCount}, {channel}. Die Farbe ist zufällig und nicht einstellbar.', welcomeRole: 'Automatische Rolle', previewWelcome: 'Willkommen', noWelcomeChannel: 'Kanal auswählen', noLinkChannel: 'Kein verknüpfter Kanal', noAutoRole: 'Keine automatische Rolle', defaultWelcomeTitle: 'Willkommen, `{username}`', defaultWelcomeText: 'Danke, dass du **{server}** beigetreten bist. Jetzt sind wir **{memberCount}**.' }
};
const configSaveErrorCopy = {
  es: { welcomeChannelRequired: 'Activa la bienvenida solo después de elegir su canal.', welcomeChannelPermissions: 'Lylo necesita Ver canal y Enviar mensajes en el canal de bienvenida.', welcomeRoleNotAssignable: 'Lylo no puede asignar ese rol. Dale Administrar roles y sube el rol de Lylo por encima.', invalidWelcomeRole: 'El rol automático ya no existe o no se puede asignar.', invalidLinkChannel: 'El canal de la variable {channel} ya no existe.', configForbidden: 'Inicia sesión con una cuenta que pueda administrar este servidor.', botNotAdded: 'Añade Lylo al servidor antes de guardar.', buttonsRequired: 'El panel necesita al menos un botón.', configSaveError: 'No se pudo guardar la configuración de tickets.', welcomeSaveError: 'Tickets se guardó, pero no se pudo guardar la bienvenida.', configNetworkError: 'No hubo conexión al guardar. Revisa tu conexión e inténtalo otra vez.' },
  en: { welcomeChannelRequired: 'Choose a welcome channel before enabling the system.', welcomeChannelPermissions: 'Lylo needs View Channel and Send Messages in the welcome channel.', welcomeRoleNotAssignable: 'Lylo cannot assign that role. Grant Manage Roles and move Lylo’s role above it.', invalidWelcomeRole: 'The automatic role no longer exists or cannot be assigned.', invalidLinkChannel: 'The channel for {channel} no longer exists.', configForbidden: 'Log in with an account that can manage this server.', botNotAdded: 'Add Lylo to this server before saving.', buttonsRequired: 'The ticket panel needs at least one button.', configSaveError: 'Could not save ticket settings.', welcomeSaveError: 'Tickets were saved, but welcome settings could not be saved.', configNetworkError: 'Could not connect while saving. Check your connection and try again.' },
  fr: { welcomeChannelRequired: 'Choisissez un salon de bienvenue avant d’activer le système.', welcomeChannelPermissions: 'Lylo a besoin des droits Voir le salon et Envoyer des messages.', welcomeRoleNotAssignable: 'Lylo ne peut pas attribuer ce rôle. Accordez Gérer les rôles et placez le rôle de Lylo au-dessus.', invalidWelcomeRole: 'Le rôle automatique n’existe plus ou ne peut pas être attribué.', invalidLinkChannel: 'Le salon de la variable {channel} n’existe plus.', configForbidden: 'Connectez-vous avec un compte autorisé à gérer ce serveur.', botNotAdded: 'Ajoutez Lylo au serveur avant d’enregistrer.', buttonsRequired: 'Le panneau de tickets doit contenir au moins un bouton.', configSaveError: 'Impossible d’enregistrer les tickets.', welcomeSaveError: 'Les tickets sont enregistrés, mais pas la bienvenue.', configNetworkError: 'Connexion impossible pendant l’enregistrement. Réessayez.' },
  pt: { welcomeChannelRequired: 'Escolha o canal de boas-vindas antes de ativar o sistema.', welcomeChannelPermissions: 'Lylo precisa de Ver canal e Enviar mensagens no canal de boas-vindas.', welcomeRoleNotAssignable: 'Lylo não pode atribuir esse cargo. Dê Gerenciar cargos e coloque o cargo do Lylo acima dele.', invalidWelcomeRole: 'O cargo automático não existe mais ou não pode ser atribuído.', invalidLinkChannel: 'O canal da variável {channel} não existe mais.', configForbidden: 'Entre com uma conta que possa gerenciar este servidor.', botNotAdded: 'Adicione Lylo ao servidor antes de salvar.', buttonsRequired: 'O painel de tickets precisa de pelo menos um botão.', configSaveError: 'Não foi possível salvar os tickets.', welcomeSaveError: 'Os tickets foram salvos, mas as boas-vindas não.', configNetworkError: 'Sem conexão ao salvar. Verifique a conexão e tente novamente.' },
  id: { welcomeChannelRequired: 'Pilih kanal sambutan sebelum mengaktifkan sistem.', welcomeChannelPermissions: 'Lylo memerlukan izin Lihat Kanal dan Kirim Pesan di kanal sambutan.', welcomeRoleNotAssignable: 'Lylo tidak dapat memberikan peran itu. Beri izin Kelola Peran dan pindahkan peran Lylo ke atasnya.', invalidWelcomeRole: 'Peran otomatis sudah tidak ada atau tidak dapat diberikan.', invalidLinkChannel: 'Kanal untuk variabel {channel} sudah tidak ada.', configForbidden: 'Masuk dengan akun yang dapat mengelola server ini.', botNotAdded: 'Tambahkan Lylo ke server sebelum menyimpan.', buttonsRequired: 'Panel tiket memerlukan setidaknya satu tombol.', configSaveError: 'Pengaturan tiket tidak dapat disimpan.', welcomeSaveError: 'Tiket tersimpan, tetapi sambutan gagal disimpan.', configNetworkError: 'Tidak ada koneksi saat menyimpan. Periksa koneksi lalu coba lagi.' },
  de: { welcomeChannelRequired: 'Wähle vor dem Aktivieren einen Willkommenskanal aus.', welcomeChannelPermissions: 'Lylo benötigt Kanal ansehen und Nachrichten senden im Willkommenskanal.', welcomeRoleNotAssignable: 'Lylo kann diese Rolle nicht vergeben. Erteile Rollen verwalten und setze Lylo darüber.', invalidWelcomeRole: 'Die automatische Rolle existiert nicht mehr oder kann nicht vergeben werden.', invalidLinkChannel: 'Der Kanal für {channel} existiert nicht mehr.', configForbidden: 'Melde dich mit einem Konto an, das diesen Server verwalten darf.', botNotAdded: 'Füge Lylo vor dem Speichern zum Server hinzu.', buttonsRequired: 'Das Ticket-Panel benötigt mindestens einen Button.', configSaveError: 'Ticket-Einstellungen konnten nicht gespeichert werden.', welcomeSaveError: 'Tickets wurden gespeichert, aber die Begrüßung nicht.', configNetworkError: 'Beim Speichern keine Verbindung. Prüfe deine Verbindung und versuche es erneut.' }
};
const configRuntimeCopy = {
  es: { buttonName: 'Nombre', buttonEmoji: 'Emoji', removeButton: 'Quitar botón', ownerOnly: 'Solo propietario', noCommands: 'No hay comandos cargados.', savedMessage: 'Configuración guardada en este servidor.', saveError: 'No se pudo guardar la configuración.', commandFallback: 'comando', previewUser: 'Usuario', previewClaimed: 'Reclamado', previewNotClaimed: 'Ticket no reclamado', previewDate: 'Hoy', previewClaim: 'Reclamar', previewClose: 'Cerrar', previewClosedBy: 'Cerró', previewReason: 'Motivo', previewNoReason: 'Sin motivo', previewPanelText: 'Abre ticket si necesitas ayuda.', previewTicketTitle: 'TICKET CREADO', previewTicketText: 'Tu ticket ha sido creado.', previewLogsTitle: 'TICKET CERRADO', previewLogsText: 'Registro del cierre del ticket.', previewButton: 'Crear ticket' },
  en: { buttonName: 'Name', buttonEmoji: 'Emoji', removeButton: 'Remove button', ownerOnly: 'Owner only', noCommands: 'No commands loaded.', savedMessage: 'Settings saved for this server.', saveError: 'Could not save settings.', commandFallback: 'command', previewUser: 'User', previewClaimed: 'Claimed', previewNotClaimed: 'Ticket not claimed', previewDate: 'Today', previewClaim: 'Claim', previewClose: 'Close', previewClosedBy: 'Closed by', previewReason: 'Reason', previewNoReason: 'No reason', previewPanelText: 'Open a ticket if you need help.', previewTicketTitle: 'TICKET CREATED', previewTicketText: 'Your ticket has been created.', previewLogsTitle: 'TICKET CLOSED', previewLogsText: 'Ticket closure record.', previewButton: 'Create ticket' },
  fr: { buttonName: 'Nom', buttonEmoji: 'Emoji', removeButton: 'Supprimer le bouton', ownerOnly: 'Propriétaire uniquement', noCommands: 'Aucune commande chargée.', savedMessage: 'Configuration enregistrée pour ce serveur.', saveError: 'Impossible d’enregistrer la configuration.', commandFallback: 'commande', previewUser: 'Utilisateur', previewClaimed: 'Pris en charge', previewNotClaimed: 'Ticket non pris en charge', previewDate: 'Aujourd’hui', previewClaim: 'Prendre en charge', previewClose: 'Fermer', previewClosedBy: 'Fermé par', previewReason: 'Motif', previewNoReason: 'Aucun motif', previewPanelText: 'Ouvrez un ticket si vous avez besoin d’aide.', previewTicketTitle: 'TICKET CRÉÉ', previewTicketText: 'Votre ticket a été créé.', previewLogsTitle: 'TICKET FERMÉ', previewLogsText: 'Historique de fermeture du ticket.', previewButton: 'Créer un ticket' },
  pt: { buttonName: 'Nome', buttonEmoji: 'Emoji', removeButton: 'Remover botão', ownerOnly: 'Somente proprietário', noCommands: 'Nenhum comando carregado.', savedMessage: 'Configuração salva neste servidor.', saveError: 'Não foi possível salvar a configuração.', commandFallback: 'comando', previewUser: 'Usuário', previewClaimed: 'Assumido', previewNotClaimed: 'Ticket não assumido', previewDate: 'Hoje', previewClaim: 'Assumir', previewClose: 'Fechar', previewClosedBy: 'Fechado por', previewReason: 'Motivo', previewNoReason: 'Sem motivo', previewPanelText: 'Abra um ticket se precisar de ajuda.', previewTicketTitle: 'TICKET CRIADO', previewTicketText: 'Seu ticket foi criado.', previewLogsTitle: 'TICKET FECHADO', previewLogsText: 'Registro do fechamento do ticket.', previewButton: 'Criar ticket' },
  id: { buttonName: 'Nama', buttonEmoji: 'Emoji', removeButton: 'Hapus tombol', ownerOnly: 'Hanya pemilik', noCommands: 'Tidak ada perintah yang dimuat.', savedMessage: 'Pengaturan disimpan untuk server ini.', saveError: 'Pengaturan tidak dapat disimpan.', commandFallback: 'perintah', previewUser: 'Pengguna', previewClaimed: 'Diambil', previewNotClaimed: 'Tiket belum diambil', previewDate: 'Hari ini', previewClaim: 'Ambil', previewClose: 'Tutup', previewClosedBy: 'Ditutup oleh', previewReason: 'Alasan', previewNoReason: 'Tanpa alasan', previewPanelText: 'Buka tiket jika kamu membutuhkan bantuan.', previewTicketTitle: 'TIKET DIBUAT', previewTicketText: 'Tiketmu telah dibuat.', previewLogsTitle: 'TIKET DITUTUP', previewLogsText: 'Catatan penutupan tiket.', previewButton: 'Buat tiket' },
  de: { buttonName: 'Name', buttonEmoji: 'Emoji', removeButton: 'Schaltfläche entfernen', ownerOnly: 'Nur Besitzer', noCommands: 'Keine Befehle geladen.', savedMessage: 'Einstellungen für diesen Server gespeichert.', saveError: 'Einstellungen konnten nicht gespeichert werden.', commandFallback: 'Befehl', previewUser: 'Benutzer', previewClaimed: 'Übernommen', previewNotClaimed: 'Ticket nicht übernommen', previewDate: 'Heute', previewClaim: 'Übernehmen', previewClose: 'Schließen', previewClosedBy: 'Geschlossen von', previewReason: 'Grund', previewNoReason: 'Kein Grund', previewPanelText: 'Öffne ein Ticket, wenn du Hilfe brauchst.', previewTicketTitle: 'TICKET ERSTELLT', previewTicketText: 'Dein Ticket wurde erstellt.', previewLogsTitle: 'TICKET GESCHLOSSEN', previewLogsText: 'Protokoll zur Ticketschließung.', previewButton: 'Ticket erstellen' }
};
let buttons = [{ label: 'Crear Ticket', emoji: '', categoryId: '' }];
let categories = [];
let commandDefinitions = [];
const roleAssignableCommands = new Set(['addblock', 'blocklist', 'removeblock', 'rename', 'setup:tickets', 'setup:honeypot', 'clear', 'unclaim']);
let previewMode = 'panel';
let configMessageKey = '';
const welcomePreviewColor = `#${Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, '0')}`;

function formatCommandLabel(name) {
  return String(name || '').replace(/[-_]+/g, ' ').trim() || 'comando';
}

function currentConfigCopy() {
  const language = document.documentElement.lang;
  return { ...(configCopy[language] || configCopy.es), ...(configRuntimeCopy[language] || configRuntimeCopy.es), ...(welcomeConfigCopy[language] || welcomeConfigCopy.es), ...(configSaveErrorCopy[language] || configSaveErrorCopy.es) };
}

function setConfigMessage(key) {
  configMessageKey = key;
  message.textContent = currentConfigCopy()[key] || '';
}

function applyConfigLanguage() {
  const copy = currentConfigCopy();
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (value) element.textContent = value;
  });
  const optionDefaults = {
    logsChannelId: copy.pickChannel,
    staffRoleId: copy.pickRole,
    categoryId: copy.noCategory,
    noRole: copy.noRole
  };
  const logsSelect = form.elements.logsChannelId;
  const staffSelect = form.elements.staffRoleId;
  const categorySelect = form.elements.categoryId;
  if (logsSelect) {
    const first = logsSelect.querySelector('option[value=""]');
    if (first) first.textContent = copy.pickChannel;
  }
  if (staffSelect) {
    const first = staffSelect.querySelector('option[value=""]');
    if (first) first.textContent = copy.pickRole;
  }
  if (categorySelect) {
    const first = categorySelect.querySelector('option[value=""]');
    if (first) first.textContent = copy.noCategory;
  }
  if (form.elements.welcomeChannelId.options[0]) form.elements.welcomeChannelId.options[0].textContent = copy.noWelcomeChannel;
  if (form.elements.welcomeLinkChannelId.options[0]) form.elements.welcomeLinkChannelId.options[0].textContent = copy.noLinkChannel;
  if (form.elements.welcomeRoleId.options[0]) form.elements.welcomeRoleId.options[0].textContent = copy.noAutoRole;
  const addButton = document.querySelector('[data-add-button]');
  if (addButton) addButton.textContent = copy.addButton;
  const submit = document.querySelector('.save-config');
  if (submit) submit.textContent = copy.saveConfig;
  const previewTabs = document.querySelectorAll('[data-preview-tab]');
  previewTabs.forEach((tab) => {
    const key = { panel: 'previewPanel', ticket: 'previewTicket', logs: 'previewLogs', welcome: 'previewWelcome' }[tab.dataset.previewTab];
    if (copy[key]) tab.textContent = copy[key];
  });
  if (configMessageKey) message.textContent = copy[configMessageKey] || '';
  buttonsBox.querySelectorAll('[data-button-label]').forEach((input) => { input.placeholder = copy.buttonName; });
  buttonsBox.querySelectorAll('[data-button-emoji]').forEach((input) => { input.placeholder = copy.buttonEmoji; });
  buttonsBox.querySelectorAll('[data-button-category] option[value=""]').forEach((option) => { option.textContent = copy.noCategory; });
  buttonsBox.querySelectorAll('[data-remove-button]').forEach((button) => { button.title = copy.removeButton || '×'; });
  commandRolesBox.querySelectorAll('[data-command-role] option[value=""]').forEach((option) => { option.textContent = copy.ownerOnly; });
  updatePreview();
}

function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]); }
function collectButtons() { return buttons.map((button, index) => ({ label: document.querySelector(`[data-button-label="${index}"]`)?.value ?? button.label, emoji: document.querySelector(`[data-button-emoji="${index}"]`)?.value ?? button.emoji, categoryId: document.querySelector(`[data-button-category="${index}"]`)?.value || button.categoryId || null })); }
function renderButtons() {
  const copy = currentConfigCopy();
  buttonsBox.innerHTML = buttons.map((button, index) => `<div class="button-config"><input data-button-label="${index}" value="${escapeHtml(button.label)}" placeholder="${escapeHtml(copy.buttonName)}"><input data-button-emoji="${index}" value="${escapeHtml(button.emoji)}" placeholder="${escapeHtml(copy.buttonEmoji)}"><select data-button-category="${index}"><option value="">${escapeHtml(copy.noCategory)}</option>${categories.map((category) => `<option value="${category.id}" ${button.categoryId === category.id ? 'selected' : ''}>${escapeHtml(category.name)}</option>`).join('')}</select><button type="button" data-remove-button="${index}" title="${escapeHtml(copy.removeButton || '×')}">×</button></div>`).join('');
  buttonsBox.querySelectorAll('[data-remove-button]').forEach((button) => button.addEventListener('click', () => { if (buttons.length > 1) { buttons.splice(Number(button.dataset.removeButton), 1); renderButtons(); } }));
  buttonsBox.querySelectorAll('input, select').forEach((input) => input.addEventListener('input', updatePreview));
  updatePreview();
}
function currentColor(name) { const value = form.elements[name].value.trim(); return /^#[0-9a-f]{6}$/i.test(value) ? value : ''; }
function renderWelcomePreviewText(value) {
  return escapeHtml(value || '')
    .replace(/\{username\}/g, '<span class="welcome-variable">NuevoUsuario</span>')
    .replace(/\{server\}/g, '<span class="welcome-variable">Lylo Comunidad</span>')
    .replace(/\{memberCount\}/g, '<span class="welcome-variable">128</span>')
    .replace(/\{channel\}/g, `<span class="mention">#${escapeHtml(form.elements.welcomeLinkChannelId.selectedOptions[0]?.textContent || currentConfigCopy().noLinkChannel)}</span>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}
function updatePreview() {
  const copy = currentConfigCopy();
  if (previewMode === 'welcome') {
    const welcomeTitle = form.elements.welcomeTitle.value || copy.defaultWelcomeTitle;
    const welcomeText = form.elements.welcomeText.value || copy.defaultWelcomeText;
    const roleName = form.elements.welcomeRoleId.selectedOptions[0]?.textContent || copy.noAutoRole;
    preview.innerHTML = `<div class="discord-container welcome-preview-container" style="--container-accent:${welcomePreviewColor};--container-tint:${welcomePreviewColor}"><p class="welcome-preview-mention"><span class="mention">@NuevoUsuario</span></p><div class="welcome-preview-layout"><div class="welcome-preview-title"># ${renderWelcomePreviewText(welcomeTitle)}</div><img src="https://cdn.discordapp.com/embed/avatars/2.png" alt="NuevoUsuario"></div><p class="welcome-preview-text">${renderWelcomePreviewText(welcomeText)}</p></div><p class="welcome-preview-role">${escapeHtml(copy.welcomeRole)}: ${escapeHtml(roleName)}</p>`;
    return;
  }
  const panelButtons = collectButtons();
  const color = previewMode === 'panel' ? currentColor('panelColor') : previewMode === 'ticket' ? currentColor('ticketColor') : currentColor('logsColor');
  preview.style.borderLeftColor = color || 'transparent';
  const containerStyle = ` style="--container-accent: ${escapeHtml(color || '#4f545c')}; --container-tint: ${escapeHtml(color || '#4f545c')}"`;
  if (previewMode === 'panel') preview.innerHTML = `<div class="discord-container"${containerStyle}><strong># ${escapeHtml(form.panelTitle.value || 'TICKETS')}</strong><p>${escapeHtml(form.panelText.value || copy.previewPanelText)}</p><hr>${panelButtons.map((button) => `<button class="discord-button">${escapeHtml(`${button.emoji ? `${button.emoji} ` : ''}${button.label || copy.previewButton}`)}</button>`).join('')}</div>`;
  if (previewMode === 'ticket') preview.innerHTML = `<div class="discord-container"${containerStyle}><strong># ${escapeHtml(form.ticketTitle.value || copy.previewTicketTitle)}</strong><p><span class="mention">@${escapeHtml(copy.previewUser.toLowerCase())}</span> <span class="role-mention">@staff</span></p><p>${escapeHtml(form.ticketText.value || copy.previewTicketText)}</p><hr><p>${copy.previewUser}: <span class="mention">@${escapeHtml(copy.previewUser.toLowerCase())}</span><br>${copy.previewClaimed}: ${copy.previewNotClaimed}<br>${copy.previewDate}</p><button class="discord-button success">${escapeHtml(form.claimEmoji.value ? `${form.claimEmoji.value} ` : '')}${escapeHtml(copy.previewClaim)}</button><button class="discord-button danger">${escapeHtml(form.closeEmoji.value ? `${form.closeEmoji.value} ` : '')}${escapeHtml(copy.previewClose)}</button></div>`;
  if (previewMode === 'logs') preview.innerHTML = `<div class="discord-container"${containerStyle}><strong># ${escapeHtml(form.logsTitle.value || copy.previewLogsTitle)}</strong><p>${escapeHtml(form.logsText.value || copy.previewLogsText)}</p><hr><p>${copy.previewUser}: <span class="mention">@${escapeHtml(copy.previewUser.toLowerCase())}</span><br>${copy.previewClaimed}: <span class="mention">@staff</span><br>${copy.previewClosedBy}: <span class="mention">@staff</span><br>${copy.previewReason}: ${copy.previewNoReason}</p></div>`;
}
function renderCommandRoles() {
  if (!commandRolesBox) return;
  const selected = {};
  const current = JSON.parse(localStorage.getItem(`lylo-command-roles-${guildId}`) || 'null') || {};
  const roleOptions = (JSON.parse(localStorage.getItem(`lylo-role-options-${guildId}`) || 'null') || []).map((role) => `<option value="${role.id}">${escapeHtml(role.name)}</option>`).join('');
  commandDefinitions.filter((command) => roleAssignableCommands.has(command.name)).forEach((command) => {
    selected[command.name] = current[command.name]
      || (command.name === 'setup:tickets' ? current.setup : '')
      || (command.name === 'setup:honeypot' ? current.honeypot : '')
      || '';
  });
  const assignableDefinitions = commandDefinitions.filter((command) => roleAssignableCommands.has(command.name));
  commandRolesBox.innerHTML = assignableDefinitions.length ? assignableDefinitions.map((command) => `<label class="command-role-item"><span>${escapeHtml(command.label || `/${formatCommandLabel(command.name)}`)}</span><select data-command-role="${command.name}"><option value="">${escapeHtml(currentConfigCopy().ownerOnly)}</option>${roleOptions}</select></label>`).join('') : `<p class="config-note">${escapeHtml(currentConfigCopy().noCommands)}</p>`;
  commandRolesBox.querySelectorAll('[data-command-role]').forEach((select) => {
    const name = select.dataset.commandRole;
    select.value = selected[name] || '';
  });
}

function collectCommandRoles() {
  const values = {};
  document.querySelectorAll('[data-command-role]').forEach((select) => {
    const name = select.dataset.commandRole;
    const value = select.value;
    if (value) values[name] = value;
  });
  return values;
}

async function loadOptions() {
  if (!guildId) return;
  const response = await fetch(`/api/guild-options/${guildId}`);
  if (!response.ok) return;
  const options = await response.json();
  categories = options.categories || [];
  const roleOptions = (options.roles || []).map((role) => ({ id: role.id, name: role.name }));
  localStorage.setItem(`lylo-role-options-${guildId}`, JSON.stringify(roleOptions));
  const roleOptionsHtml = roleOptions.map((role) => `<option value="${role.id}">${escapeHtml(role.name)}</option>`).join('');
  const channelOptionsHtml = (options.channels || []).map((channel) => `<option value="${channel.id}"># ${escapeHtml(channel.name)}</option>`).join('');
  form.elements.staffRoleId.innerHTML = '<option value="">Selecciona un rol</option>' + roleOptionsHtml;
  form.elements.logsChannelId.innerHTML = '<option value="">Selecciona un canal</option>' + (options.channels || []).map((channel) => `<option value="${channel.id}"># ${escapeHtml(channel.name)}</option>`).join('');
  form.elements.welcomeRoleId.innerHTML = '<option value="">Sin rol automático</option>' + roleOptionsHtml;
  form.elements.welcomeChannelId.innerHTML = '<option value="">Selecciona un canal</option>' + channelOptionsHtml;
  form.elements.welcomeLinkChannelId.innerHTML = '<option value="">Sin canal vinculado</option>' + channelOptionsHtml;
  form.elements.categoryId.innerHTML = '<option value="">Sin categoría</option>' + categories.map((category) => `<option value="${category.id}">${escapeHtml(category.name)}</option>`).join('');
  renderCommandRoles();
  renderButtons();
  applyConfigLanguage();
}
async function loadCommandDefinitions() {
  try {
    const response = await fetch('/api/command-definitions');
    if (!response.ok) return;
    const { commands = [] } = await response.json();
    commandDefinitions = commands.filter((command) => roleAssignableCommands.has(command.name));
    renderCommandRoles();
  } catch {
    commandDefinitions = [];
    renderCommandRoles();
  }
}
async function loadConfig() { if (!guildId) return; const response = await fetch(`/api/guild-config/${guildId}`); if (!response.ok) return; const { config } = await response.json(); if (!config) return; Object.entries(config).forEach(([key, value]) => { const field = form.elements[key]; if (!field || key === 'buttons' || key === 'commandRoles') return; if (field.type === 'checkbox') field.checked = value; else if (value !== null && value !== undefined && value !== '') field.value = value; }); const storedRoles = config.commandRoles || {};
  localStorage.setItem(`lylo-command-roles-${guildId}`, JSON.stringify(storedRoles));
  buttons = config.buttons?.length ? config.buttons : buttons; renderCommandRoles(); renderButtons(); }
async function loadWelcomeConfig() {
  if (!guildId) return;
  const response = await fetch(`/api/guild-welcome/${guildId}`);
  if (!response.ok) return;
  const { config } = await response.json();
  form.elements.welcomeEnabled.checked = config.enabled;
  form.elements.welcomeChannelId.value = config.channelId;
  form.elements.welcomeLinkChannelId.value = config.linkChannelId;
  form.elements.welcomeRoleId.value = config.roleId;
  form.elements.welcomeTitle.value = config.title;
  form.elements.welcomeText.value = config.text;
  updatePreview();
}
form.addEventListener('input', updatePreview);
form.addEventListener('change', updatePreview);
document.querySelectorAll('[data-preview-tab]').forEach((tab) => tab.addEventListener('click', () => { previewMode = tab.dataset.previewTab; document.querySelectorAll('[data-preview-tab]').forEach((item) => item.classList.toggle('active', item === tab)); updatePreview(); }));
document.querySelector('[data-add-button]').addEventListener('click', () => { buttons.push({ label: currentConfigCopy().newButton, emoji: '', categoryId: '' }); renderButtons(); });
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!buttons.length) return;
  const data = Object.fromEntries(new FormData(form));
  data.askCloseReason = form.askCloseReason.checked;
  data.buttons = collectButtons();
  data.commandRoles = collectCommandRoles();
  localStorage.setItem(`lylo-command-roles-${guildId}`, JSON.stringify(data.commandRoles));
  const welcome = {
    enabled: form.elements.welcomeEnabled.checked,
    channelId: form.elements.welcomeChannelId.value,
    linkChannelId: form.elements.welcomeLinkChannelId.value,
    roleId: form.elements.welcomeRoleId.value,
    title: form.elements.welcomeTitle.value,
    text: form.elements.welcomeText.value
  };
  if (welcome.enabled && !welcome.channelId) {
    message.textContent = currentConfigCopy().welcomeChannelRequired;
    return;
  }
  try {
    const [ticketResponse, welcomeResponse] = await Promise.all([
      fetch(`/api/guild-config/${guildId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }),
      fetch(`/api/guild-welcome/${guildId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(welcome) })
    ]);
    const [ticketResult, welcomeResult] = await Promise.all([
      ticketResponse.json().catch(() => ({})),
      welcomeResponse.json().catch(() => ({}))
    ]);
    const errors = { forbidden: 'configForbidden', bot_not_added: 'botNotAdded', button_required: 'buttonsRequired', welcome_channel_required: 'welcomeChannelRequired', welcome_channel_permissions: 'welcomeChannelPermissions', welcome_role_not_assignable: 'welcomeRoleNotAssignable', invalid_welcome_role: 'invalidWelcomeRole', invalid_link_channel: 'invalidLinkChannel' };
    if (!ticketResponse.ok) {
      message.textContent = currentConfigCopy()[errors[ticketResult.error] || 'configSaveError'];
      return;
    }
    if (!welcomeResponse.ok) {
      message.textContent = currentConfigCopy()[errors[welcomeResult.error] || 'welcomeSaveError'];
      return;
    }
    setConfigMessage('savedMessage');
  } catch {
    message.textContent = currentConfigCopy().configNetworkError;
  }
});
document.querySelector('[data-preview-tab="panel"]').classList.add('active');
applyConfigLanguage();
document.addEventListener('lylo-language-change', applyConfigLanguage);
renderButtons(); renderCommandRoles(); loadOptions().then(() => Promise.all([loadConfig(), loadWelcomeConfig(), loadCommandDefinitions()]));
