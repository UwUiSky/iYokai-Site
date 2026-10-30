# Yokai Font — stato corrente r11, 30 ottobre 2026

Le sezioni iniziali documentano le prove precedenti. La versione corrente del sito statico è r11, con sorgenti in fonts-src/yokai e strumenti in tools/fonts.

## Risultati misurati

- Due varianti: Yokai normale e Yokai Extreme.
- 622 caratteri Unicode codificati per variante, inclusi 25 segni combinabili.
- 494 lettere latine con decomposizione canonica generate dalle basi disponibili. Include accenti doppi del vietnamita. Questo NON significa tutti i caratteri latini esistenti o tutte le combinazioni Unicode immaginabili.
- 563 lettere latine per variante, 316.969 coppie per variante: 633.938 coppie effettive analizzate automaticamente.
- I contorni vengono approssimati e rasterizzati su una griglia di 4 unità font. Il rilevamento di possibili collisioni produce correzioni aggiuntive. Non è una revisione umana di tutte le coppie e non dimostra che ogni spaziatura sia esteticamente definitiva.
- Conservate le legature Il / Le nella Extreme. La L conserva la pennellata lunga sotto la minuscola.
- Coppie manuali preservate: Yo e iY. Nel rilevamento geometrico la punta di iY della Extreme presenta circa 2 unità di sovrapposizione, mantenuta come raccordo ottico intenzionale.
- Punteggiatura bassa e avvicinamento dipendente dalla lettera precedente, senza trascinare la parola successiva sotto una pennellata sporgente.
- Sharp-s ß/ẞ disegnata come glifo separato, non sostituita con una stringa f+s. Come gli altri glifi nuovi, richiede approvazione visiva.

## Verifiche eseguite

- Confronto tra gli avanzamenti calcolati e il rendering effettivo di 1.000 coppie casuali per variante, con seme fisso: zero divergenze oltre una unità font.
- Confronto pixel NFC/NFD per 11 campioni per variante: é, ü, ắ, ộ, ǿ, ĩ, ḍ, ấ, ễ, ț, İ. Tutti equivalenti nei campioni verificati.
- Presenza di GPOS, GSUB e GDEF nei due file finali.
- Verifica dei caratteri dei campioni per 25 lingue: nessun carattere mancante nell'unione della famiglia locale.
- Anteprime osservate in browser: coppie e accenti delle due varianti; testi latini e scritture greca, cirillica, giapponese, cinese semplificata/tradizionale e coreana.
- Controllo interattivo della prima lettera Y con 563 destinazioni accentate: generazione delle schede riuscita; nessuna eccedenza orizzontale nella finestra osservata.
- Non sono stati eseguiti controlli su ogni hardware, ogni sistema operativo, tutte le dimensioni dello schermo o revisione linguistica madrelingua dei campioni.

File di riscontro: `pairs-normal.csv`, `pairs-extreme.csv`, `verification.json`, `coverage.json`, `audit-normal.json`, `audit-extreme.json`.

## Copertura internazionale: cosa è custom e cosa è supporto

Le lettere latine disponibili e quattro katakana del marchio sono Yokai. Le altre scritture NON sono una nuova calligrafia Yokai originale: sono supportate da 23 font Noto locali. L'unione dei caratteri codificati comprende 48.651 punti di codice, contando una sola volta i duplicati. È una famiglia finita, NON l'intero Unicode e NON una certificazione di tutte le lingue.

Cinese, giapponese e coreano usano sorgenti regionali distinte JP / SC / TC / KR. Le preferenze regionali sono esplicite nei selettori `lang`. La copertura del testo non traduce automaticamente interfaccia e messaggi del bot.

Sono presenti supporti per greco, cirillico, armeno, georgiano, ebraico, thai, lao, khmer, birmano, devanagari, bengali, tamil, telugu, kannada, malayalam, gujarati, gurmukhi, singalese ed etiopico. L'arabo è escluso dal pacchetto e dalle regole di intervallo Unicode, come richiesto. Non è stata aggiunta una disattivazione basata sulla nazionalità o sulla lingua.

