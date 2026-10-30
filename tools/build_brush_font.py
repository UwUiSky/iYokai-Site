"""Original monoline skeletons expanded with a varying brush nib. No source font."""
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from pathlib import Path
import math, random
ROOT=Path(__file__).resolve().parents[1]
# coordinates in a five by seven calligraphic grid
S={
'A':[[(0,0),(2.2,7),(4.5,0)],[(.8,2.5),(3.8,2.7)]],
'B':[[(.3,0),(.4,7)],[(.4,7),(3,7),(4,5.8),(3.2,4),(.4,3.8)],[(.4,3.8),(3.4,3.8),(4.3,2),(3.2,.2),(.3,0)]],
'C':[[(4.3,6.2),(3,7),(.8,6.3),(0,3.6),(.7,.8),(2.8,0),(4.3,1)]],
'D':[[(.3,0),(.3,7)],[(.3,7),(2.5,7),(4.2,5.2),(4.4,2.5),(3,.4),(.3,0)]],
'E':[[(4.3,7),(.3,6.8),(.2,0),(4.4,.2)],[(.2,3.6),(3.5,3.8)]],
'F':[[(.2,0),(.3,7),(4.5,7)],[(.3,3.8),(3.5,4)]],
'G':[[(4.4,6.2),(3,7),(.8,6.2),(0,3.5),(.8,.7),(3,0),(4.4,1.2),(4.3,3.5),(2.6,3.4)]],
'H':[[(.3,0),(.4,7)],[(4.3,0),(4.5,7)],[(.3,3.5),(4.4,3.8)]],
'I':[[(1,7),(3.8,7)],[(2.5,7),(2.3,0)],[(.8,0),(3.8,.2)]],
'J':[[(1.5,7),(4.4,7),(4.2,1.4),(3,0),(1,0),(0,1.3)]],
'K':[[(.3,0),(.4,7)],[(4.5,7),(.4,3.1),(4.5,0)]],
'L':[[(.4,7),(.2,0),(4.5,.2)]],
'M':[[(.2,0),(.5,7),(2.5,2.8),(4.5,7),(4.7,0)]],
'N':[[(.2,0),(.4,7),(4.5,0),(4.6,7)]],
'O':[[(2.2,7),(.6,6.2),(0,3.4),(.6,1),(2.5,0),(4.2,1.2),(4.6,3.8),(3.8,6.3),(2.2,7)]],
'P':[[(.3,0),(.4,7),(3.2,7),(4.4,5.4),(3.4,3.6),(.3,3.5)]],
'Q':[[(2.2,7),(.6,6.2),(0,3.4),(.6,1),(2.5,0),(4.2,1.2),(4.6,3.8),(3.8,6.3),(2.2,7)],[(2.7,1.7),(4.8,-.5)]],
'R':[[(.3,0),(.4,7),(3.2,7),(4.4,5.5),(3.4,3.7),(.4,3.6)],[(2.4,3.7),(4.6,0)]],
'S':[[(4.4,6.2),(3,7),(.8,6.5),(0,5),(.8,3.9),(3.8,2.8),(4.4,1.3),(3.2,0),(.8,.2),(0,1)]],
'T':[[(0,7),(5,7)],[(2.6,7),(2.2,0)]],
'U':[[(.3,7),(.2,1.7),(1,0),(3.2,0),(4.3,1.6),(4.5,7)]],
'V':[[(.1,7),(2.2,0),(4.8,7)]],
'W':[[(0,7),(1,0),(2.6,4),(4,0),(5,7)]],
'X':[[(.1,7),(4.6,0)],[(4.7,7),(0,0)]],
'Y':[[(0,7),(2.4,3.6),(4.8,7)],[(2.4,3.6),(2.2,0)]],
'Z':[[(0,7),(4.6,7),(0,0),(4.8,.2)]],
'0':[[(2.2,7),(.3,6),(.1,1),(2.3,0),(4.3,1),(4.5,6),(2.2,7)]],
'1':[[(.8,5.4),(2.6,7),(2.4,0)],[(.6,0),(4,0)]],
'2':[[(0,5.6),(1.2,7),(3.5,7),(4.5,5.6),(3.8,4),(0,0),(4.7,0)]],
'3':[[(0,6.2),(2,7),(4.3,6),(4.2,4.6),(2.1,3.6),(4.3,2.7),(4.4,1),(2.4,0),(0,.7)]],
'4':[[(3.6,7),(0,2.5),(4.8,2.5)],[(3.6,7),(3.5,0)]],
'5':[[(4.4,7),(.3,7),(.2,3.9),(3.2,4),(4.5,2.6),(4,1),(2.4,0),(0,.7)]],
'6':[[(4,6.8),(2.3,7),(.5,5.6),(.1,1.7),(1.5,0),(3.8,.4),(4.5,2.3),(3.5,3.8),(1.1,3.8),(.1,2)]],
'7':[[(0,7),(4.7,7),(1.8,0)]],
'8':[[(2.2,3.6),(.1,5.2),(.8,6.7),(3.6,6.9),(4.5,5.3),(2.2,3.6),(.1,1.7),(1,0),(3.5,0),(4.5,1.7),(2.2,3.6)]],
'9':[[(4.5,4.6),(3.8,6.7),(1.3,7),(.1,5.4),(.7,3.6),(3.5,3.6),(4.5,5.1),(4.2,1.2),(2.5,0),(.5,.3)]],
'.':[[(1,0),(1.15,.1)]], ',':[[(1,.2),(.6,-1)]], ':':[[(1,4),(1.1,4.1)],[(1,0),(1.1,.1)]],
'-':[[(.5,2.8),(3.5,3)]], '/':[[(0,0),(4,7)]], "'": [[(1.5,7),(1,5.8)]],
'!':[[(1.4,7),(1.2,2)],[(1.2,0),(1.3,.1)]], '?':[[(0,5.8),(1,7),(3,7),(4,5.5),(2,3.5),(2,2)],[(2,0),(2.1,.1)]],
'&':[[(4.5,.2),(.3,5.2),(.8,7),(2.8,7),(3.5,5.5),(.2,2),(.2,.6),(1.5,0),(3.1,.6),(4.5,3.5)]],
'ミ':[[(.4,6.7),(4.4,5.7)],[(.8,4),(4,3.2)],[(.2,1.5),(4.8,0)]],
}

