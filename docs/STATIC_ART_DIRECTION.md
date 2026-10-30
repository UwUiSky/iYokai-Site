# iYokaiミ — tavole integrate, Fude e Spotify

Direzione richiesta il 28–29 ottobre 2026: per ora niente animazione del
personaggio, delle code o dei petali. Kitsune e ambiente devono essere un'unica
illustrazione coerente. Mantenere i pannelli, le funzioni del sito e le lingue.
L'utente ha chiesto esplicitamente di controllare le proporzioni.

## Asset finali

- `public/cinematic/still-shrine.webp`
- `public/cinematic/still-city.webp`
- `public/cinematic/still-theater.webp`

Tre tavole originali, 1672×941, derivate dai fondali e dalla Kitsune già approvati.
Generazione con strumento imagegen integrato, non CLI. Originali PNG conservati
separatamente, consegna web in WebP. Nessun asset Tripo o servizio a pagamento.
Le nuove tavole hanno pelo dipinto, ciuffi e filamenti, illuminazione condivisa,
appoggio e riflessi nello stesso disegno. La valutazione di anatomia e scala è
visiva e artistica, non una misura fisica di ambienti immaginari.

Sul desktop l'intera tavola usa `background-size:contain`, senza deformazione.
Su mobile mantiene il rapporto d'aspetto con altezza 65dvh e punto focale al
75% orizzontale; nessun ingrandimento separato del personaggio. Il ritaglio
può nascondere parte dell'ambiente/code sui telefoni stretti, non altera le
proporzioni. I testi sono composti per frasi con fitting e caricamento font.

## Prompt set usato

Input 1: fondale corrispondente già approvato. Input 2: kitsune.webp, riferimento
per identità adulta, viso, capelli argento, orecchie, maschera laterale bianca e
rossa, kimono nero/avorio/rosa ricamato, corde rosse e stivali.

Prompt comune: compositing / identity-preserve; final static cinematic website
illustration, wide 16:9 landscape, high resolution. One cohesive illustration,
character inhabiting the environment. Animal fur: dense fluffy long guard hairs,
soft underfur, irregular wispy tufted silhouettes, individually lit strands,
white-to-silver plush fur with blush reflected light and natural weight. No
smooth ribbons, lotus petals, feathers, plastic tubes or radial fan. Same
semi-real painterly anime style, lighting, shadows, perspective and grading.
Full body in right third, x about 74%, feet grounded at y about 87%, head about
20%; believable scale and contact shadows/reflections. Left 43% quiet/dark for
website copy. Keep limbs, face, ears and tails inside margins; preserve
architecture instead of zooming in. No typography, logos, borders, UI or cutout.

Variazioni:

- Santuario: preserve torii, wet stone steps, mountains, pink moon and sakura.
  Calm stance, one hand brushing sleeve, three large fluffy silver fox tails
  curling downward and around calves.
- Città: preserve Tokyo alley architecture, blue/pink neon, rain reflections,
  moon. Slightly turned protective stance beside lantern, three large fluffy
  silver tails drooping and curling behind, blue/pink rim light.
- Teatro: preserve kabuki curtains, gold moon screen, wooden stage, lanterns.
  Graceful performer stance, one hand extended, four large fluffy silver fox
  tails resting and curling behind kimono, amber side light.

## Fude originale

`tools/build_fude_font.py` costruisce Yokai Fude, Fude Light e Fude Bold a partire
dai nostri scheletri originali, con vere minuscole, curve, pressione variabile,
terminali affusolati, spaziatura proporzionale e kerning. File locali in
`public/fonts/yokai-fude*.woff`. Licenza MIT completa in `public/fonts/README.md`.
Il ミ è un glifo originale, presente anche nel marchio e nel titolo HTML.

Non sono stati scaricati, incorporati o ricalcati font commerciali. Mescolare
font non cancella i termini delle rispettive licenze. Riferimenti analizzati:

- Hoshiko Satsuki: https://www.dafont.com/hoshiko-satsuki.font — l'autore richiede
  un pagamento; non classificato come liberamente utilizzabile senza condizioni.
- Harukaze: https://www.dafont.com/harukaze.font — demo personale; licenze web
  commerciali sul sito https://nugsstudio.com/fonts/harukaze.
- Kashima Brush: https://www.dafont.com/kashima-brush.font — demo personale;
  licenza dedicata per embedding web su https://abodaniel.com/product/kashima/.
- Hiro Misake (questa è la grafia ufficiale): https://www.dafont.com/hiro-misake.font
  — demo personale; https://uicreative.net/products/fonts-hiro-misake-brush.

Questa nota documenta la provenienza, non garantisce esclusività assoluta o una
valutazione legale di ogni somiglianza stilistica.

## Spotify verificato

Ricerca diretta nel sito Spotify con iYokaiミ: artista
`6E4HZollrEstP2G17Uiq23`, album The Oni of Jah
`0X5K33clT2LfQSn5vrn8t4`. Nome e dodici tracce verificati nel player ufficiale.
URL: https://open.spotify.com/intl-it/album/0X5K33clT2LfQSn5vrn8t4

`public/music.json` configura il vero album. Il player ufficiale si apre solo
su richiesta in un dialog e viene smontato alla chiusura per fermare l'audio.
Non si promette ascolto integrale senza login: l'embed può mostrare preview,
come osservato nel browser senza account. Nessuna API key richiesta.

## Verifica e continuità

Default: `src/static-main.js`, senza inizializzare Three.js né il renderer.
Il precedente percorso è conservato in `src/animated-main.js`, esplicito via
`?experience=animated`; il laboratorio 3D resta separato. Non riattivarlo come
default senza una nuova richiesta dell'utente.

13 test Node passati. Browser: scene e testi misurati a 1024×768, 1280×800,
1280×720, 1680×720, 2560×720, 390×844, 360×640 e 844×390, nessun overflow
orizzontale. Sono viewport simulati: prove su hardware fisico ancora utili.
Player ufficiale verificato nel dialog mobile con titolo, artista e dodici
tracce; solo dopo un click. IT/EN conservati.

## Scelta successiva: Harukaze