Prima della distribuzione occorre ancora ottimizzare e suddividere le grandi risorse CJK, verificare i testi reali del sito nelle lingue attivate, la lettura degli alfabeti da parte di madrelingua, e i casi tipografici segnalati nella revisione. Un font di supporto corretto e leggibile non equivale a un font brush originale coordinato per tutte queste scritture.

## Risorse e licenze

Tutti i file della prova vengono letti dalla stessa origine. Non ci sono importazioni da Google Fonts o CDN per i font della prova. Le sorgenti Noto sono elencate con URL e SHA-256 in `support-sources.json`; le copie servite e gli intervalli sono elencati in `support-codepoint-manifest.json`.

I font Noto hanno licenza SIL Open Font License 1.1, NON MIT. Le licenze originali sono conservate in `OFL-Noto.txt` e `OFL-CJK.txt`. Non devono essere sostituite da una dichiarazione MIT. Documentazione Noto: https://notofonts.github.io/noto-docs/website/use/ . Licenza CJK: https://github.com/notofonts/noto-cjk/blob/main/Sans/LICENSE . I prototipi Yokai restano da approvare; questa revisione non è una certificazione di originalità o una liberatoria legale.

## Disponibilità Discord: verifica separata dalle lingue

Non esiste in questa revisione una lista mondiale esaustiva certificata da Discord. Il monitor consultato riferisce test recenti su 24 Paesi, non sull'intero pianeta. Alla verifica del 30 ottobre 2026, i suoi test del 29 ottobre riportavano blocchi su reti di Cina continentale, Iran, Russia e Turchia. La disponibilità può variare per rete, funzione e territorio.

- Turchia: OONI documenta il blocco iniziato l'8 ottobre 2024 e lo indica ancora in corso: https://explorer.ooni.org/findings/2025-turkiye-blocked-discord .
- Russia: OONI documenta il blocco iniziato l'8 ottobre 2024 e lo indica ancora in corso: https://explorer.ooni.org/findings/2025-russia-blocked-discord .
- Monitor recente di 24 Paesi, inclusi Cina e Iran: https://vpnalert.com/tools/censorship-monitor/discord/ . Sono misure dichiarate dal monitor, non prove di rete eseguite da noi.
- Cina continentale: il monitor descrive blocchi su China Unicom/China Mobile; distingue Hong Kong e Macao: https://vpnalert.com/tools/censorship-monitor/china/discord/ .
- Separatamente, i termini Discord citano restrizioni di utilizzo legate agli embarghi USA/UE e nominano Cuba, Iran, Corea del Nord, Siria e Crimea, con le eccezioni previste dalle autorizzazioni competenti: https://discord.com/terms . Questo non è un elenco di blocchi tecnici di rete.

Un blocco geografico non determina quali lingue siano inutili. Cinese e russo, per esempio, sono usati da persone in molti altri territori. Il turco usa un alfabeto latino: l'esclusione dell'arabo non esclude il turco. Nessuna lingua esistente del progetto è stata rimossa automaticamente in seguito a questa ricerca.

## Integrazione nel sito

L’utente ha autorizzato l’applicazione alla stessa preview privata dopo la revisione 09. Tavole statiche, flusso dei protocolli e backend preservati. I font Yokai prendono il posto della tipografia Harukaze attiva; il terminale tecnico e i comandi mantengono il monospace locale. I font di supporto sono caricati per intervallo Unicode e lingua, senza precaricare tutte le scritture. La traduzione completa dell’interfaccia resta un lavoro distinto.


## 30 ottobre — Yokai normale / Extreme applicati alla preview privata

Autorizzata dall’utente l’applicazione della revisione 09: Extreme per titoli e main line, normale per testi e controlli. Font locali, segni combinabili e kerning incorporato; monospace tecnico conservato nei comandi e nel terminale. Aggiunti 23 supporti Noto locali con OFL originale; CJK regionali in WOFF2 da circa 11 MB, richiesti solo per i caratteri interessati. Un piccolo sottoinsieme CJK copre le scritte decorative senza scaricare l’intero font asiatico in italiano.

