# Screenshot di controllo: python3 tools/shot.py URL out.png [larghezza altezza]
import sys
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]
w, h = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1440, 900)
mobile = w < 600
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_context(viewport={"width": w, "height": h}, has_touch=mobile, is_mobile=mobile).new_page()
    logs = []
    pg.on("console", lambda m: logs.append(m.text))
    pg.on("pageerror", lambda e: logs.append("ERR " + str(e)))
    pg.goto(url); pg.wait_for_timeout(2500)
    pg.mouse.move(w * 0.7, h * 0.4); pg.wait_for_timeout(1200)
    pg.screenshot(path=out)
    print("backend:", pg.evaluate("document.documentElement.dataset.backend"), *logs[:5], sep="\n")
    b.close()
