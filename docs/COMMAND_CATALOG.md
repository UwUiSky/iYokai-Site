# Catalogo comandi del sito

Il catalogo è una fotografia del file ufficiale `COMMAND_LIST.md` del bot,
non un elenco di comandi inventato dal sito e non un'interrogazione live Discord.

Fonte verificata il 30 ottobre 2026:
- repository: https://github.com/UwUiSky/iYokai-DS-BOT
- file: https://github.com/UwUiSky/iYokai-DS-BOT/blob/main/COMMAND_LIST.md
- blob Git: `77c0f05593a3d419ec7ab30d14485ef1bb96b6fe`
- generazione dichiarata dal bot: 28 ottobre 2026, 23:34 UTC
- 584 voci in 25 categorie: 581 comandi slash e 3 azioni del menu App.

Lo snapshot esatto è conservato in `docs/BOT_COMMAND_LIST.md`. Il suo hash Git
viene verificato dal generatore. Le tre azioni del menu contestuale mantengono
la notazione originale nello snapshot, ma nel sito sono mostrate senza slash,
con la dicitura «Menu App · tasto destro» e senza pulsante di copia.
Il catalogo comprende anche le app separate: non implica che ogni comando sia
registrato nell'identità Core o disponibile a ogni utente. I permessi sono
sempre quelli applicati dal bot/Discord. Il sito copia il testo, non esegue azioni.

## Aggiornamento

1. Leggere il `COMMAND_LIST.md` corrente dal repository bot e conservare i byte
   esatti in `docs/BOT_COMMAND_LIST.md`, insieme al blob SHA restituito da GitHub.
2. Generare il catalogo italiano, dalla radice del sito:

   ```sh
   python tools/gen-commands.py docs/BOT_COMMAND_LIST.md --source-sha SHA_COMPLETO
   ```

   Lo script rifiuta hash non corrispondenti, firme duplicate, categorie vuote
   e totali diversi da quelli dichiarati nella fonte. Non scarica file e non
   contatta Discord.
3. Aggiornare `src/data/commands.en.json`: una traduzione per ciascuna firma
   esatta. Per le firme rinominate si può riutilizzare una traduzione soltanto
   quando la descrizione sorgente è identica. Non tradurre le firme dei comandi.
4. Per nuove categorie aggiungere le etichette `cmd.category.<nome originale>`
   a entrambi i dizionari IT/EN. Aggiornare gli assert sul totale, sullo snapshot
   e le firme di esempio nei test quando cambia la fonte.
5. Verificare:

   ```sh
   python -m unittest discover -s tools -p test_gen_commands.py
   node --test tests/*.test.js
   npm run build
   ```

   I controlli includono copertura inglese completa, numeri invariati nelle
   descrizioni, corrispondenza con lo snapshot e classificazione menu/slash.
6. Provare il selettore categorie, ricerca IT/EN, copia e tastiera nel browser;
   salvare e pubblicare privatamente nello stesso progetto Sites.

Non aggiornare solo il numero mostrato: firme, descrizioni, categorie, traduzioni
ed evidenza della fonte devono appartenere alla stessa versione. Il vecchio
catalogo da252voci del27settembre2026 è superato da questo snapshot.
