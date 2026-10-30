"""Render the actual local font and an original vector lettering concept.
The second specimen is not an installable font or a traced Harukaze derivative.
"""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import math, random
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'docs/font-proposals';OUT.mkdir(exist_ok=True)
regular=ROOT/'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'
# Pillow uses a bundled system font only for specimen metadata; title 1 uses Harukaze.
small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',23)
def canvas(label,description):
 im=Image.new('RGB',(1200,640),'#0b0710');d=ImageDraw.Draw(im)
 d.line((65,90,1135,90),fill='#a88b60',width=2);d.text((65,45),label,font=small,fill='#c6ad83')
 d.text((65,525),description,font=small,fill='#ccbcd2');return im
first=canvas('01 / HARUKAZE LOCALE — ATTUALE','Font attuale. Demo privata; licenza commerciale da verificare.')
d=ImageDraw.Draw(first);font=ImageFont.truetype(str(ROOT/'public/fonts/harukaze/Harukaze.otf'),235)
d.text((100,175),'iYokai',font=font,fill='#efe3ee')
# Same explicit hand-drawn ミ in both specimens so the important suffix is visible.
def mi(im):
 d=ImageDraw.Draw(im)
 for y in (220,270,320):d.polygon([(910,y),(1050,y+18),(1040,y+33),(923,y+13)],fill='#d6b279')
mi(first);first.save(OUT/'01-harukaze-current.png')
# Original open paths designed from scratch; broad brush vocabulary, no font outline imported.
paths=[('M25 100 L14 218 M29 66 L35 48',13),('M66 75 L101 135 L145 55 M101 135 L81 221',22),('M171 149 C125 132 139 225 178 210 C212 198 214 133 171 149',16),('M234 76 L215 216 M223 164 L279 127 M225 164 L275 220',17),('M326 145 C274 123 273 221 308 215 L341 147 L326 223',17),('M383 137 L363 224 M387 103 L395 82',14)]
svg='<svg xmlns="http://www.w3.org/2000/svg" width="850" height="350" viewBox="0 0 430 255"><g fill="none" stroke="#efe3ee" stroke-linecap="square" stroke-linejoin="bevel">'+''.join(f'<path d="{p}" stroke-width="{w}"/>' for p,w in paths)+'</g><g stroke="#0b0710" stroke-width="1.1" opacity=".8"><path d="M96 133L78 223 M230 79L214 217 M332 147L324 222 M374 149L358 223"/></g></svg>'
second=canvas('02 / YOKAI KAGE — BOZZA ORIGINALE','Lettering originale da valutare: solo campione, non ancora un font completo.')
draw=ImageDraw.Draw(second)
strokes=[([(25,100),(14,218)],13),([(29,66),(35,48)],13),([(66,75),(101,135),(145,55)],22),([(101,135),(81,221)],22),([(234,76),(215,216)],17),([(223,164),(279,127)],17),([(223,164),(275,220)],17),([(326,145),(312,142),(292,151),(284,177),(286,201),(299,216),(314,205),(341,147),(326,223)],17),([(383,137),(363,224)],14),([(387,103),(395,82)],14)]
strokes.append(([(172+32*math.cos(i*math.pi/30),180+36*math.sin(i*math.pi/30)) for i in range(61)],16))
for points,width in strokes:
 pts=[(85+x*1.85,125+y*1.3) for x,y in points]
 # A pressure-shaped nib with tapered ends and dry-brush gaps.
 samples=[]
 for a,b in zip(pts,pts[1:]):
  steps=max(2,int(math.dist(a,b)/2))
  samples.extend([(a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps) for j in range(steps)])
 samples.append(pts[-1]);left=[];right=[]
 for i,(x,y) in enumerate(samples):
  a=samples[max(0,i-1)];b=samples[min(len(samples)-1,i+1)];dx=b[0]-a[0];dy=b[1]-a[1];length=math.hypot(dx,dy) or 1
  t=i/max(1,len(samples)-1);pressure=(.22+.9*math.sin(math.pi*t)**.5)*(1-.9*max(0,(t-.82)/.18))
  w=width*.78*pressure*(1+.09*math.sin(i*2.1));nx=-dy/length;ny=dx/length
  left.append((x+nx*w,y+ny*w));right.append((x-nx*w,y-ny*w))
 draw.polygon(left+right[::-1],fill='#efe3ee')
 # Split bristles along the stroke, without using outlines from another font.
 for offset in (-.23,.18):
  trail=[]
  for i,(x,y) in enumerate(samples):
   if .25<i/max(1,len(samples)-1)<.8:trail.append((x+offset*width,y))
  if len(trail)>1:draw.line(trail,fill='#0b0710',width=1)

mi(second);second.save(OUT/'02-yokai-kage-concept.png')
(OUT/'yokai-kage-lettering.svg').write_text(svg)
