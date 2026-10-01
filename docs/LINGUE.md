# Lingue del sito

Il bot usa la lingua del client Discord. Il sito ne segue l'elenco: i **32 locali** della documentazione di Discord
(bg, cs, da, de, el, en-GB/en-US, es-419, es-ES, fi, fr, hi, hr, hu, id, it, ja, ko, lt, nl, no, pl, pt-BR, ro, ru, sv-SE, th, tr, uk, vi, zh-CN, zh-TW). Discord non offre arabo né ebraico.
`en-GB` e `en-US` condividono `en.json`.

## Stato
Complete: **it**, **en**. Le altre non compaiono nel selettore finché non esiste il loro file.

## Aggiungere una lingua
1. Genera la bozza: `ANTHROPIC_API_KEY=... python3 tools/translate.py pt-BR ja ko` (controlla chiavi e segnaposto; **non provato qui**, serve la tua chiave). Oppure copia `src/i18n/en.json` e traduci i valori.
2. Fai rivedere il testo a un madrelingua.
3. Il file `src/i18n/<codice>.json` basta: il selettore lo mostra col nome nativo (nomi in `src/i18n/index.js`).
- Al primo accesso la lingua si sceglie dal browser (anche `pt-PT` va su `pt-BR`); le chiavi mancanti ripiegano sull'inglese.
- Lingue da destra a sinistra (ar, he, fa, ur): la direzione si imposta da sola.

## Restano nella lingua del bot
Elenco e descrizioni dei comandi, nomi dei moduli nel panel: arrivano dal bot. Il piano è che l'API riceva la lingua e legga le traduzioni dal bot.

## Paesi dove Discord è bloccato
Il sito non filtra per Paese: la lingua non coincide con lo Stato. Se vuoi escludere una lingua o limitare la distribuzione, è una scelta da prendere con un consulente legale.