L'utente ha esplicitamente scelto Harukaze al posto dei font originali proposti.
Il sito ora usa la demo originale OTF locale per valutazione personale nella
preview privata. Fude non è più la scelta corrente. Il file non è copyright-free
e il progetto non ha acquistato una licenza commerciale/web/logo. Prima di un
lancio pubblico occorre la licenza dell'autore per gli usi previsti. Vedere
`public/fonts/harukaze/README.txt` e `public/fonts/README.md`.

## Pose e ambiente musicale — 29 ottobre 2026

Nuova richiesta: Tokyo non in cammino di spalle; Music deve avere un ambiente
proprio, senza riutilizzare il teatro. Tavole statiche complete con pelo, luce
e proporzioni dipinti insieme: santuario seduta sulla panca, Tokyo frontale
appoggiata alla ringhiera, Creator in inchino e Music nello studio di registrazione
con microfono, synth, vinili e finestra sulla città notturna.

`src/data/artworks.js` è la mappa unica delle quattro immagini versionate:
`still-shrine-seated.webp`, `still-city-lean.webp`, `still-theater-bow.webp`,
`still-music-studio.webp`. Le precedenti tavole approvate sono preservate.
Generazione tramite imagegen integrato, mantenendo identità, kimono, palette e
code furry; richieste specifiche: seduta su panca di pietra, inchino sul palco,
posa rilassata frontale alla ringhiera e studio musicale originale. Le prove
Tokyo in cammino e Music sul palco sono state scartate e non vengono distribuite.

Music e Creator condividono solo il livello DOM: ora caricano due immagini
distinte. Il completamento di un caricamento obsoleto non può sostituire
la tavola del pannello attivo. Harukaze locale resta la scelta esplicita;
valgono i limiti di licenza della demo documentati sopra. Nessun renderer 3D
o animazione delle code riattivato.

Verifica di questa iterazione: 13 test Node passati; controlli sintattici e
diff senza errori. Browser: quattro nuove pose visibili, Music carica lo studio
e Creator carica la tavola con inchino sullo stesso livello. Layout controllato
negli otto formati; misure stabili senza overflow orizzontale anche a 390 e 360 px
dopo il ricalcolo del font. Viewport simulati, nessun test su telefono fisico.

## Titoli sulle tavole e passaggi morbidi — 29 ottobre 2026

Richiesta successiva: tutti i titoli sopra l'immagine, alla stessa altezza,
con una sfumatura al nero comune e una transizione morbida scorrendo in entrambe
le direzioni. Rimangono le quattro tavole statiche e il font Harukaze.

Posizione comune dei contenuti per breakpoint, indipendente dalla loro altezza:
40dvh su ritratto, 22dvh desktop, 19dvh in orizzontale basso. Titoli misurati
a 364px in tutti i sette pannelli sul viewport 390×844; sfumatura condivisa
36–74% del viewport in ritratto. Immagine mobile estesa a 72dvh con proporzioni
intatte; titolo sovrapposto alla tavola, corpo e azioni verso la zona scura.
Ecosistema mantiene una lista interna scorrevole, senza allungare il pannello.

Due livelli dedicati di tavole complete si dissolvono in 0,9 secondi con uno
spostamento verticale leggero e direzionale. Nessun blur, avatar 3D o movimento
delle code. Funziona anche tra Music e Creator, prima sul medesimo livello DOM.
Ingresso, resize e prefers-reduced-motion selezionano immediatamente la scena;
le transizioni obsolete vengono annullate. Lenis e GSAP condividono il tempo
reale dopo frame rallentati. Un gesto/un pannello conservato.

Verifiche: 13 test Node passati, incluso controllo della direzione e modalità
immediata della navigazione; controlli sintattici/diff. Browser: wheel reale
Music→Creator→Music, dissolvenza intermedia e conclusione con un solo livello
visibile, sette titoli allineati a riposo e nessun overflow negli otto formati.
Music utilizzabile a 360×640 e 844×390; verifiche su viewport simulati.

## Direzione corrente: terminale, protocolli e cast dedicato — 29 ottobre 2026

Questa sezione supera i riepiloghi precedenti di ingresso diretto alla visita.
L'utente ha ripristinato il flusso originale: TERMINALE → SCELTA PROTOCOLLO →
CARICAMENTO SU NERO → STRUTTURA DELLA SEZIONE. Sei destinazioni: Discord Core,
Social, La mia musica, Canali Live, Progetti Work-in-Progress, Contattami.

La selezione è un linktree cinematografico: maschera nera/oro generata e sei fuochi
fatui viola/magenta a fotogrammi, accensione in sequenza, intensificazione al
passaggio/focus/tocco; il fuoco scelto raggiunge la pergamena verticale e la accende.
La pergamena si consuma dal basso verso l'alto. Le risorse realmente pronte
(tavola, font, struttura e configurazione) determinano il progresso. Nessuna falsa
compilazione shader: il percorso statico non inizializza alcun renderer GPU.
Ritorno, annullamento e retry in caso di errore disponibili; risposte obsolete
non possono aprire una sezione dopo l'annullamento. Preferenze di movimento ridotto
rispettate. I nodi diventano selezionabili dopo essersi disposti, per evitare tap
sul protocollo sbagliato mentre si muovono.

Una Kitsune e un ambiente dedicati per categoria, non il medesimo personaggio con
pose diverse: Social rosa/crema sul rooftop, Music corvina/viola al microfono,
Live castano cenere/indaco nello studio gaming (capelli blu RIFIUTATI), Progetti
ramata/ambra nel laboratorio, Contatti bionda/avorio nella stanza della corrispondenza.
Discord riprende la Kitsune originale argento in un centro di comando. Due o tre
code visibili, abiti diversi, teste e sguardi variati e posture controllate.
Tavole complete statiche `public/cinematic/protocol-*.webp`; nessun avatar o code
animate sovrapposti. Asset, provenienza e brief in `docs/PROTOCOL_ART.md`.

Discord mantiene struttura prodotto, comandi e pannello esistenti; backend Python
preservato. Le altre destinazioni hanno introduzione e pannello relativo con
navigazione un gesto/un pannello. La precedente visita narrativa rimane raggiungibile
dai Progetti, con tavole approvate preservate e ritorno ai protocolli. Harukaze
locale resta la scelta esplicita; i limiti di licenza della demo non sono cambiati.

