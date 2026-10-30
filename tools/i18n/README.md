# Dizionari locali

La base di traduzione è en.json. Le nuove lingue sono bozze automatiche offline
con correzioni in overrides.json: copertura non equivale a revisione madrelingua.
Il sito non chiama servizi di traduzione durante l'uso. Le firme slash dei
584 comandi restano originali; si traducono interfaccia e descrizioni.

Etichette visibili IT/EN/ES/FR/DE/RU/UA/JP/KR/CN. Tag tecnici
it/en/es-ES/fr/de/ru/uk/ja/ko/zh-CN. Bandiere SVG e font sono locali.

Rigenerazione (solo sviluppo, CTranslate2 e SentencePiece):

```
python tools/i18n/translate_offline.py --model-directory /path/al/modello-ct2
python tools/i18n/finalize.py
```

Modello: facebook/m2m100_418M (Meta, MIT). Conversione CT2 INT8:
https://huggingface.co/gn64/M2M100_418M_CTranslate2 , revisione
18e406c615ef2991fa74d53734bf66b0a6b10cb4. Provenienza e checksum nel JSON allegato.
I pesi non sono necessari al runtime del sito. Il generatore produce bozze;
il finalizzatore rifiuta chiavi o segnaposto mancanti. Integrare gli errori
segnalati in overrides.json e ripetere la validazione prima del build.

Le chiavi copy.* riguardano pannello, FAQ e contatto; panel.module.* i moduli;
patch.* le revisioni esistenti. Le nuove patch notes richiedono nuove traduzioni.
Le pagine legali restano bozze da completare prima del lancio pubblico.
