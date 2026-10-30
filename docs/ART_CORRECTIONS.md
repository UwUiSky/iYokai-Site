# Correzione orecchie — Discord Core, 30 ottobre 2026

Modifica con generatore immagini integrato, applicata alle tavole esistenti.
Nessun avatar sovrapposto, nessun modello o animazione 3D riattivati.
Le immagini sono state convertite in WebP a qualità92 senza ritagli o resize.
Gli originali precedenti sono conservati per eventuale confronto.

| Pannello | Asset finale in public/cinematic | Esito utente |
| --- | --- | --- |
| 2 · Funzionalità/Sicurezza | discord-security-ears-v2-wide.webp | Prima correzione approvata |
| 3 · Musica | discord-music-ears-v3-wide.webp | Coppia corretta approvata |
| 4 · Dashboard | discord-dashboard-ears-v3-wide.webp | Ultima variante accettata come compromesso provvisorio; non dichiararla perfetta |

Percorsi nel checkout:
- `/workspace/scratch/cb5a968c4aab/iyokai-site/public/cinematic/discord-security-ears-v2-wide.webp`
- `/workspace/scratch/cb5a968c4aab/iyokai-site/public/cinematic/discord-music-ears-v3-wide.webp`
- `/workspace/scratch/cb5a968c4aab/iyokai-site/public/cinematic/discord-dashboard-ears-v3-wide.webp`

Anche lo sfondo tenue della control room usa la Dashboard corretta. File versionati
per evitare che la cache mostri le tavole precedenti.

## Prompt e revisioni

Sintesi operativa del set di prompt usato nel generatore integrato:

1. **Sicurezza:** correggere soltanto testa/orecchie della donna Kitsune adulta;
   esattamente due orecchie naturali, nessuna punta aggiunta dietro la maschera,
   nessun orecchio umano. Mascherina bianca/rossa separata dall’anatomia e con
   contorno arrotondato senza ulteriori punte. Preservare volto, posa, abito,
   mani, code, luci, architettura, composizione panoramica21:9 e scala.
2. **Musica:** sostituire entrambe le orecchie con una coppia bilanciata, uguale
   per dimensione apparente e forma triangolare, pelo argento/bianco e interno
   rosa. Coppia dritta e coerente con il cranio. Preservare cuffie, volto e posa
   seduta, console, abito, code e ambiente. La prima variante con dimensioni
   disuguali è stata scartata; usare soltanto la versione approvata v3.
3. **Dashboard:** le varianti con un orecchio solo o con orecchie storte sono
   scartate. La revisione finale usa il dettaglio della Musica approvata come
   riferimento di forma e attacco al cranio, mantenendo corpo e scena della
   Dashboard. Il trasferimento ha introdotto una cuffia non richiesta: un
   ultimo intervento ha rimosso soltanto cuffia/archetto, ricostruendo i capelli
   argento e conservando coppia di orecchie, mascherina e fiocchi rossi.

Generazioni finali:
- Sicurezza: `exec-27444e6e-d7a0-4e11-aa09-7363cab435be.png`
- Musica: `exec-6a06f41a-abe1-425d-942d-b907819f92d3.png`
- Dashboard: `exec-acbb0817-4d2b-4d36-a936-623aba4c365c.png`

Non ripristinare varianti intermedie. Non rigenerare nuovamente Sicurezza o
Musica approvate senza una richiesta. Dashboard rimane una soluzione provvisoria
accettata dall’utente; un eventuale ulteriore ritocco richiede un nuovo brief.