Tutti i link pubblici sono in `public/links.json`, letto a runtime e senza cache:
YouTube/Tema e Spotify per Music; YouTube, Twitch e Kick per Live; profili Social,
email e progetti. I campi vuoti non producono link o stati live fittizi. Guida:
`docs/LINKS_CONFIGURATION.md`. Nessuna password o API key in questa configurazione.
Il vecchio `music.json` resta soltanto per versioni precedenti, non è la sorgente
della UI corrente. Spotify continua a usare l'album verificato The Oni of Jah.

Verifica finale di questa iterazione: 16 test Node passati. File e dimensioni
controllati per tutte le sei tavole (1672×941). Browser: terminale e selezione
protocolli, caricamento e annullamento, ritorno, sei destinazioni; Music con
player ufficiale (12 tracce verificate, iframe rimosso alla chiusura), YouTube/Tema
in attesa di URL; Live contiene YouTube/Twitch/Kick. IT/EN, intestazioni e nomi
accessibili verificati. Maschera e fuochi controllati negli otto viewport; le
pagine a pannelli controllate anche a 360×640 e 844×390, nessun overflow orizzontale.
La visita narrativa precedente e il ritorno ai protocolli sono stati provati.
Nessun test di hardware fisico, GPU, touch reale o API Discord dichiarato.

Restano da compilare gli URL pubblici e l'email in `public/links.json`; l'utente
ha chiesto espressamente di poterli inserire da sé. Backend Python conservato,
integrazioni autenticate non validate in questa iterazione. Preview owner-private;
nessun acquisto o credito Tripo. Autore di tutti i nuovi commit: Yokai Site Dev.

## Discord Core a pannelli — 29 ottobre 2026

Completato il passaggio rimasto a scorrimento libero: anche Discord Core usa
cinque pannelli alti esattamente un viewport (presentazione, funzionalità,
dashboard, spiriti, inviti). `src/ui/discord-panels.js` conserva i nodi e i listener
esistenti di comandi, inviti e pannello; aggiunge navigazione avanti/indietro,
contatore e selettore IT/EN. Footer legale nell'ultimo pannello. I cataloghi lunghi
scorrono dentro il pannello, con controlli esterni sempre raggiungibili.
Su mobile la barra azioni è su due righe e non copre gli elenchi.

La navigazione condivisa lascia scorrere internamente soltanto gli elenchi che
hanno effettivo overflow: quando una griglia entra nello schermo, wheel e swipe
continuano ad avanzare un pannello. Il focus passa al pannello attivo quando
quello precedente diventa inert. Corretta anche la perdita del percorso
`#protocol/...` tramite wheel/tastiera nei nuovi protocolli; i loro pannelli
interni non scrivono frammenti di navigazione narrativa nella cronologia.
Le tavole, le pose e il caricamento a pergamena restano preservati.

Verifiche: 17 test Node passati; regressione per catalogo contenuto/overflow e
conservazione del percorso. Browser: wheel desktop un pannello per gesto,
Home, salto diretto agli inviti, IT/EN, ricerca comandi (ban: 7 risultati).
Misure degli otto viewport: tutti i cinque pannelli alti un viewport e nessun
overflow orizzontale; elenchi lunghi contenuti nello spazio disponibile.
Solo viewport simulati: nessuna prova su hardware fisico o API Discord.

## Tavole interne e leggibilità — 29 ottobre 2026

Richiesta corrente: la direzione per pose e ambienti dedicati vale per TUTTI i
protocolli, mantenendo la stessa Kitsune dentro ciascun protocollo. Preservate
le sei home; aggiunte dieci tavole complete: cinque interne Discord e una per
il secondo pannello di Social, Music, Live, Progetti e Contatti.
Discord usa la Kitsune argentea, kimono nero con fiori rosa, anche in sicurezza,
sala musica, archivio dashboard, giardino degli spiriti e ingresso inviti.
Nuovo pannello del modulo musicale Discord, distinto dalla musica dell'artista.
La prima posa del giardino è stata RIFIUTATA dall'utente per torsione del corpo:
nel sito usare soltanto `discord-spirits-v2.webp`, corretta dall'immagine esatta
selezionata. Non ripristinare la variante con busto e bacino incoerenti.

Il selettore verticale dispone tre fiamme sopra e tre sotto la maschera;
sprite da 100px, nomi da 16px, suggerimenti da 12px quando c'è spazio. Su schermi
bassi i suggerimenti sono nascosti invece di ridurre il corpo dei nomi.
Titoli più grandi a sinistra, descrizioni e azioni sotto: corpo 18–21px desktop,
16–17px su telefono; descrizioni delle schede 16–17px. `src/readability.css`
contiene questa impaginazione e prevale sulle precedenti misure più piccole.

Home musica: due azioni principali, Spotify e YouTube (Tema). Spotify apre il
player ufficiale su richiesta; YouTube resta disattivato finché l'utente compila
`platforms.youtubeMusic` (fallback `platforms.youtube`) in `public/links.json`.
Nessun terzo pulsante di ascolto duplicato. Tavole interne precaricate realmente
prima dell'apertura, poi dissolvenza dell'intera pittura fra pannelli. Nessun
renderer GPU o movimento del corpo/code riattivato.

Verifica di questa iterazione: 18 test Node passati e build riuscita. Test di
integrità: 16 tavole correnti distinte (6 home + 10 interne), tutte esistenti.
Browser: selettore e Discord misurati negli otto viewport; sei pannelli Discord
di un viewport e nessun overflow orizzontale. Social verificato anche dopo la
correzione del titolo a 360px; Home Music con esattamente Spotify e YouTube
(Tema), player ufficiale album corretto e 12 tracce osservate; queste ultime
sono ora configurabili in `music.tracks` e popolano il pannello album.
Le seconde tavole di Social, Music, Live, Projects e Contact sono state osservate
nel DOM dopo la navigazione; UI mobile Live/Projects/Contact e IT/EN verificati.
Nessun test su telefono fisico, GPU o API Discord autenticate.

## Esagono regolare, fuoco di riferimento e pergamena — 29 ottobre 2026

