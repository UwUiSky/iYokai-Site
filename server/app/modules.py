# Chiavi dei moduli del bot (costanti MODULE_* nel repo iYokai-DS-BOT): solo queste si possono attivare dal panel.
MODULES: dict[str, tuple[str, str]] = {
    "automod": ("AutoMod", "Sicurezza"), "anti_nuke": ("Anti-nuke", "Sicurezza"), "anti_raid": ("Anti-raid", "Sicurezza"),
    "global_ban": ("Ban globale", "Sicurezza"), "spam_trap": ("Trappola spam", "Sicurezza"), "verify": ("Verifica membri", "Sicurezza"),
    "security_score": ("Punteggio sicurezza", "Sicurezza"), "permission_heatmap": ("Mappa permessi", "Sicurezza"),
    "moderation_actions": ("Azioni di moderazione", "Moderazione"), "moderation_case_system": ("Sistema casi", "Moderazione"),
    "moderation_clear": ("Pulizia messaggi", "Moderazione"), "moderation_channel_control": ("Controllo canali", "Moderazione"), "moderation_report": ("Segnalazioni", "Moderazione"),
    "logging_basic": ("Log base", "Log"), "logging_advanced": ("Log avanzati", "Log"), "ghost_ping_detection": ("Ghost ping", "Log"), "reactionsnipe": ("Reaction snipe", "Log"),
    "greetings": ("Benvenuto e addio", "Community"), "leveling": ("Livelli e XP", "Community"), "role_menus": ("Menu ruoli", "Community"), "tickets": ("Ticket", "Community"),
    "suggestions": ("Suggerimenti", "Community"), "poll": ("Sondaggi", "Community"), "sticky_messages": ("Messaggi fissi", "Community"), "voice_temp": ("Vocali temporanei", "Community"), "server_stats": ("Statistiche server", "Community"),
    "music": ("Musica", "Utility e fun"), "fun": ("Fun", "Utility e fun"), "reminders": ("Promemoria", "Utility e fun"), "scheduled_messages": ("Messaggi programmati", "Utility e fun"),
    "feed_alerts": ("Avvisi feed", "Utility e fun"), "utility_ping": ("Utility", "Utility e fun"),
}
