# Visione dell'utente e fattibilità

Raccolta dal messaggio dell'utente del 1 novembre 2026. È la fonte per le
decisioni sul sito: quando qualcosa non è chiaro, si chiede all'utente.

## Cosa vuole l'utente

1. **Sito cinematografico "da Awwwards".** Il sito attuale è statico per scelta
   (pochi token, poco tempo); la revisione arriva dopo la chiusura del bot.
2. **Intro.** All'apertura c'è un terminale con il comando già inserito e un
   cooldown: se l'utente non preme nulla, si entra comunque in automatico.
   Dubbio dell'utente: il terminale potrebbe stonare con il tema kitsune/yokai,
   quindi intro ed evoluzione vanno ripensate.
3. **Scelta del protocollo.** Una schermata "scegli": Discord Bot, social,
   musica, ecc. Opzioni immaginate: selezione "da terminale" (premi 1–6), col
   mouse, oppure default automatico su Discord Bot. Da lì si carica la sezione.
4. **Funzione Linktree (obbligatoria).** Il sito deve funzionare come un
   Linktree, ma più bello: ogni categoria apre pannelli diversi con i link
   (social, canali di gioco: Steam, Epic, Discord, server community, ecc.).
5. **Discord Bot (progetto principale).** Home, dashboard, invito dell'app,
   invito del bot, download desktop (Android in futuro), funzionalità,
   identità, lore e tutto il contorno.
6. **Kitsune protagonista.** In home la kitsune arriva camminando verso la Casa
   degli Spiriti e guarda dentro; scrollando entra, e si passa con una
   transizione all'ambiente successivo, che si "ricostruisce".
   - Ambiente music bot: stanza a tema con mixer, microfoni, impianti audio.
   - Ambiente funzionalità: la kitsune davanti a tanti schermi; su ognuno un
     simbolo (difesa, antivirus, ecc.).
   - Scelte artistiche lasciate a Claude, purché coerenti con stile e qualità
     della sezione.
7. **Scroll a scatti.** Ogni scrollata porta alla sezione successiva (1, 2, 3…)
   con l'animazione completa, senza mezze pagine, come avviene ora.
8. **Pioggia di fiori di ciliegio**, con la kitsune che segue il mouse con lo
   sguardo, la testa e, se serve, il corpo; con pose e ambientazioni diverse
   per ogni sezione.
9. **Blender.** L'utente vuole collegare Claude a Blender per sviluppare il
   modello 3D della kitsune e gli ambienti.

## Fattibilità (risposta data all'utente)

| Richiesta | Fattibile | Note |
|---|---|---|
| Intro con cooldown e ingresso automatico | Sì | Proposto: "rituale" al posto del terminale (ofuda scritto a pennello, bastoncino d'incenso come cooldown). Da decidere con l'utente. |
| Scelta protocollo 1–6 / mouse / default Discord | Sì | Tavolette votive (ema) o lanterne, numeri anche in kanji, tasti 1–6. |
| Pagine link stile Linktree | Sì | Guidate da un file di dati (`links.json`): nuovi link senza toccare codice. |
| Sezione Discord Bot completa | Sì | Gran parte esiste già nella sorgente: va ripresentata. |
| Scroll a scatti per sezione | Sì | Un gesto = una sezione; filtro per trackpad; frecce e swipe; sezioni lunghe scorrono dentro. |
| Pioggia di sakura | Sì | Particelle istanziate, vento, leggera reazione al mouse. |
| Ambienti con schermi/oggetti interattivi | Sì | Le zone "schermo" delle tavole diventano elementi vivi e cliccabili. |
| Kitsune che cammina ed entra | Dipende | Serve materiale: video generati (strada A), pose dipinte (B) o modello 3D riggato (C). Claude non genera immagini/video in sessione. |
| Sguardo che segue il mouse | Dipende | Facile con modello 3D; con tavole servono 5–9 varianti della testa o Live2D; altrimenti solo deformazione leggera. |
| Modello 3D kitsune in Blender | Possibile, con limiti | Vedi `BLENDER.md`. Il prototipo di ottobre era lontano dal riferimento: serve un processo a fasi con verifiche visive e approvazione. |

## Decisioni ancora aperte

1. Intro: rituale o terminale?
2. Kitsune: strada A (video), B (tavole) o C (modello 3D da Blender)?
3. Tavole esistenti: ricolorare verso la palette o rigenerare?
4. Font: Instrument Serif o PP Editorial New; Geist o Neue Montreal.