La nuova richiesta sostituisce la disposizione mobile tre sopra/tre sotto:
sei fuochi ai vertici di un ESAGONO REGOLARE, attorno alla maschera.
`src/core/hex-layout.js` calcola raggio e coordinate dei centri delle fiamme;
`src/ui/gate-layout.js` applica le misure dopo ResizeObserver, resize della
finestra/visual viewport e cambio lingua. I testi non alterano la geometria.
Finestre basse orizzontali: etichette accanto alla fiamma per conservare spazio.

Usato il file allegato `upload/01-1000086031.jpg`: estrazione dello sfondo tramite
Imagegen integrato e conservazione del nucleo scuro e dei filamenti viola.
`public/cinematic/wisp-reference.webp` contiene vera alpha; niente fondo grigio.
Animazione del ritaglio via un piccolo campo di distorsione SVG e pulsazione
CSS, senza sostituire il fuoco con un altro disegno o inizializzare un renderer
GPU. Movimento ridotto disabilita la deformazione e la pulsazione; filtro
sospeso a documento nascosto. Intensificazione luminosa a hover/focus/tocco.
Non dichiarare che è un filmato o una simulazione fisica della combustione.

Pergamena: asset realistico con fibre, bordi consumati e sigillo,
`public/cinematic/loading-washi.webp`, alpha esterna. La combustione verticale
segue la preparazione effettiva, con bordo luminoso, carbonizzazione e cenere.
Nessuna falsa compilazione shader. Nuovi asset pronti nel percorso di preload.

Ogni tavola ha ora un palco di altezza definita e comune: 78dvh su desktop,
68dvh in ritratto, sfumatura alpha dal 55% (53% ritratto) fino al bordo inferiore,
poi nero #030205. Questo vale per protocolli, Discord e visita narrativa.
Le immagini rimangono proporzionate e senza blur. Passaggio fra tavole con
uscita e ingresso in dissolvenza, lieve oscuramento intermedio e micro
spostamento direzionale; immediato con movimento ridotto.

Asset generati da Imagegen integrato:
- fuoco: exec-812f6781-a312-4b84-bc3c-9f5405f5a627.png;
- pergamena: exec-a42ec3c6-c3a6-4a5d-a1f8-cdb13d170851.png.
Originali conservati in generated_images; conversione WebP preserva RGBA.

Verifiche: 19 test Node passati, incluso il controllo matematico dei sei lati
uguali e dei limiti del selettore. Browser negli otto viewport: scarto massimo
fra i lati inferiore a 0,02px; sei pulsanti entro lo schermo. Corretto l'overflow
orizzontale dovuto soltanto al glow. Tavole a 78dvh/68dvh e gradiente inferiore
misurati negli otto viewport, senza overflow orizzontale dei contenuti.
Scroll reale Music→album→Music: transizione running, poi idle con una sola tavola
opaca. Flusso reale terminale/protocollo/caricamento/Discord concluso. Materiale
e bordo della pergamena ispezionati in harness locale di sola QA, non pubblicato.
Filtro della fiamma sospeso fuori selettore/caricamento e a pagina nascosta.
RGBA verificata sui due nuovi WebP: alpha zero presente, nessun fondo opaco.
Viewport simulati; nessun test hardware fisico, GPU o API Discord autenticata.


## 29 ottobre 2026 — scroll dei cataloghi, control room e fuoco continuo

Priorità corrente preservata: tavole statiche complete con Kitsune e pelo
integrati; nessun personaggio 3D o coda animata riattivati.

Navigazione: i contenitori data-panel-scroll consumano il gesto solo finché
possono scorrere nella direzione richiesta. Al bordo, il gesto successivo passa
al pannello adiacente. Un unico burst di rotella non può scorrere l’elenco e
saltare anche il pannello per inerzia. Stessa gestione per swipe e tastiera.
Browser: pannello 5→6 con rotella direttamente sulla scheda su desktop; viewport
390×844, elenco portato al fondo con End e rotella sulla scheda→Inviti. I test
sintetici coprono swipe al bordo e nel mezzo; nessuna prova touch fisica.

Fuoco: nuova sprite sheet RGBA wisp-frames-v2.webp, sedici fotogrammi dipinti,
ciclo CSS continuo di 1,6s con fase diversa per ciascun vertice. Misurato nel
browser in running, posizione fotogramma cambiata senza hover/tocco. Movimento
ridotto ferma il ciclo; nessun renderer GPU. Il vecchio filtro SVG è archiviato,
non inizializzato dal selettore. Nuova loading-scroll-v2.webp: carta chiara,
rotoli di carta e bordi nero/oro; brucia seguendo preparazione reale, non shader
fittizi. Ispezionata carta e bordo nel solo harness locale, non pubblicato.
Originali Imagegen: exec-481a75bf-089d-40c3-9601-828a9700d3ce.png (fuoco),
exec-b36c4f96-94c9-43db-a70a-71afb54c5eed.png (carta). Alpha reale verificata.
Terminale: stessa maschera, Harukaze, accenti oro/viola e fondo nero; flusso di
ingresso provato da browser. Tavole e geometria esagonale preservate.

Control room: nuovo dialog nativo IT/EN con sfondo tematico discreto, identità,
server, ruoli, moduli, attività e Premium/VIP. Anteprima esplicitamente demo,
nessuna modifica inviata; provati selezione identità, invito non disponibile in
demo, server con permessi limitati, moduli demo, Lifetime, IT/EN, chiusura e
ripristino focus. Negli otto formati del layout QA, dialog e contenuto principale
senza overflow orizzontale (misura 0px). Desktop, mobile390, mobile360 e landscape;
viewport simulati, non hardware reale.

Backend Python predisposto: OAuth Discord con PKCE/sessioni/CSRF, catalogo server
con presenza identità e inviti, autorizzazione live per ruoli e appartenenza,
allowlist moduli, vantaggi da boost/ruoli o grant mensile/annuale/lifetime firmato,
Premium/VIP e prenotazione quota AIDA atomica/deduplicata. Default quote0 e prezzi
null. Checkout/provider non integrati. Credenziali, server supportati e regole
vanno configurati in deploy/.env e server/policy.example.json o copia montata.
Nessuna chiave inventata, spesa o iscrizione eseguita. Guida: PANEL_BACKEND.md,
schema admin server/panel-schema.sql. Docker include la policy; Caddy conserva
Spotify e non mette in cache panel.json/links.json.

