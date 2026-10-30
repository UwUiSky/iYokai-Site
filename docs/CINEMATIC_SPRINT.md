# iYokai — sprint cinematografico

Inizio: 28 ottobre 2026. Obiettivo richiesto: sito completo entro sei giorni, 3 novembre 2026 (Europe/Rome). La data è un obiettivo di progetto, non una garanzia di completamento automatico.

## Vincoli confermati

- Repository canonico: https://github.com/UwUiSky/iYokai-Site
- Autore di tutti i nuovi commit: `Yokai Site Dev`.
- Il nucleo è eliminato: terminale → Kitsune, direttamente.
- Kitsune, santuario e direzione visiva approvati dall'utente in questa conversazione.
- WebGPU con fallback WebGL 2; qualità adattiva, touch e movimento ridotto.
- Preservare backend Python, pannello Discord, comandi, lingue e lavoro esistente.
- Budget aggiuntivo zero: nessun acquisto di crediti o servizio senza istruzione esplicita.
- Tripo autorizzato come possibile supporto per il modello 3D. Non è ancora autenticato; nessun modello Tripo è stato generato.

## Stato del 28 ottobre

Implementato nel branch `cinematic/terminal-kitsune`:

- Ingresso diretto dal terminale con dissolvenza laterale in particelle; eliminati orbe e convergenza dal percorso attivo.
- Sette capitoli: Origine, Discord, Music, Creator, Ecosistema, Lore e finale.
- Tre fondali originali: santuario, Tokyo cyberpunk e teatro giapponese; avatar originale trasparente.
- Code 3D a geometria volumetrica progressiva e petali instanziati; parallax camera/puntatore.
- Regia di scroll GSAP/ScrollTrigger/Lenis e transizioni ai contenuti Discord esistenti.
- Menu e dettagli con dialog nativi; collegamenti a pannelli esistenti; player mantenuto.
- IT/EN nel sistema i18n esistente.
- Fallback illustrato se il browser nega qualsiasi contesto GPU, senza bloccare i contenuti.
- Importatore GLB locale configurabile da `public/cinematic/avatar.json`, AnimationMixer, idle automatico e crossfade tra clip.

Il personaggio attuale è l'artwork su piano trasparente 3D, NON un corpo riggato. Le code sono vere mesh 3D. I fondali sono immagini stratificate, NON ambienti interamente modellati. Il fallback senza GPU usa code vettoriali. Nessun video Seedance è stato generato.

## Verifiche

- Build Vite riuscita.
- Due test di integrità geometrica delle code passati (coordinate finite e triangoli non degeneri, due livelli di dettaglio).
- Test backend PKCE/firma passato. La suite API completa richiede PostgreSQL dedicato: non eseguita.
- Browser: ingresso automatico, menu, navigazione verso ecosistema e dettaglio AI verificati.
- Il browser cloud non espone né WebGPU né WebGL2. Fallback verificato; rendering GPU e frame rate su hardware reale NON ancora verificati.
- Layout mobile: CSS predisposto, verifica su viewport mobile ancora da completare.
- OAuth Discord, stato Twitch/YouTube, inviti e tracce richiedono configurazione reale. La preview statica Sites non ospita il backend Python.

## Sequenza restante

1. 29 ottobre: acquisire modello Tripo dalla reference approvata; verificare volto, orecchie, mani, kimono, topologia e licenza. Rig-check prima del rig. Niente rigenerazioni infinite o spesa non autorizzata.
2. 30 ottobre: idle/respiro, sguardo, gesto di ingresso e transizioni; montare il modello e rifinire le nove code indipendenti. Nessun movimento anatomico finto dichiarato come rig.
3. 31 ottobre: integrare filmati o geometrie supplementari solo se migliorano le scene; completare teatro/live e passaggi tra mondi.
4. 1 novembre: collegamenti ufficiali, contenuti definitivi, backend e OAuth configurati con segreti sicuri; indicare subito eventuali dati mancanti.
5. 2 novembre: prove desktop/mobile, WebGPU e WebGL reali, prestazioni, accessibilità, tastiera, touch, riduzione movimento.
6. 3 novembre: correggere blocchi, build e release. Consegnare URL e codice, dichiarando cosa è verificato e cosa dipende da accessi esterni.