Ridimensionati titoli e controlli per la nuova larghezza delle parole; su mobile i due inviti sono impilati. Tavole statiche e navigazione a pannelli preservate. Il supporto dei glifi non equivale a traduzione completa né a font Yokai originale universale. Guide e sorgenti in TYPOGRAPHY_REVIEW.md e font-proposals/yokai-r09-sources.json.

QA browser sulla home Discord e FAQ aperte: nessun overflow orizzontale rilevato in 4:3, 16:10, 16:9, 21:9, 32:9, 390×844, 360×740, 430×932. Selettore protocolli verificato, con etichette entro la finestra dopo l’assestamento del layout; il bagliore decorativo può estendersi oltre il bordo del contenitore. Testi e titoli usano i font attesi. Verificato caricamento di una destinazione protocollo e ritorno al selettore. 14 test JS pertinenti passati; build Vite riuscita. Nessuna prova su telefoni fisici o API reali.

## Revisione 10 — metriche del corpo e condizioni per coppia

Le correzioni r09 lasciavano spazi otticamente irregolari (Yo, rd, Protocollo).
La prima prova a box uniformi da sola introduceva contatti ri/re: scartata prima
della pubblicazione. Il risultato r10 combina un box del corpo centrale con
kerning **distinto per ciascuna coppia** di A–Z/a–z, senza allontanare tutte le r.

Il box si misura nella fascia y50–420, compensando l'inclinazione. I contorni
sono poi confrontati a intervalli di 2 unità da y0 a y800; la correzione per
coppia mantiene almeno 24 unità fra i bordi e mira a 48 unità nella fascia
centrale. Le pennellate sotto la baseline non forzano la distanza: la L può
continuare sotto e. Le legature Le/Il e tutte le forme originali sono conservate;
si traslano i glifi solo in orizzontale, senza cambiare altezza o disegno.
Accenti canonici ereditano il corpo della lettera, non il box dell'accento.

Verifiche riproducibili in tools/fonts/: rebuild-spacing.py, check-spacing.py,
check-raster-spacing.py. Le 2.704 coppie e 140.608 terne ASCII per variante sono
verificate anche tramite shaping RAQM, non soltanto sommando le metriche.
Il generatore aggiunge una condizione raster per ogni coppia a 32/80/160 px,
allontanando solo quelle che producono un contatto. La prova indipendente a 160 px controlla l'intersezione dei glifi sopra
la baseline; le due legature intenzionali Extreme sono controllate nello shaping.
I CSV riportano ogni coppia, compresi ri/re/rr/rI/Ri/RI/RE/Rr/Yo/rd.
Non è una certificazione estetica universale né una verifica di ogni scrittura
Unicode. Il controllo degli accenti combinabili rimane sui campioni dichiarati.

Marchio unificato in una sola sequenza iYokaiミ in terminale, protocolli,
pannello e intestazione narrativa; nessun katakana separato come elemento flex.
URL WOFF r10 e stylesheet versionato evitano di ricaricare le vecchie metriche.


## Revisione 11 — completata e salvata

Coppie maiuscola/minuscola: minimo 48 unità; altre coppie: 32; obiettivo ottico
centrale 56. Condizioni per coppia e scansione raster a 32/80/160px. Conservate
forme, L discendente e legature Le/Il. Apostrofi e virgolette hanno ora contorni
autonomi: le vecchie componenti dipendevano da una virgola spostata. Il sito
statico mantiene gli accenti e non usa la scomposizione Harukaze.

TTF, TTX, SVG e metriche in fonts-src/yokai. Shaping verificato su 3364 coppie
lettere/virgolette e 140608 terne per variante; raster indipendente: nessun
contatto sopra baseline nei casi analizzati, escluse le due legature intenzionali
Extreme. Non equivale a perfezione estetica su ogni dispositivo.