pubblicazione Sites ancora statica e owner-private: public/panel.json enabled:false.
Python/Postgres vanno avviati sul dominio effettivo tramite lo stack deploy;
l’anteprima Sites non ospita tali processi. Non chiamare login, pagamenti,
verifica boost o AI “live”: non sono stati provati con servizi reali.
Validazione: 20 test Node, 6 test Python (ASGI/mock Discord/DB memoria), build
Vite riuscita e diff senza errori. Suite Postgres, transazioni/NOTIFY live,
OAuth autenticato e webhook provider non eseguiti senza infrastruttura.


## 29 ottobre2026 — panorami, navigazione Discord e salotto18+

Venti tavole ampliate con Imagegen integrato a1916×821 (circa21:9), senza
sovrascrivere le16:9: suffisso -wide.webp. Mappa in PANORAMA_ASSETS.json,
prompt condiviso in PANORAMA_PROMPT.txt. Il sito usa ora queste tavole per tutte
le home, i layout interni e la visita narrativa. Centro sempre nitido; soltanto
oltre il rapporto12:5, che include i monitor commerciali21:9, estensione sfocata
laterale con centro dipinto largo21:9 e raccordo32px. Sfumatura inferiore comune
78dvh/68dvh preservata. Nessuna sfocatura del personaggio o animazione delle code.

Home Discord Core: due azioni affiancate per bot e app profilo, sotto invito a
scaricare desktop/mobile. Copie IT/EN e link da public/links.json.discord.
Link non configurati disabilitati, non scaricano file inesistenti.
Mobile: drawer nativo con hamburger, login, dashboard, command list, patch notes,
invita/rimuovi e ritorno ai protocolli. Desktop: barra78px traslucida, utility14px,
ritorno esplicito evidenziato. Mobile landscape compatto incluso nel breakpoint.
Patch notes pubblicabili modificando public/patch-notes.json e ridistribuendo.

Accesso: casella facoltativa «Resta connessa/o», protetta nello state OAuth.
Default cookie di sessione e limite backend12ore; scelta persistente7giorni.
Rimozione bot predisposta nel pannello solo owner/admin, conferma esplicita,
CSRF e controllo ruoli live, chiamata Leave Guild con token identità; nessuna
rimozione reale eseguita. Backend ancora esterno alla pubblicazione statica.

Dopo autodichiarazione18+ il catalogo inviti apre un bottom sheet dedicato,
con invito NSFW e tutti i7slash commands più il bottone Segnala, da fonte reale
cogs/nsfw/ricerca.py del repository bot (blob77daa666ade42a3efd28b4a24ec5a8427a4ec49c).
Interfaccia IT/EN, scorrimento interno. Non chiamarla verifica d’identità.

Ultimo brief utente per la tavola NSFW: TUTTE le sei Kitsune adulte in INTIMO e
CALZE, SENZA KIMONO. Il generatore ha rifiutato questa variante e la precedente
variante più osé. La variante corale di salotto in kimono è soltanto uno studio
scartato e NON è integrata nel sito. nsfwArtworkUrl resta vuoto fino alla tavola
corretta/approvata; non dichiarare l’immagine completata e non riproporre kimono
come risultato finale di quella richiesta. Conservare tale indicazione.

Verifiche:20test Node,7test Python ASGI/mock passati; nessun login Discord reale,
DB Postgres o rimozione bot in produzione provati. Browser: home in8viewport,
3azioni, nessun overflow orizzontale;21:9 senza blur,32:9 con estensione laterale.
Provati drawer mobile, patch notes, casella sessione e apertura salotto con DOB
sintetica adulta; sette comandi e Segnala presenti. Solo viewport simulati.


## 29 ottobre 2026 — biblioteca comandi e accessibilità

Ripresa dal sorgente Sites remoto379f0fe2eb87d7a7ac701f3a40b5d159adf82d6d,
che supera il vecchioecc3fd8 citato nel prompt. Conservate tutte le20tavole
panoramiche, la direzione statica e il flusso corrente. Nessun nuovo tentativo
sulla tavola NSFW bloccata, nessuna grafica in kimono sostituita al brief rifiutato.

Primo intervento successivo: il catalogo comandi usava ancora un overlay senza
ciclo del focus. Sostituito con dialog nativo e gestione esplicita Tab/Shift+Tab;
Escape e chiusura ripristinano il controllo di origine, incluso hamburger mobile.
Caricamento asincrono non può rubare il focus dopo chiusura. Nuova impaginazione
coerente nero/viola/oro, campi16px, filtri e azioni44px, risultati scorrevoli con
header/ricerca fermi. Ricerca multi-parola senza differenze di accenti/maiuscole,
AND tra parole e filtro categoria; stato vuoto con suggerimento e reset. Stati
caricamento/errore e riprova predisposti, non simulati in produzione.

Copia della firma del comando tramite Clipboard API soltanto dopo click; esito
annunciato, fallback testuale se il browser rifiuta. Nessun comando viene eseguito
sul bot. Catalogo preservato a252voci; nome e descrizione originali invariati.
UI e categorie IT/EN. Le descrizioni del catalogo restano in italiano e sono
marcate lang=it con nota esplicita: NON dichiarare il catalogo integralmente
tradotto in inglese. La traduzione delle252descrizioni resta un obiettivo aperto.

Browser: apertura da menu mobile, ricerca ANTI-CAPS→1comando, copia effettiva
/automod anti-caps verificata negli appunti, Tab dall'ultima azione→Chiudi e
Shift+Tab inverso entrambi dentro al dialog, Escape→hamburger. Provati incrocio
Music+query incompatibile→0, reset→252, Music→23, cambio EN e ritorno IT, ricerca
vuota con riprova correttamente nascosta. Dialog e risultati:0px overflow
orizzontale negli8viewport (4:3,16:10,16:9,21:9,32:9,390×844,360×640,844×390).
Viewport simulati, nessuna nuova prova touch/hardware/API. Errore di caricamento
non forzato nel browser: non dichiarare quella transizione verificata end-to-end.

