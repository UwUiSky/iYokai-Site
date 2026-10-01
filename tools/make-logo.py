# Genera gli asset del logo (tre graffi) dall'immagine alpha: python3 tools/make-logo.py percorso/graffi.jpg
# Produce: src/assets/claws.png (corpo), claws-rim.png (bordo luminoso), claws-paths.js (vettoriale tracciato con potrace),
#          public/logo.svg e public/favicon.svg
import json, subprocess, sys, tempfile, os, re
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

src = sys.argv[1]
lum = np.asarray(Image.open(src).convert("L")).astype(float)
ys, xs = np.where(lum > 60)
P = 14
x0, x1, y0, y1 = xs.min() - P, xs.max() + P, ys.min() - P, ys.max() + P
c = lum[y0:y1, x0:x1]; H, W = c.shape
alpha = np.clip((c - 14) / (205 - 14), 0, 1) ** 0.9
def png(a, name):
    Image.fromarray(np.dstack([np.full(a.shape, 255, np.uint8)] * 3 + [(a * 255).astype(np.uint8)]), "RGBA").save(f"src/assets/{name}", optimize=True)
os.makedirs("src/assets", exist_ok=True)
png(alpha, "claws.png")
mask = c > 90
rim = ndi.binary_dilation(mask, iterations=3) & ~ndi.binary_erosion(mask, iterations=1)
rimf = np.asarray(Image.fromarray((rim * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.4))).astype(float) / 255
glow = np.asarray(Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9))).astype(float) / 255
png(np.clip(np.maximum(rimf * 1.4, glow * 0.45), 0, 1), "claws-rim.png")
lab, n = ndi.label(ndi.binary_closing(mask, iterations=2))
sizes = ndi.sum(mask, lab, range(1, n + 1)); keep = [i + 1 for i in np.argsort(sizes)[::-1][:3]]
keep.sort(key=lambda i: ndi.center_of_mass(lab == i)[0])  # dall'alto in basso
paths = []
for i in keep:
    with tempfile.TemporaryDirectory() as d:
        Image.fromarray(((lab != i) * 255).astype(np.uint8)).convert("1").save(f"{d}/m.pbm")
        subprocess.run(["potrace", "-s", "-t", "20", "-a", "1.25", "-O", "1.2", "-o", f"{d}/m.svg", f"{d}/m.pbm"], check=True)
        svg = open(f"{d}/m.svg").read()
    paths.append(re.sub(r"\s+", " ", re.search(r'<path d="([^"]+)"', svg).group(1)).strip())
tr = f"translate(0,{H}) scale(0.1,-0.1)"
open("src/assets/claws-paths.js", "w").write(f"// Generato da tools/make-logo.py\nexport const CLAWS = {json.dumps({'w': int(W), 'h': int(H), 'transform': tr, 'paths': paths})};\n")
body = "".join(f'<path d="{p}"/>' for p in paths)
defs = '<defs><linearGradient id="b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a2a9a"/><stop offset="1" stop-color="#2c0a3d"/></linearGradient><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset=".55" stop-color="#b24bff"/><stop offset="1" stop-color="#ff3b6b"/></linearGradient><filter id="g" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="70" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
open("public/logo.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}">{defs}<g transform="{tr}" fill="url(#b)" stroke="url(#r)" stroke-width="26" stroke-linejoin="round" filter="url(#g)">{body}</g></svg>')
# icona semplice (fino a 1 em): tre graffi rastremati sulla geometria reale
def claw(s, e, w):
    (ax, ay), (bx, by) = s, e; dx, dy = bx - ax, by - ay; L = (dx * dx + dy * dy) ** .5; nx, ny = -dy / L, dx / L; mx, my = (ax + bx) / 2, (ay + by) / 2
    return f"M{ax:.1f} {ay:.1f}Q{mx + nx * w * .9:.1f} {my + ny * w * .9:.1f} {bx:.1f} {by:.1f}Q{mx - nx * w * .35:.1f} {my - ny * w * .35:.1f} {ax:.1f} {ay:.1f}Z"
k = 64 / 632; ox = (64 - 474 * k) / 2
pt = lambda x, y: (ox + (x - 161) * k, (y - 267) * k)
icon = "".join(claw(pt(*s), pt(*e), 8.5) for s, e in [((190, 268), (618, 573)), ((165, 413), (632, 768)), ((176, 595), (590, 898))])
open("src/assets/claws-icon.txt", "w").write(icon)
open("public/favicon.svg", "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff4fd8"/><stop offset="1" stop-color="#7c3aed"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="#050408"/><path d="{icon}" fill="url(#r)"/></svg>')
print("ritaglio", W, "x", H, "| tracciati:", len(paths), "| byte path:", [len(p) for p in paths], "| logo.svg:", os.path.getsize("public/logo.svg"))