## Continuità

La versione Sites associata è owner-private, project_id in `.openai/hosting.json`. Il sorgente pubblicato contiene questo documento. Il remote `origin` resta GitHub. Il push Git HTTPS diretto richiede autenticazione non presente nel workspace; non usare commit API che cambiano l'autore richiesto. Conservare commit locali e sorgente Sites, e riprendere il push solo con accesso Git autorizzato.

Per il modello:

1. Tripo image-to-model sulla reference `public/cinematic/kitsune.webp`.
2. Rig-check, rig umanoide e animazione idle.
3. Revisionare il risultato prima dell'integrazione; non sostituire silenziosamente il personaggio approvato.
4. Salvare il GLB come `public/cinematic/kitsune.glb` e impostare `model` in `avatar.json`.
5. Verificare scala, rotazione, trasparenze e clip in entrambi i renderer.

## Aggiornamento: primo modello originale, senza Tripo

L'utente ha chiesto di tentare direttamente un modello e di continuare anche struttura e animazioni. La strada prioritaria ora è il prototipo procedurale; TripoSR resta un eventuale supporto successivo dal PC dell'utente. Non chiedere di comprare crediti Tripo per proseguire questo tentativo.

È stato installato Blender 4.5 portabile nello scratch ed è stato creato `tools/model/build_kitsune.py`: genera una mesh originale skinnata, armatura a 18 ossa e clip `Idle_Breath`, `Welcome`, `Bow`. Sorgente modificabile `tools/model/kitsune-prototype.blend`; modello web `public/cinematic/kitsune-prototype.glb`, circa 2,1 MB. Materiali procedurali; nessuna ricostruzione IA o texture foto proiettata.

L'illustrazione approvata rimane la home principale. `/?avatar=prototype` attiva il corpo 3D di prova, con code procedurali indipendenti. `/model-lab.html` permette confronto con il riferimento, tre viste, animazioni, controllo del numero di code e download GLB. Nei browser senza contesto GPU vengono mostrati render e filmato Blender esplicitamente etichettati.

L'esito visivo è fortemente stilizzato, ancora lontano dal riferimento. Volto, capelli a ciocche, mani, drappeggi e ottimizzazione sono da rifinire. Non dichiarare la qualità finale raggiunta. Il saluto viene collegato all'ingresso e al capitolo Creator, l'inchino al ritorno da Discord, con crossfade e ritorno al respiro.

Verifiche aggiuntive: GLB caricato e parsato da Three.js in Node, skin presente, 18 ossa, tre clip, pesi normalizzati, indici validi, trasformazione del braccio modificata realmente dall'animazione e bounding box finite. Quattro test complessivi passati.

Il collegamento Tripo API è stato autenticato, ma ha 0 crediti. La ripresa automatica è stata portata a ogni cinque ore fino al 3 novembre, come approssimazione esplicita: il timer del limite dell'account non è accessibile.

## Aggiornamento: precaricamento e seconda rifinitura

L'utente ha chiesto maggiore qualità del personaggio e delle pose, con precaricamento al primo avvio e riuso locale agli avvii successivi. Distinzione comunicata: GLB, texture e clip sono asset scaricabili/cacheabili; i programmi shader vengono compilati sulla GPU, con eventuale cache gestita da browser e driver. Non promettere persistenza indefinita o avvio istantaneo.

Implementato:

- `src/core/preload.js`: caricamento prioritario del santuario/personaggio, fondali successivi in idle, rispetto Save-Data, timeout immagini e preparazione asincrona delle pipeline GPU tramite Three.js `compileAsync`.
- Service worker ES module generato dalla build con manifest SHA-256 per ogni file statico. Cache-first per revisioni; solo gli asset modificati cambiano chiave. API, documenti, login, parametri di query, richieste Range e metodi diversi da GET sono esclusi. Risposte HTML/JSON al posto di un GLB non sono cacheabili. Cache piena/non disponibile lascia funzionare la rete.
- Registrazione solo in produzione e contesto sicuro; HTTP locale e browser non compatibili continuano a funzionare normalmente. Nessun offline bypass del login o app-shell precachato.
- Nuova proporzione collo/testa, mento più affusolato, frangia più piatta, ciocche mosse, pieghe del kimono, saluto e inchino più leggibili nel GLB e nei render.
- Gaze smorzato e ritorno al respiro legato al termine effettivo della clip, eliminando il timer fisso.