Verifiche eseguite:22test Node passati (2nuovi per ricerca e integrità del catalogo),
node--check e build Vite riusciti, diff senza errori. Backend Python invariato:
nessuna API reale, OAuth o pagamento provato in questo intervento. Restano da
collegare i dati/servizi esterni secondo PANEL_BACKEND.md e LINKS_CONFIGURATION.md.
Patch notes aggiornate. Autore richiesto per il commit: Yokai Site Dev.


## 29 ottobre 2026 — descrizioni comandi bilingui

Ripresa remota verificata dal commit f9be9a3d9852c520616b1b2ea7fed5cadabd0e08.
Completato l’obiettivo aperto del catalogo: tutte le252descrizioni hanno ora
una traduzione inglese in src/data/commands.en.json, associata alla firma slash
originale. Nessun nome comando tradotto o cambiato; originale italiano conservato.
La ricerca indicizza entrambe le descrizioni in qualsiasi lingua; la visualizzazione
e l’attributo lang dei paragrafi seguono IT/EN anche dopo chiusura e riapertura.

24test Node passati, inclusa copertura esatta delle252firme, conservazione dei
limiti numerici e presenza delle etichette di autorizzazione. Build Vite riuscita,
node--check e git diff--check puliti. Browser: EN→ricerca attachment spam e allegati
entrambi sul comando corretto, ritorno IT→descrizione italiana e lang=it, riapertura
EN→Music23. Catalogo inglese verificato negli8viewport simulati già previsti:
0px overflow orizzontale del dialog e dei risultati. Nessuna prova hardware/touch
o nuova chiamata Discord reale. Backend e integrazioni esterne ancora da attivare
come documentato in PANEL_BACKEND.md; nessun acquisto o font spostato su GitHub
pubblico. Tavole statiche, identità, Harukaze privato e flusso protocolli preservati.


## 29 ottobre 2026 — sviluppo control room Discord

Base remota verificata05564370b8d98f6e483d390664d0d975a7a54745.
Aggiunti ricerca per nome/ID e filtri server (gestibili, da invitare, solo membro),
con contatore, stato vuoto e aggiornamento elenco/presenza. Su telefono il selettore
identità/server è richiudibile e si chiude dopo la scelta; in landscape basso
rimane laterale per lasciare spazio al contenuto. Nessuna selezione server invia
modifiche. La demo Music mostra il solo modulo Music, come l’allowlist reale.

Descrizioni, nomi e gruppi dei32moduli IT/EN. GET guild restituisce required_tier
e can_enable calcolati dal backend con lo stesso entitlement verificato. UI
impedisce attivazione bloccata, mostra il requisito e collega Premium/VIP. Un
modulo già attivo può essere spento anche dopo perdita del tier. Nessuna
classificazione commerciale inventata: feature_tiers vuoto resta invariato.

Salvataggi serializzati, conferma solo dopo risposta positiva, messaggi distinti
per401/403/404/409/429/servizio indisponibile;401 svuota lo stato e torna al login.
Richieste obsolete non possono sostituire il server o l’identità correnti. Storico
non caricato distinto da storico vuoto. Tab rimane nel dialog e origine
ripristinata alla chiusura; focus azioni mantenuto dopo cambio scheda/refresh.

Verifiche:27test Node passati,9test Python ASGI/mock passati, build Vite riuscita,
node--check e diff--check puliti. Browser con API simulate: ricerca e filtri,
blocco VIP, salvataggio confermato, scrittura fallita senza cambio dello switch,
errore storico, offline, riprova riuscita e401→login. Nessuna API Discord reale.
Browser sul sito: demo mobile da hamburger, ricerca Studio, selezione server da
invitare, chiusura picker, Music1→solo Music, IT/EN e Tab dall’ultima azione dentro
al dialog. Otto viewport simulati:0px overflow orizzontale dialog/main; altezza
main417px su360×640 e264px su844×390. Nessun test touch/hardware/Postgres reale.

Pubblicazione privata statica: public/panel.json resta enabled:false. Per login
reale servono stack Python/Postgres, credenziali OAuth/token/policy e callback
configurati; per pagamenti serve ancora provider e prezzi. Nessun acquisto,
nessun push Harukaze demo su GitHub pubblico, tavole e flusso invariati.


## 29 ottobre 2026 — controllo delle scritture concorrenti

Base remota verificata4d7c6c3465cfdd75b65c839fac1ee87b38089c27, successiva
al vecchioecc3fd8 del prompt. Primo intervento di questo ciclo: salvataggi moduli
con stato atteso obbligatorio. PATCH richiede active ed expected_active come
booleani stretti; il frontend usa il valore realmente letto, senza coercizioni.
La transazione confronta lo stato sotto lock della riga PRIMA dell’aggiornamento
e dell’audit/NOTIFY.409 module_conflict non scrive: UI ricarica il server, spiega
il conflitto IT/EN e richiede nuova scelta; nessun retry automatico del PATCH.
Configurazione rimossa durante la richiesta:409 configuration_unavailable.
Un no-op con expected_active corretto non duplica audit né NOTIFY. Permessi,
CSRF, allowlist e controllo tier restano invariati. Nessuna migrazione schema.
Frontend/backend aggiornati vanno distribuiti insieme prima di enabled:true.

Verifiche:28test Node passati,14test Python ASGI/mock/adattatore transazionale
in memoria passati; build Vite riuscita, node--check e diff--check puliti.
Aggiunto test di due PATCH concorrenti alla suite PostgreSQL, NON eseguito
senza TEST_DATABASE_URL dedicato: non dichiarare lock/transazioni Postgres
reali provate. L’ambiente non dispone di un server Postgres per questa prova.

Browser con API simulate: primo conflitto→un solo tentativo di scrittura,
switch riletto attivo, avviso esplicito, focus e controllo riabilitati; scenario
OK + nuovo click→secondo tentativo confermato. Messaggio EN e IT verificati.
Contenuto main e avviso:0px overflow orizzontale negli8viewport simulati.
Screenshot della fixture distinto dalla demo di produzione; nessun OAuth,
Discord API, hardware o touch reale provato. Nessuna nuova scena o modifica
alle tavole/Harukaze; nessun font demo sul GitHub pubblico.

