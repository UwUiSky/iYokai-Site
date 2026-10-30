// Descriptions explain the existing module switches; no extra bot capability is implied.
const rows=[
 ['automod','AutoMod','AutoMod','Filtri automatici per messaggi, spam e menzioni.','Automatic filters for messages, spam and mentions.'],
 ['anti_nuke','Anti-nuke','Anti-nuke','Protezione dalle azioni distruttive di massa.','Protection against mass destructive activity.'],
 ['anti_raid','Anti-raid','Anti-raid','Rilevamento degli ingressi sospetti e dei raid.','Detection of suspicious joins and raids.'],
 ['global_ban','Ban globale','Global bans','Collegamento alla rete di ban globali configurata.','Connection to the configured global ban network.'],
 ['spam_trap','Trappola spam','Spam trap','Canali trappola e segnalazioni per lo spam.','Bait channels and spam reports.'],
 ['verify','Verifica membri','Member verification','Pannello di verifica e liste di accesso dei membri.','Member verification panel and access lists.'],
 ['security_score','Punteggio sicurezza','Security score','Valutazione della sicurezza del server e suggerimenti.','Server security assessment and recommendations.'],
 ['permission_heatmap','Mappa permessi','Permission map','Panoramica dei ruoli con permessi critici.','Overview of roles with critical permissions.'],
 ['moderation_actions','Azioni di moderazione','Moderation actions','Azioni e sanzioni di moderazione.','Moderation actions and sanctions.'],
 ['moderation_case_system','Sistema casi','Case system','Storico dei casi e note di moderazione.','Moderation case history and notes.'],
 ['moderation_clear','Pulizia messaggi','Message cleanup','Rimozione dei messaggi con filtri opzionali.','Message removal with optional filters.'],
 ['moderation_channel_control','Controllo canali','Channel controls','Blocchi dei canali e modalità lenta.','Channel locks and slowmode.'],
 ['moderation_report','Segnalazioni','Reports','Segnalazioni degli utenti allo staff.','User reports to the staff.'],
 ['logging_basic','Log base','Basic logs','Registrazione degli eventi principali del server.','Logging of key server events.'],
 ['logging_advanced','Log avanzati','Advanced logs','Storico dettagliato ed esportazione degli eventi.','Detailed event history and export.'],
 ['ghost_ping_detection','Ghost ping','Ghost pings','Rilevamento delle menzioni rimosse.','Detection of deleted mentions.'],
 ['reactionsnipe','Reaction snipe','Reaction snipe','Consultazione dell’ultima reazione rimossa.','View the last removed reaction.'],
 ['greetings','Benvenuto e addio','Greetings','Messaggi di benvenuto, addio e boost.','Welcome, goodbye and boost messages.'],
 ['leveling','Livelli e XP','Levels & XP','Livelli, esperienza e ricompense della community.','Community levels, experience and rewards.'],
 ['role_menus','Menu ruoli','Role menus','Menu per la selezione dei ruoli.','Menus for selecting roles.'],
 ['tickets','Ticket','Tickets','Richieste di supporto e gestione dei ticket.','Support requests and ticket management.'],
 ['suggestions','Suggerimenti','Suggestions','Raccolta delle proposte per il server.','Collect suggestions for the server.'],
 ['poll','Sondaggi','Polls','Creazione dei sondaggi della community.','Create community polls.'],
 ['sticky_messages','Messaggi fissi','Sticky messages','Messaggi mantenuti visibili nei canali.','Messages kept visible in channels.'],
 ['voice_temp','Vocali temporanei','Temporary voice','Creazione e gestione dei canali vocali temporanei.','Create and manage temporary voice channels.'],
 ['server_stats','Statistiche server','Server statistics','Statistiche del server e andamento della crescita.','Server statistics and growth trends.'],
 ['music','Musica','Music','Riproduzione, coda e controlli del bot musicale.','Music bot playback, queue and controls.'],
 ['fun','Fun','Fun','Giochi e comandi di intrattenimento.','Games and entertainment commands.'],
 ['reminders','Promemoria','Reminders','Gestione dei promemoria personali.','Manage personal reminders.'],
 ['scheduled_messages','Messaggi programmati','Scheduled messages','Programmazione dei messaggi del server.','Schedule server messages.'],
 ['feed_alerts','Avvisi feed','Feed alerts','Notifiche dai feed e dai canali configurati.','Notifications from configured feeds and channels.'],
 ['utility_ping','Utility','Utilities','Strumenti di utilità e verifica della latenza.','Utilities and latency checks.']
];
export const PANEL_MODULES=Object.fromEntries(rows.map(([key,it,en,descriptionIt,descriptionEn])=>[key,{it,en,descriptionIt,descriptionEn}]));
const groups={'Sicurezza':['Sicurezza','Security'],'Moderazione':['Moderazione','Moderation'],'Log':['Log','Logs'],'Community':['Community','Community'],'Utility e fun':['Utility e fun','Utilities & fun']};
export const moduleText=(module,language,translate=()=>null)=>{const entry=PANEL_MODULES[module.key];return {label:translate(`panel.module.${module.key}.label`)??(entry?.[language==='it'?'it':'en']||module.label),description:translate(`panel.module.${module.key}.description`)??(entry?.[language==='it'?'descriptionIt':'descriptionEn']||''),group:translate(`panel.group.${module.group}`)??(groups[module.group]?.[language==='it'?0:1]||module.group)};};