Il personaggio resta uno studio stilizzato, non una riproduzione di pari dettaglio della reference. Il modello contiene sempre 18 ossa e tre clip; nessun servizio Tripo è stato consumato.

Verifiche: test Node su cache miss/hit, revisione modificata, esclusioni API/auth, storage negato/quota, risposte inattese, GLB e geometria. Browser locale: verificato il passaggio al teatro, immagine caricata e opacità finale 1 dopo la transizione. Il browser cloud non offre GPU e il preview HTTP non è un contesto sicuro: compilazione GPU e cache service worker end-to-end su HTTPS/dispositivo reale rimangono da misurare. Non dichiarare tempi di avvio misurati senza un confronto first/repeat su dispositivo reale.

## Revisione pannelli, composizioni e direzione artistica — 28 ottobre

Richieste dell'utente: un gesto = una sezione intera; personaggio collocato per modulo/ambiente e profondità; code naturali, volumetriche e animate senza apertura a loto; meno zoom; rapporti 4:3, 16:10, 16:9, 21:9, 32:9 e telefoni; niente perdita casuale di nitidezza; font locali a pennellata con ミ nel marchio; petali in profondità; Spotify; selettore lingua semplice.

Implementazione:

- `src/core/panels.js` gestisce ruota/inerzia, swipe verticale e orizzontale, tastiera e assestamento scrollbar. Pannelli da 100dvh, nessuna posizione intermedia di riposo. Dialoghi, player e lista moduli mantengono i propri controlli; lista lunga scorre internamente nei telefoni piccoli. Lenis riceve solo gli spostamenti di pannello quando il cinema è attivo.
- `src/scenes/composition.js` definisce composizioni per tutte le sette scene, inclusa scala apparente, profondità, posizione e fondale. Limiti del personaggio calcolati dal rapporto dello schermo. Musica e Creator usano il teatro; Discord la città.
- Illustrazione principale in DOM ad alta risoluzione anche con GPU attiva, indipendente dal DPR adattivo. Rimossa la soglia GPU sotto 1. Il vecchio abbassamento progressivo della risoluzione è una causa plausibile della sfocatura segnalata, non una diagnosi riprodotta sul telefono dell'utente. Il prototipo 3D resta opzionale.
- Code asimmetriche con radice comune, discesa e ricciolo, sezione tonda e materiali fisici con trama procedurale di pelo, bump e sheen. SVG con le stesse curve e centinaia di filamenti per coda nel fallback. 2–4 code visibili, dissolvenze, nessuna crescita scalata a petalo; movimento indipendente e rispetto reduced-motion. La resa WebGPU/WebGL deve ancora essere controllata su GPU reale.
- Fondali senza ingrandimento aggiuntivo e parallax limitato a pochi pixel. Inquadratura contenuta su desktop, estensione sfumata, inquadratura alta meno ritagliata sui telefoni.
- Petali con geometria sagomata instanziata su profondità diverse; fallback CSS con prospettiva anche senza GPU.
- Tre font display originali generati con FontTools, riproducibili con `tools/build_brush_font.py`: Yokai Brush, Ink, Wind. File WOFF locali, inclusi glifi ミ e vocali accentate. `/type-lab.html` confronta le tre proposte; non presentarle come una scelta già approvata. Body font già bundlati localmente; nessun Google Fonts CDN.
- Selettore IT/EN nell'header, preferenza persistita e sincronizzata con impostazioni. Inclusi label accessibili tradotti. Non dichiarare altre lingue complete.
- Modulo Spotify pronto per embed ufficiale caricato su richiesta; parser di URL rigoroso e CSP limitata a open.spotify.com. `public/music.json` ha spotify:null: manca il link verificato dell'artista/album/playlist. La ricerca nella cronologia non lo ha trovato; NON associare G&J o omonimi a iYokai per deduzione. Chiedere all'utente il link, nessuna credenziale/API key necessaria per un embed pubblico.