Pubblicazione resta owner-private nello stesso Sites. Login reale ancora
bloccato da hosting Python/Postgres e credenziali OAuth/token non configurati.
Pagamenti richiedono provider/prezzi; nessun acquisto. Ulteriore sviluppo
possibile sul frontend e sui contratti prima di attivare i servizi reali.


## 30 ottobre 2026 — riallineamento al catalogo ufficiale del bot

Base remota verificata109c57803c9eab0b08666004d2404fc93d100334. Lettura del
repository bot corrente ha evidenziato che il catalogo252del27settembre era
obsoleto: COMMAND_LIST.md generato28ottobre23:34UTC contiene584voci/25categorie.
Fonte letta tramite GitHub il30ottobre; blob77c0f05593a3d419ec7ab30d14485ef1bb96b6fe.
Snapshot esatto in docs/BOT_COMMAND_LIST.md, hash Git verificato. Nessuna
chiamata al bot in produzione o esecuzione di un comando Discord.

Aggiornati nomi e descrizioni da fonte,584traduzioni inglesi complete e25etichette
categoria IT/EN. Rimane ricerca bilingue indipendentemente dalla lingua scelta.
Tre azioni menu App (Profilo, Stato rete iYokai, Testo pulito) mostrate senza
slash e senza Copia;581comandi slash copiabili. Metadati di app separate e NSFW
sono documentazione neutra: non attivano bot, accessi o contenuti del salotto.

Filtri25categorie sostituiti con select nativo compatto anche su desktop; nessuna
lunga fila di chip da cercare sul telefono. Data della fonte visibile. Generatore
stdlib verifica blobSHA, totale584,25categorie, duplicati e distingue menuApp.
Nuova guida docs/COMMAND_CATALOG.md per sincronizzare fonte e traduzioni.

Verifiche:29test Node passati;3test Python unittest del generatore passati;
node--check e build Vite riusciti, diff--check pulito. Backend Python invariato:
non ripetuti test ASGI/DB, nessun OAuth/API/boost/pagamento reale provato.
Browser: nuova firma /automod filtri anti-caps copiata e letta dagli appunti;
App15con Profilo senzaCopia; AI16 EN, query spending e spesa→/ai limiti;
584righe e581Copia presenti; Reset→Tab sul select; Tab/Shift+Tab nel dialog;
Escape ripristina hamburger. Otto viewport simulati,584righe:0px overflow
orizzontale dialog/risultati, risultati alti129px nel telefono landscape.
Nessun test touch/hardware/GPU. Tavole statiche, Harukaze privato, pannello
e flusso protocolli preservati. Nessun acquisto o push demo sul GitHub pubblico.

Pubblicazione owner-private sullo stesso Sites. Rimangono da configurare stack
Python/Postgres e OAuth/token per login reale, provider/prezzi per pagamenti.
Il catalogo documenta lo snapshot ufficiale, non prova che tutti i584comandi
siano registrati in una singola identità. Prima di estendere le configurazioni
del pannello, confrontare allowlist e schemi con il repository bot corrente.


## 30 ottobre 2026 — correzioni anatomiche Discord Core integrate

Pannelli 2/3/4 aggiornati rispettivamente a discord-security-ears-v2-wide.webp,
discord-music-ears-v3-wide.webp e discord-dashboard-ears-v3-wide.webp. Sicurezza
usa la prima correzione approvata; Musica usa la coppia bilanciata approvata.
Dashboard usa l’ultima variante senza cuffie, accettata soltanto come compromesso
provvisorio. Non dichiararla perfetta e non ripristinare le varianti scartate.
Anche lo sfondo tenue del pannello usa la Dashboard corretta. Originali conservati,
nessun renderer GPU o avatar sovrapposto riattivato. Dettagli dei prompt e percorsi
in docs/ART_CORRECTIONS.md. Tavole complete circa21:9, WebP qualità92 senza resize.

Verifiche di questo incremento: 4 test protocolli passati, build Vite riuscita,
git diff --check pulito. Browser: le tre tavole finali caricate nei pannelli reali;
nessun overflow orizzontale del documento negli otto viewport simulati1024×768,
1280×800,1280×720,1680×720,2560×720,390×844,360×640 e844×390. Crossfade preservato.
Nessun test fisico touch/GPU, OAuth/API Discord o Postgres eseguito per questo
ritocco. Backend e catalogo comandi invariati. Pubblicazione sul medesimo Sites
owner-private; Harukaze demo rimane privato, nessun acquisto o push pubblico.


## 30 ottobre — impostazioni operative, prima integrazione al bot

Letti core/panel_bridge.py, config_schema.py, premium_flags.py e logging/basic_logs.py
dalla repository bot corrente. Nuovo adapter privato integration/iyokai_site_bridge.py
con firma HMAC, nonce, timestamp e permessi ricontrollati dal processo bot. API
settings per ruoli/lingua, profilazione owner e diagnostica intent; nessuna
abilitazione degli intent dal sito o certificazione della loro approvazione.
Nuova scheda Impostazioni; Owner reale può caricare diagnostica e richieste.
Adapter scritto e testato con dipendenze finte, NON installato nel bot reale.
Vecchi percorsi moduli/identità non ancora migrati: public/panel.json resta false.

FAQ, privacy in bozza tecnica, piani Free/Premium/VIP con lancio gratuito e
pagamenti spenti, contatto Lifetime/support/privacy autenticato, CSRF e rate limit;
richieste salvate nel DB quando backend attivo, nessuna email/DM automatica.
Schema panel_contact_requests da applicare con privilegi minimi; retention da
definire prima dell'apertura. Non inserire dati sensibili nei test o moduli.

Selettore esteso a IT/EN/ES/FR/DE/RU/UK/ZH/JA/KO; solo etichette assistenza
localizzate per le nuove otto lingue, testi mancanti inglesi. Traduzione completa
e automatica non implementata. Registro bot attuale Free/Premium, VIP richiede
modifica condivisa del bot. Broadcast owner tradotto non implementato.
Mappa iniziale delle 584 voci/25 categorie in docs/PANEL_IMPLEMENTATION_MAP.md:
non equivale a un'analisi completa degli schemi di ogni funzione.

