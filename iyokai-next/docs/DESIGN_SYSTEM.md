# iYokai — Awwwards Level Project

## 1. Identità & Atmosfera
Sito immersivo, dark, mysterious, ethereal, elegante.
Tema: Japanese yokai / kitsune spiriti.
Sensazione: silenzio, profondità, presenza spirituale, lusso quieto.
Vietato: neon, cute, chibi, kawaii, purple generico, Inter, layout centrati banali, gradienti viola, card generiche.

## 2. Palette ufficiale (Token)

### Core
- void: #07070b          → Background primario, profondità
- cinnabar: #C24A3A      → Accent primario, energia controllata
- orchid: #9B4D7A        → Accent secondario (uso raro e deliberato)
- pale-ink: #C8C4BC      → Testo primario
- mist: #8A8680          → Testo secondario
- ash: #2A2928           → Surface / card / pannelli

### Utilizzo
- Background sempre void o quasi.
- Cinnabar solo per momenti importanti (CTA, highlight, focus).
- Orchid massimo 5-8% dell’interfaccia.
- Mai usare bianco puro.

## 3. Tipografia
- Display: serif elegante o grotesk ad alto contrasto (es. "Instrument Serif", "PP Editorial New", "Playfair Display")
- Body: sans-serif neutra e leggibile (es. "Satoshi", "Inter" vietato → preferire "Geist", "Söhne", "Neue Montreal")
- Scale fluid obbligatoria con clamp()
- Letter-spacing leggermente negativo sui titoli grandi (-0.02em / -0.03em)
- Line-height generosa sui testi lunghi (1.6–1.75)

## 4. Motion System (molto importante)

### Easing
- Primary: cubic-bezier(0.16, 1, 0.3, 1)     → elegante e deciso
- Soft: cubic-bezier(0.22, 1, 0.36, 1)
- Dramatic: cubic-bezier(0.7, 0, 0.3, 1)

### Durate
- Micro: 0.3–0.45s
- Standard: 0.6–0.9s
- Cinematic: 1.2–1.8s
- Scroll scrub: molto fluido, mai nervoso

### Scroll
- Usare sempre Lenis
- GSAP ScrollTrigger con scrub: true (valori 0.8–1.5)
- Camera movement deve sembrare “pesante” e deliberato, mai fluttuante a caso
- Pinning delle sezioni chiave

### 3D Materials Language
- Preferire MeshPhysicalMaterial
- Transmission + thickness per elementi spiritici
- Iridescence controllata e sottile
- Roughness bassa-media (0.15–0.45)
- Emissive molto debole e calda (cinnabar / orchid a bassa intensità)
- Evitare materiali troppo “plastica lucida” o troppo opachi

## 5. Layout & Spacing
- Ritmo verticale forte (sezioni alte, respiro generoso)
- Asimmetria controllata
- Margini laterali generosi su desktop
- Evitare griglie troppo regolari e simmetriche

## 6. Performance Rules
- Target 60fps su laptop medi
- Adaptive quality / LOD
- prefers-reduced-motion deve essere rispettato
- Mobile: versione alleggerita (meno geometria, niente post-processing pesante)

## 7. Come lavorare
1. Prima di generare qualsiasi codice, consulta questo documento.
2. Preferisci le skill presenti in .claude/skills (soprattutto 3d-web-pack e awwwards-web-design).
3. Costruisci sezione per sezione.
4. Ogni elemento 3D deve rispettare il Material Language sopra.
5. Ogni animazione deve rispettare i Motion Tokens.