Verifica: 13 test Node passati (cache, GLB, code, composizioni, parser Spotify, inerzia e swipe). Browser cloud: pannello Discord allineato esattamente a top=0, altezza=viewport dopo PageDown; switch EN funzionante. Controllati gli ingombri di tutte le scene a 1024×768, 1280×800, 1280×720, 1680×720, 2560×720, 390×844, 360×640, 844×390, senza overflow orizzontale. Corretto ingombro musica sul telefono orizzontale. Sono viewport simulati nel browser: test touch e prestazioni su hardware reale ancora necessari. Browser cloud privo di WebGPU/WebGL, quindi screenshot mostrano illustrazione/SVG/CSS. Nessun servizio a pagamento utilizzato.

## Priorità aggiornata — 29 ottobre: tavole statiche integrate

L'utente ha cambiato la direzione immediata: creare per ora scene statiche con
Kitsune già dipinta nell'ambiente, per coerenza di pelo, luci, scala e prospettiva.
Controllare esplicitamente le proporzioni. Vedere `STATIC_ART_DIRECTION.md`.

Default senza renderer 3D: tre nuove tavole integrate `still-{shrine,city,theater}.webp`.
Resta la navigazione a pannelli e IT/EN. Il prototipo animato è conservato, non
è più il percorso principale. Non rigenerare modelli Tripo né riportare di
propria iniziativa il vecchio avatar sovrapposto sulla home.

Font originale Fude al posto dei precedenti studi a gessetto. Minuscole reali,
pressione e spaziature proporzionali, kerning, ミ incluso, frasi su righe intere.
Licenza MIT dei nostri file. I quattro riferimenti commerciali non incorporati.

Spotify è ora identificato e configurato: artista 6E4HZollrEstP2G17Uiq23,
album The Oni of Jah 0X5K33clT2LfQSn5vrn8t4. Il player ufficiale è stato verificato
nel browser, non chiedere di nuovo il link all'utente.

## Scelta esplicita dell'utente — Harukaze

Il 29 ottobre l'utente ha detto «Usa il font harukaze». Questa scelta supera
Fude e la bozza Sumi non pubblicata. Usare il vero Harukaze senza modificarlo.

Scaricata la demo originale da DaFont (Nugs Studio); TTF intatto in
`public/fonts/harukaze/Harukaze.ttf`, termini integrali in `README.txt` accanto.
Solo valutazione personale non commerciale nella preview owner-private attuale.
Non è copyright-free e non è coperto dalla MIT dei font precedenti. Prima del
lancio del sito del progetto serve licenza dell'autore che copra gli usi effettivi;
il sito distingue Web Font ($45 al controllo attuale) e uso del logo/marchio.
Non acquistare nulla senza autorizzazione, non includere la demo in un push
al GitHub pubblico. Font originale non convertito né alterato. Il browser usa la versione OTF originale, verificata con stato loaded e resa visiva effettiva; TTF conservato come formato alternativo.

La demo non contiene accenti italiani, apostrofo tipografico o ミ. Adattamento
DOM/CSS per accenti sulle lettere originali, nome accessibile italiano completo;
apostrofo visualizzato diritto. ミ mantenuto come testo reale con fallback serif
locale. L'adattatore è separato da file font e traduzioni; nessuna perdita di
accenti nei nomi accessibili. Corpo testo e controlli restano nei font locali
leggibili esistenti.

Verifica Harukaze: file OTF e TTF confrontati byte per byte con lo ZIP ufficiale,
nessuna modifica. OTF caricato dal browser con stato loaded e font effettivamente
visibile, non soltanto font-family dichiarato. Controllati titoli e pannelli
negli otto viewport di riferimento senza overflow; switch IT/EN verificato e
nome accessibile italiano con accenti preservato. Il periodo di valutazione
personale non autorizza la pubblicazione commerciale della demo.

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

Verificato anche Music: CTA → dettaglio con focus sul titolo e percorso
`#protocol/music` conservato.

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

## 30 ottobre — revisione 10 del kerning, prima della nuova pubblicazione