def generate(name,weight,rough):
 random.seed(19)
 chars=list(S)+list('abcdefghijklmnopqrstuvwxyz')+list('àèéìòùÀÈÉÌÒÙâêîôûäëïöüñçÀÉ')+[' ','’','—','–','ō','Ō','&']
 chars=list(dict.fromkeys(chars)); order=['.notdef']+[f'u{ord(c):04x}' for c in chars];glyphs={};metrics={};cmap={}
 glyphs['.notdef']=TTGlyphPen(None).glyph();metrics['.notdef']=(600,0)
 for c in chars:
  key=f'u{ord(c):04x}';cmap[ord(c)]=key;pen=TTGlyphPen(None)
  base=c.upper();scale=.81 if c.islower() else 1
  import unicodedata
  decomp=unicodedata.normalize('NFD',base);base=decomp[0]
  paths=S.get(base,S.get("'")) if c!=' ' else []
  if c in ['—','–']:paths=S['-']
  if c=='’':paths=S["'"]
  for path in paths:
   for a,b in zip(path,path[1:]):
    ax,ay=a;bx,by=b;dx=bx-ax;dy=by-ay;length=math.hypot(dx,dy) or 1
    n=max(4,int(length*7));left=[];right=[]
    for j in range(n+1):
     t=j/n;x=ax+dx*t;y=ay+dy*t
     radius=weight*(.6+.35*math.sin(math.pi*t)+random.random()*rough)
     nx=-dy/length*radius;ny=dx/length*radius
     # slight right slant and blade-shaped nib, visibly dry-brushed edges
     left.append(((x+nx+y*.055)*92*scale+55,(y+ny)*92*scale))
     right.append(((x-nx+y*.055)*92*scale+55,(y-ny)*92*scale))
    poly=left+right[::-1];pen.moveTo(poly[0]);[pen.lineTo(p) for p in poly[1:]];pen.closePath()
  if len(decomp)>1:
   accent=[(1.8,7.6),(2.6,8.5)] if decomp[1]=='\u0301' else [(1.8,8.5),(2.7,7.6)]
   a,b=accent;pen.moveTo((a[0]*92+40,a[1]*92));pen.lineTo((b[0]*92+40,b[1]*92));pen.lineTo((b[0]*92+72,b[1]*92));pen.lineTo((a[0]*92+72,a[1]*92));pen.closePath()
  glyphs[key]=pen.glyph();advance=590*scale if c not in ' .,:!\'’' else (300 if c==' ' else 240)
  metrics[key]=(int(advance),0)
 fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=900,descent=-180);fb.setupNameTable({'familyName':name,'styleName':'Regular','uniqueFontIdentifier':name+' 1.0','fullName':name,'psName':name.replace(' ',''),'version':'Version 1.0','copyright':'Original glyph artwork — Yokai Site Dev, 2026. Licensed under MIT.'});fb.setupOS2(sTypoAscender=900,sTypoDescender=-180,usWinAscent=950,usWinDescent=200);fb.setupPost();fb.setupMaxp();fb.font.flavor='woff';fb.save(ROOT/'public/fonts'/f'{name.lower().replace(" ","-")}.woff')
for args in [('Yokai Brush',.43,.42),('Yokai Ink',.61,.3),('Yokai Wind',.28,.55)]:generate(*args)
