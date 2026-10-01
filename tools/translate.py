#!/usr/bin/env python3
"""Traduce src/i18n/en.json nelle lingue indicate con l'API di Anthropic.
Uso: ANTHROPIC_API_KEY=... python3 tools/translate.py pt-BR ja ko   (codici = locali di Discord, vedi docs/LINGUE.md)
Le traduzioni vanno riviste da un madrelingua prima del lancio. Variabile opzionale: TRANSLATE_MODEL."""
import json, os, re, sys, urllib.request
KEY, MODEL = os.environ.get("ANTHROPIC_API_KEY"), os.environ.get("TRANSLATE_MODEL", "claude-sonnet-5-5")
SRC = json.load(open("src/i18n/en.json", encoding="utf-8"))
RULES = ("Traduci in {lang} i valori di questo JSON per l'interfaccia di un sito per un bot Discord (tono moderno, caldo, misterioso ma chiaro). "
         "Regole: restituisci SOLO un oggetto JSON con le stesse chiavi; non tradurre le chiavi; lascia invariati i segnaposto come {{n}} e {{s}}, i nomi (iYokai, ミ, Discord, Twitch, YouTube, "
         "Instagram, TikTok, Steam, Spotify), i simboli come © e i termini 'AutoMod', 'Level & XP', 'Music & Radio'; mantieni brevi i testi dei pulsanti.")
def ask(lang):
    body = json.dumps({"model": MODEL, "max_tokens": 8000, "messages": [{"role": "user", "content": RULES.format(lang=lang) + "\n\n" + json.dumps(SRC, ensure_ascii=False)}]}).encode()
    req = urllib.request.Request("https://api.anthropic.com/v1/messages", body, {"x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json"})
    text = json.load(urllib.request.urlopen(req, timeout=120))["content"][0]["text"]
    return json.loads(re.sub(r"^```(?:json)?\s*|\s*```$", "", text.strip()))
def check(out):
    assert out.keys() == SRC.keys(), f"chiavi diverse: {set(out) ^ set(SRC)}"
    for k, v in SRC.items():
        assert sorted(re.findall(r"\{\w+\}", v)) == sorted(re.findall(r"\{\w+\}", out[k])), f"segnaposto alterati in {k}"
if __name__ == "__main__":
    if not KEY or len(sys.argv) < 2: sys.exit(__doc__)
    for code in sys.argv[1:]:
        try:
            out = ask(code); check(out)
            json.dump(out, open(f"src/i18n/{code}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1); print("ok", code)
        except Exception as e: print("ERRORE", code, e)