Su segnalazione utente corretti Yo, rd e Protocollo con metriche del corpo e
condizioni diverse per ogni coppia. La prova a sola spaziatura uniforme causava
ri/re sovrapposte ed è stata scartata. 2704 coppie e 140608 terne per variante
verificate con shaping reale; prova raster indipendente 160 px: zero intersezioni
sopra baseline (2704 normale, 2702 Extreme, escluse Le/Il intenzionali).
Il generatore condiziona ogni coppia anche ai raster 32/80/160 px, rilevando
piccole punte non intercettate dalla scansione vettoriale a passi di 2 unità.
Forme e legature preservate; accenti campione NFC/NFD equivalenti. Sorgenti,
CSV e verifiche in tools/fonts/ e docs/font-proposals/spacing-r10-*.

Marchio mobile Discord corretto: era uno pseudo-elemento con Harukaze proprio,
non raggiunto dalla sostituzione r09. Unificata la sequenza iYokaiミ negli altri
marchi, senza elemento katakana separato. Browser: home Discord negli 8 formati,
nessun overflow orizzontale; titolo e marchio mobile usano Yokaiextreme.

## 30 ottobre — recupero checkpoint r11

Recuperato il commit 2001efedeca08836895e477a88988a68a9fd8fc2 dopo la perdita
del checkout temporaneo. Ricostruiti font r11 (coppie maiuscola/minuscola,
apostrofi autonomi, conservazione delle forme e swash), sorgenti TTF/TTX/SVG,
selettori con bandiere locali e tag corretti. Ricostruite le 1232 chiavi inglesi
e italiane di interfaccia, pannello, FAQ, moduli, patch notes, legali e comandi.
La generazione locale delle altre otto lingue è in corso; non dichiararla completa
prima della validazione di parità e dei segnaposto. Nessuna modifica alle tavole.
Questo checkpoint salva i sorgenti; non certifica API o backend di produzione.

## 30 ottobre — completamento r11 e backup unico

Ricostruite e validate 1232 voci per ognuna delle 10 lingue: IT/EN/ES/FR/DE/RU/UA/
JP/KR/CN (tag it/en/es-ES/fr/de/ru/uk/ja/ko/zh-CN). Firme dei 584 comandi
preservate; descrizioni, FAQ, pannello, moduli, patch notes e pagine legali hanno
dizionari locali. Nuove lingue generate offline con correzioni editoriali;
revisione madrelingua non eseguita. Nessuna chiamata di traduzione nel browser.

33 test JavaScript passati. Font r11: 3364 coppie e 140608 terne per variante;
raster indipendente di 3364/3362 coppie senza intersezioni sopra baseline.
Conservati gli asset statici e il backend. Nessuna API reale o GPU fisica provata.
Browser: barra Discord in tedesco verificata negli 8 formati richiesti, con
controlli entro la viewport e senza overflow; adattata la barra per etichette
lunghe su desktop stretti. Vedere anche LOCALIZATION_COVERAGE.json.

ZIP finale: sorgenti, build dist, asset, backend predisposto, font modificabili,
studi storici, cronologia Git e istruzioni di ripristino. Esclusi dipendenze
reinstallabili, token/sessioni, database inesistenti e pesi opzionali MT.
Il push GitHub pubblico resta bloccato dall'autenticazione Git mancante
(verificato con dry-run). Non usare un commit API con autore diverso da
Yokai Site Dev. Preparato export Git per il successivo push autenticato.


## 30 ottobre — reinvio contatti dal pannello owner

Verificato il remoto GitHub: main pubblicato ceb1f1863e980dd8fb6d470d0e37dde087486254
(supera il precedente blocco di autenticazione documentato). Sorgente Sites di
partenza d70626f, anteprima owner-private confermata. Non riportare Harukaze al
posto dei font Yokai normale/Extreme r11 già approvati. Nessuna modifica alle
tavole, alle code, al terminale o alle transizioni.

