# Export pubblico r11

Snapshot completo della versione statica corrente: font Yokai, sorgenti modificabili,
backend predisposto, risorse e dieci dizionari locali.

Esclusi configurazione privata del Site, credenziali e demo Harukaze. I font Noto
conservano le licenze OFL. Vedere THIRD_PARTY_NOTICES.md.

Il commit è attribuito a Yokai Site Dev. Importazione in un clone aggiornato:

```sh
git switch main
git fetch /path/github-ready.bundle refs/heads/yokai-public-ready
git merge --ff-only FETCH_HEAD
git push origin main
```

Non usare force push se il remoto è avanzato. Il push remoto non è stato eseguito:
mancano le credenziali Git in scrittura. L'export permette di completarlo in un
ambiente autenticato senza perdere il lavoro.

Le nuove lingue sono bozze automatiche da revisionare; credenziali e integrazioni
di produzione non fanno parte dello snapshot.