Verifiche di questo incremento:16test ASGI/DB-in-memoria passati,4test
dell’adapter aiohttp passati (firma, scadenza/replay, owner, permessi e ruoli),
16test JavaScript mirati passati e build Vite riuscita. Nessun Discord o
Postgres reale provato. Browser: FAQ, Piani, Lifetime→Contatto, invio bloccato
correttamente con backend disabilitato;0px overflow orizzontale della pagina
Piani negli8formati simulati. Tavole, Harukaze privato e flusso preservati.


## 30 ottobre — contatti Discord, protezioni e navigazione alla radice

Nuovo JSON privato server/site-settings.example.json: guild_id/channel_id e
nome della variabile token per consegnare contatti nel canale del progetto.
Nessuna email. Testo contatto cifrato Fernet nel DB con PANEL_DATA_KEYS separata,
rotazione; stato consegna delivered/unconfigured/failed/invalid_destination/unknown.
Nessun retry cieco dopo timeout ambiguo. Nessun messaggio reale inviato.
Guide CONTACT_AND_PLANS.md e SECURITY_REVIEW.md: dati pseudonimi non anonimi,
zero garanzie di inviolabilità/DDoS100%, nessuna raccolta email aggiunta.
Letto alt_detection_logic.py corrente: HMAC per server, niente IP chiaro nel
registro impronte; non equivale a fingerprint univoco o prova d'identità.

Catalogo commerce privato: Premium, VIP1/VIP5/VIP20, mensile/annuale null,
budget AI null, nessun prezzo inventato, checkout ancora spento e Lifetime
tramite contatto. Catalogo sanitizzato letto dalla pagina Piani con API attiva.
Quote differenziate per SKU, pagamenti veri e registrazione VIP nel bot ancora
da integrare. Anche owner tier switch e broadcast tradotto non completati.

Corretto tetto rate limiter e scadenze fra finestre diverse; token/flag billing
StrictInt/StrictBool; limite request64KiB anche in streaming; Uvicorn accesslog
spento; lock dipendenze Python. Proxy blocca internal/v1 pubblici. Font e asset
locali; Spotify cambia in link esterno senza iframe, per nuova richiesta.
Nuova History API conserva le viste alla radice, senza path o frammento: scelta
estetica, non protezione dati. Login OAuth conserva la destinazione nel state
di navigazione. Tavole e Harukaze invariati. Due campioni font in
docs/font-proposals/: Harukaze reale e lettering originale Yokai Kage (bozza
del solo nome, NON font completo né sostituzione applicata). Licenza MIT del
codice originale; terzi mantengono OFL/GSAP/Harukaze, vedere THIRD_PARTY_NOTICES.

Verifiche:23test backend ASGI/in-memoria e sicurezza passati; test streaming
413, cifratura/rotazione, contatto Discord con mock e mai rete reale. Scansione
npm produzione:0vulnerabilità note; pip-audit su32dipendenze lock:0note. Non
sono penetration test e non certificano il server. Build Vite riuscita, test
JavaScript completi passati inclusa navigazione. DB Postgres reale, tunnel,
certificati, OAuth e anti-DDoS non provati. Browser: Discord Core resta su /;
pagina Piani mostra i3VIP e pagamenti disattivati.

Verifica browser finale: flusso fuoco Discord→sezione mantiene URL /;
Piani aggiornati senza overflow negli8formati simulati.30test JavaScript
passati e build finale riuscita;4test adapter ancora passati. Caddy non
avviato (binario assente); route esplicita per non riordinare il blocco
internal prima del proxy. Nessun test DDoS/certificati/server reale.


## 30 ottobre — Yokai normale / Extreme applicati alla preview privata

Autorizzata dall’utente l’applicazione della revisione 09: Extreme per titoli e main line, normale per testi e controlli. Font locali, segni combinabili e kerning incorporato; monospace tecnico conservato nei comandi e nel terminale. Aggiunti 23 supporti Noto locali con OFL originale; CJK regionali in WOFF2 da circa 11 MB, richiesti solo per i caratteri interessati. Un piccolo sottoinsieme CJK copre le scritte decorative senza scaricare l’intero font asiatico in italiano.

Ridimensionati titoli e controlli per la nuova larghezza delle parole; su mobile i due inviti sono impilati. Tavole statiche e navigazione a pannelli preservate. Il supporto dei glifi non equivale a traduzione completa né a font Yokai originale universale. Guide e sorgenti in TYPOGRAPHY_REVIEW.md e font-proposals/yokai-r09-sources.json.

QA browser sulla home Discord e FAQ aperte: nessun overflow orizzontale rilevato in 4:3, 16:10, 16:9, 21:9, 32:9, 390×844, 360×740, 430×932. Selettore protocolli verificato, con etichette entro la finestra dopo l’assestamento del layout; il bagliore decorativo può estendersi oltre il bordo del contenitore. Testi e titoli usano i font attesi. Verificato caricamento di una destinazione protocollo e ritorno al selettore. 14 test JS pertinenti passati; build Vite riuscita. Nessuna prova su telefoni fisici o API reali.

## 30 ottobre — revisione 10 spaziature

Le forme approvate, comprese L discendente e legature Le/Il, restano invariate.
Metriche centrali più condizioni per ciascuna coppia, con verifica vettoriale e
raster: non avvicinare globalmente tutte le r. Marchio mobile Discord aggiornato
anche nello pseudo-elemento che conservava Harukaze. Nessuna modifica alle tavole.
Dettagli e limiti in TYPOGRAPHY_REVIEW.md e spacing-r10-*.

## 30 ottobre — priorità corrente r11

Yokai normale per i testi, Extreme per titoli: supera la vecchia indicazione
Harukaze. Apostrofi autonomi e distanze maiuscole/minuscole; forme approvate,
sviluppo discendente della L e tavole statiche preservati. Dieci dizionari locali
completi nelle chiavi, bandiere SVG, tag di lingua corretti. Le nuove traduzioni
sono bozze da revisionare. Nessun riavvio del personaggio 3D o delle code animate.
