# Aggiungere una lingua al sito

1. Copia `src/i18n/en.json` in `src/i18n/<codice>.json` (es. `es.json`) e traduci i valori: le chiavi non si toccano; `{n}` e `{s}` sono segnaposto da lasciare.
2. Aggiungi una riga a `LANGS` in `src/i18n/index.js`: `{ code: 'es', name: 'Español', load: () => import('./es.json') }`.
3. Per lingue da destra a sinistra (ar, he, fa, ur) la direzione si imposta da sola.

Le lingue mancanti ripiegano sull'italiano chiave per chiave. La lingua si sceglie nelle preferenze (ingranaggio) e, al primo accesso, dal browser.

Restano in italiano perché arrivano dal bot e non dal sito: elenco e descrizioni dei comandi, nomi dei moduli nel panel. Per tradurli, l'API potrebbe ricevere la lingua e leggere le traduzioni dal bot.
