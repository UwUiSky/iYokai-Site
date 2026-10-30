# Lore e identità canoniche

Fonte dell'autrice: `iYokai_Lore_Complete.it.txt`, conservata integralmente.
Le 16 sezioni narrative sono in `src/data/spirit-lore.it.json`, senza riscritture.
Le sintesi SEO finali alimentano le bio in `spirit-bios.it.json`; la bio della
flotta riprende un paragrafo della lore collettiva. La lore di Main coincide
con la sezione Kitsune, mentre la sua bio usa la sintesi Main del documento.

| Coda | Nome | Identità tecnica |
| --- | --- | --- |
| 1 | iYokaiミ | core |
| 2 | Shirayuki | music-1 |
| 3 | Aoi | music-2 |
| 4 | Kuro | music-3 |
| 5 | Hana | music-4 |
| 6 | Rei | music-5 |
| 7 | iYokai NSFW | nsfw |
| 8 | iYokai App | installazione utente |
| 9 | iYokai Mod | mod |

La Casa degli Spiriti (Desktop / Android) è la dimora, non una decima coda.
Le sei figure Kitsune/Tengu/Nekomata/Bakeneko/Oni/Rokurokubi restano ruoli
narrativi delle funzionalità. Non vanno confuse con le cinque istanze musicali.

Le finestre hanno bio breve, pulsante Lore completa, comandi filtrati per
funzionalità e invito per le istanze bot (o aggiunta al profilo per App).
Il filtro resta circoscritto anche azzerando ricerca/categoria. NSFW conserva
l'autodichiarazione 18+ e apre il catalogo separato. Non è verifica d'identità.

Bio e lore sono riportate nell'italiano originale, marcato con `lang=it` e
segnalato anche nelle altre lingue; le etichette dell'interfaccia sono in dieci
lingue. Non sono presentate come traduzioni del racconto che non sono state fatte.
La lore è narrativa: non certifica disponibilità o collaudo delle funzioni.

## Collegamenti e avvio delle istanze

Compilare `public/links.json`: `discord.musicBots` in ordine 1–5, ogni elemento
con `clientId` e `permissions`; `modClientId` / `modPermissions`; i campi Main,
App e NSFW rimangono invariati. Desktop usa `desktopUrl`, Android `mobileUrl`.
I pulsanti restano disabilitati se il rispettivo ID/URL non è configurato.

Nel backend, `server/policy.example.json` include nomi musicali e identità mod;
`deploy/.env.example` include `YOKAI_MOD_TOKEN`. Copiare i dati nella policy
privata del server: non basta modificare l'esempio se PANEL_POLICY_FILE punta
altrove. Token solo nell'ambiente privato. Il sito non crea applicazioni nel
Developer Portal né avvia un bot Discord: per Mod occorrono applicazione, token,
processo del bot e collaudo delle funzioni consentite. Nessun token è inventato.

Verificato nel repository iYokai-DS-BOT, revisione 413186a: `core/mod_bot.py`
contiene già ModBot e `main.py` lo avvia con `config.YOKAI_MOD_TOKEN`. È un client
esecutore di azioni/log, privo di listener propri: gli eventi sono ascoltati
dal Main e instradati da core/bot_roles.py. Non garantisce protezione autonoma
con Main spento; i comandi di moderazione restano sul Core. Il sito aggiunge
la Coda Guardiana alla presentazione e alla policy, senza duplicare il bot o
promettere uno slash tree separato. Per questo la scheda Mod ha lore e invito,
mentre i comandi di sicurezza sono nelle schede Tengu/Oni. I comandi musicali
mostrati per le cinque sorelle sono il catalogo condiviso del Core/flotta, non
un set di slash command indipendente installato su ogni worker.

## Tavola della Casa

`public/cinematic/spirit-house-wide.webp` è una nuova scena, non uno sfondo
riciclato da Discord. Originale PNG in `art-src/spirit-house.png`.
Generata con lo strumento immagini integrato; riferimento stilistico:
`protocol-discord-wide.webp`. Ambientazione domestica giapponese, computer,
lanterne, giardino notturno; Kitsune argentea seduta, due orecchie e due code
furry dipinte nello stesso ambiente. Stesso sistema di dissolvenza/sfumatura
dei pannelli precedenti e trattamento laterale per ultrawide.

Prompt di produzione: nuova tavola panoramica 21:9, stile anime semireale della
referenza, casa giapponese notturna accogliente con legno/shoji, lanterne ambra,
giardino sakura lunare e computer con luce viola. Una Kitsune adulta argentea
nel terzo destro, abito domestico nero/avorio ricamato diverso dalla scena
Discord, seduta di tre quarti verso il giardino. Esattamente due orecchie
simmetriche, nessuna orecchia umana/aggiuntiva o maschera; due code morbide
argentee appoggiate naturalmente sulla seduta, anatomia coerente. Campo ampio,
spazio a sinistra per titoli, personaggio e ambiente dipinti insieme. Nessun
testo, logo, watermark, collage, arto extra o capelli blu.