Aggiunto recupero manuale dei contatti Discord sicuramente falliti, dal pannello
owner: API con sessione/CSRF/Origin, controllo owner nel bot a ogni tentativo,
rate limit e presa in carico atomica nel database. Esiti sconosciuti, richieste
in corso o già consegnate restano bloccati per evitare duplicati. Testo sempre
cifrato a riposo; i dati del reinvio vengono letti dal server. Interfaccia in
10 lingue; 1236 chiavi per lingua. Dettagli in CONTACT_AND_PLANS.md.

Verifiche locali: 34 test JavaScript e 34 test backend con storage/trasporti
simulati; build Vite riuscita. La suite che richiede PostgreSQL non è eseguibile
senza TEST_DATABASE_URL (3 test stato non avviati per configurazione mancante).
Non verificati PostgreSQL reale, API Discord reali, telefono fisico o layout
owner autenticato nel browser in questa revisione. Pannello live ancora
disabilitato finché bot, OAuth e database non vengono configurati e collaudati.
Lo ZIP r11 resta il backup precedente: non contiene questa modifica successiva.

## 30 ottobre — lore canonica, nove code e Casa degli Spiriti

Importato integralmente il TXT dell'autrice: 16 lore originali e bio SEO finali,
conservate senza riscritture in docs/lore e nei dati locali del sito. Finestre
bio con Lore completa, comandi pertinenti per funzionalità e invito per i bot.
Shirayuki/Aoi/Kuro/Hana/Rei sono Music 1–5. Aggiunto iYokai Mod come nona coda;
la Casa degli Spiriti è una dimora separata, con settimo pannello e nuova tavola
21:9. Originale PNG e prompt/provenienza conservati. Nessuna modifica ai font
Yokai r11, alle tavole precedenti o riattivazione di personaggi GPU/code animate.

Letto il bot remoto (413186ab88fc7b3a8fc01fdd0b0da40ad77467cd): ModBot esiste già,
si avvia con YOKAI_MOD_TOKEN e non possiede listener/comandi autonomi; esegue
azioni/log scelti da bot_roles mentre Main ascolta gli eventi. La scheda non
promette autonomia a Main spento. I comandi musicali del Core sono condivisi
con i worker, non inventati come slash tree delle singole istanze. Aggiunti ID
musicali/Mod a links.json e Mod alla policy di esempio. Token/ID non inventati.

Interfaccia in dieci lingue; bio/lore dell'autrice restano in italiano originale,
con indicazione esplicita e lang=it anche quando la UI è giapponese o altra.
38 test JavaScript e 34 test backend simulati passati. Browser: House e finestra
entro la viewport negli 8 formati, niente overflow orizzontale; bio/lore della
Casa, scheda Shirayuki e filtro limitato ai 28 comandi musicali verificati.
UI giapponese verificata con testo originale italiano dichiarato. Non testati
inviti Discord reali, avvio Mod, download non configurati o telefono fisico.
La configurazione live OAuth/API/PostgreSQL resta incompleta. Il backup ZIP r11
è precedente a questo aggiornamento; sorgenti correnti salvati con Git.

## 30 ottobre — menu leggibile, download e ordine Discord

Didascalia del menu mobile `iYokaiミ / CONTROL & EXPLORE`: 17 px, font locale
YokaiInterface e nessun tracking aggiunto. La correzione è locale alla didascalia,
non altera metriche, kerning o font Yokai normale/Extreme del resto del sito.

Ordine esplicito: Discord Core, Dashboard, Funzionalità, Musica, Spiriti,
Nove code, Casa degli Spiriti. Ogni sezione mantiene la propria tavola;
il collegamento Music nelle funzionalità usa il riferimento al pannello,
non un indice fisso. Pulsanti Casa rinominati Scarica l’applicazione Desktop /
Mobile e singoli download Desktop/Mobile nella finestra bio. Aggiunto pulsante
Funzionalità sulla Casa con finestra contenente solo Work in Progress.
Scelta protocollo Progetti futuri, etichette aggiornate nelle dieci lingue.

39 test JavaScript e build passati. Browser simulato 390×844: menu a 17 px senza
overflow, ordine dei sette pannelli verificato nel DOM, nuovi pulsanti e finestra
Work in Progress verificati. Controllata anche la dicitura Progetti futuri al
ritorno al selettore. Nessuna modifica al backend e nessun test su telefono fisico.
