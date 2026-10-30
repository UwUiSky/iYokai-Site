# Mappa configurazioni del pannello — 30 ottobre 2026

Inventario iniziale delle 584 voci ufficiali già salvate nel sito, divise in 25 categorie. Non equivale a 584 pagine implementate. I comandi di azione (ban, musica play, giochi…) non diventano automaticamente opzioni persistenti.

| Area | Voci | Configurazioni e interfacce da analizzare/collegare |
| --- | ---: | --- |
| Admin | 44 | Ruoli, lingua, canali report/suggerimenti, import/export; ruoli/lingua primo adapter scritto. |
| Ai | 16 | Consenso, memoria, ruoli/canali, budget e provider; non concedere token illimitati. |
| Aiuto (primo livello) | 2 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Antinuke | 12 | Limiti azioni distruttive, allowlist e recupero. |
| Antiraid | 17 | Soglie, finestre, lockdown ed esclusioni. |
| iYokai App (app separata, installata sull'utente) | 15 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| iYokai NSFW (app separata, solo canali vietati ai minori) | 7 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| AutoMod | 37 | Filtri, esclusioni ruoli/canali, soglie e sanzioni. |
| Backup | 22 | Destinazioni, permessi, ambito, retention e conferme restore. |
| Clan | 16 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Economia | 14 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Divertimento | 25 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Gestione | 37 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Livelli | 34 | XP, cooldown, esclusioni, premi, classifiche e messaggi. |
| Log | 13 | Menu canali testo/forum per tipo, interruttori eventi, conservazione e ricerca storico eventi. |
| Moderazione | 33 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Ban (modban) | 10 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Moduli | 39 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Musica | 28 | Canale richieste, DJ, limiti, flotta e radio; azioni playback distinte. |
| Owner | 35 | Flag Free/Premium/VIP, annunci embed tradotti, diagnostica e richieste; owner rilevato dal processo bot, VIP non ancora supportato dal registro corrente. |
| Ruoli | 9 | Menu, assegnazione e gerarchia dei ruoli. |
| Sicurezza | 31 | Verifica membri, età account, filtri ingresso, anti-doppi e segnalazioni; intent separati dai permessi. |
| Ticket | 31 | Categorie, ruoli staff, pannelli, trascrizioni e conservazione. |
| Utility | 44 | Analizzare le opzioni persistenti e i vincoli nei repository del bot prima di costruire il form; nessun campo inventato. |
| Vocali | 13 | Categoria, canale di creazione, limiti e permessi temporanei. |

## Decisioni vincolanti

- Lancio gratuito; mensile/annuale futuri, Lifetime tramite richiesta di contatto. Nessun prezzo o provider inventato.
- Il registro bot corrente applica Free/Premium booleano: aggiungere VIP al dominio bot prima di esporre uno switch funzionante. Rispettare i moduli marcati sempre gratuiti.
- Annunci: bozza, anteprima per lingua, conferma owner, coda, deduplicazione, report errori. Canale comunicazioni configurato, fallback agli admin con limiti espliciti; non inviare messaggi durante lo sviluppo.
- Italiano sorgente, inglese base per ulteriori traduzioni. Dieci lingue nel selettore non significano traduzioni complete: attualmente solo etichette assistenza delle otto nuove lingue, resto inglese. Nessun servizio di traduzione automatica runtime attivo.
- Esportazione/cancellazione, retention per tabella, policy titolare e contatto privacy da integrare prima del lancio.
- Adapter in integration/ da installare nel bot; nessuna modifica già applicata alla repository pubblica del bot.
