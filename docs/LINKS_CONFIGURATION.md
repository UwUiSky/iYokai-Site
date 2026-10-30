# Collegamenti pubblici del sito

Modifica un solo file: **`public/links.json`**. Il sito lo legge a runtime da
`/links.json`, con cache disattivata. Dopo aver salvato e ripubblicato il file,
ricarica la pagina: non occorre modificare i componenti o ricompilare gli URL nel JS.
Su un hosting che permette di sostituire direttamente i file statici basta
sostituire `links.json`; su Sites serve pubblicare la versione con il file aggiornato.

Usiamo JSON anziché `.env` perché questi URL devono essere pubblici e modificabili
come contenuto. **Non inserire password, token bot, chiavi API o altri segreti.**
Gli URL vuoti mostrano «in arrivo» e non generano link finti. Vengono accettati
solo URL HTTPS. Il file deve restare JSON valido: virgolette doppie, niente commenti,
niente virgola dopo l'ultima voce.

## Campi

- `platforms.youtube`: canale YouTube principale; usato anche nei Live.
- `platforms.youtubeMusic`: canale YouTube Tema / musica. Se vuoto usa `youtube`.
- `platforms.spotify`: album/artista Spotify. L'album The Oni of Jah è già configurato.
- `platforms.twitch`, `platforms.kick`: canali Live.
- `platforms.instagram`, `tiktok`, `x`, `bluesky`, `steam`, `discord`: profili Social.
- `music.title`, `music.artist`: etichetta del player Spotify.
- `contactEmail`: email pubblica. Se compilata compare il collegamento `mailto:`;
  altrimenti la sezione permette solo di preparare e copiare un messaggio.
- `projects`: elenco di oggetti con `name` e `url` per i progetti.

Il menu Social conservato nella visita narrativa legge la stessa configurazione.
Il vecchio `public/music.json` resta solo per compatibilità con versioni precedenti;
la versione corrente legge Spotify da `public/links.json`.

YouTube è un collegamento esterno, senza player/autoplay incorporato. Twitch e Kick
sono collegamenti ai canali: il sito non simula uno stato «live» e non esegue una
API di presenza finché non verrà configurata un'integrazione reale.

`music.tracks` contiene i titoli pubblici dell’album, modificabili come lista di stringhe. I due pulsanti della home Music sono Spotify e YouTube (Tema).

## Discord Core · aggiornamento 29 ottobre

In `public/links.json`, oggetto `discord`:
- `botClientId`, `appClientId`, `nsfwClientId`: ID pubblici delle rispettive applicazioni.
- `botPermissions`: bitfield dei permessi dell’invito (default0).
- `desktopUrl`, `mobileUrl`: URL HTTPS degli artefatti di rilascio.
- `nsfwArtworkUrl`: eventuale tavola approvata locale `/cinematic/nome.webp`,
  caricata soltanto dopo conferma18+. Per ora vuota: la tavola richiesta in
  intimo/calze senza kimono non è stata generata, il tool l’ha rifiutata.

Gli inviti sono URL ufficiali Discord, distinti tra installazione server e
profilo. I download e gli inviti senza configurazione restano disabilitati.
Nessun token in questo file. Core/app/download leggono la stessa configurazione
sia nella home sia nella griglia inviti. Il salotto18+ legge gli otto elementi
(7 slash commands + Segnala) in `public/nsfw-commands.json`, tratti dal cog
`cogs/nsfw/ricerca.py` del bot, blob77daa666ade42a3efd28b4a24ec5a8427a4ec49c.
La conferma dell’età è un’autodichiarazione, non una verifica d’identità.

Le revisioni si aggiornano in `public/patch-notes.json`: data ISO, titolo e
lista modifiche per IT/EN. Ordine nel file = ordine nell’interfaccia. Modificare
il file e pubblicare una nuova versione del sito; non esiste un editor pubblico.

## Nove code e Casa degli Spiriti — 30 ottobre

`discord.musicBots` contiene esattamente cinque configurazioni, in ordine:
Shirayuki (Music 1), Aoi (2), Kuro (3), Hana (4), Rei (5). Ogni elemento ha
`clientId` e `permissions` pubblici; i nomi sono canonici nel catalogo del sito.
`discord.modClientId` e `modPermissions` identificano iYokai Mod.
Nessun token deve comparire qui. Per il backend usare la policy privata e le
variabili ambiente; Mod usa `YOKAI_MOD_TOKEN`, come il bot esistente.

La Casa degli Spiriti usa `desktopUrl` e `mobileUrl` (Android). È distinta dalle
nove code: ha il suo pannello e la sua finestra bio/lore, non un invito Discord.
I link mancanti lasciano i pulsanti disabilitati. Vedi docs/lore/README.md.
