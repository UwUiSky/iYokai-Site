"""Original proportional brush lettering. No third-party font outlines used."""
from pathlib import Path
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
import ast, math, unicodedata
ROOT=Path(__file__).resolve().parents[1]
# Reuse our original skeleton data, not the earlier expansion / spacing algorithm.
module=ast.parse((ROOT/'tools/build_brush_font.py').read_text())
S=ast.literal_eval(next(n.value for n in module.body if isinstance(n,ast.Assign) and any(isinstance(t,ast.Name) and t.id=='S' for t in n.targets)))
S.update({
'a':[[(3.5,4.6),(1.4,4.9),(.2,3.4),(.5,1),(2,0),(3.6,1.7)],[(3.6,5),(3.5,0),(4.1,.3)]],
'b':[[(.4,7.2),(.2,0)],[(.3,3.7),(2,4.9),(3.7,3.9),(4,1.8),(2.7,.1),(.3,.5)]],
'c':[[(3.9,4.3),(2.3,5),(.5,4),(.1,1.9),(1.3,.1),(3.7,.7)]],
'd':[[(3.8,4.2),(2,4.9),(.3,3.2),(.4,1.1),(1.9,.1),(3.7,1.3)],[(3.9,7.3),(3.7,0),(4.3,.2)]],
'e':[[(.3,2.4),(3.7,2.8),(3.6,4.3),(2.1,4.9),(.5,3.8),(.2,1.8),(1.4,.2),(3.8,.8)]],
'f':[[(.7,-1.5),(1.4,5.9),(2.5,7.2),(4,6.8)],[(.1,4.1),(3.6,4.4)]],
'g':[[(3.7,4.2),(2,4.9),(.4,3.5),(.4,1.2),(1.8,.2),(3.6,1.5)],[(3.9,4.9),(3.6,-1.1),(2.5,-2.1),(.4,-1.8)]],
'h':[[(.4,7.2),(.2,0)],[(.3,3.1),(1.8,4.8),(3.4,4.2),(3.8,2.7),(3.6,0)]],
'i':[[(1.2,4.8),(1,0),(1.9,.3)],[(1.35,6.6),(1.3,6.25)]],
'j':[[(2,4.8),(1.7,-1),(1,-2),(-.2,-1.8)],[(2.2,6.6),(2.1,6.25)]],
'k':[[(.5,7.2),(.3,0)],[(3.8,4.9),(.5,2),(3.9,0)]],
'l':[[(1.2,7.3),(.8,.8),(1.2,0),(2,.3)]],
'm':[[(.3,4.9),(.1,0)],[(.3,3.2),(1.6,4.8),(2.8,4.3),(3,0)],[(3,3.3),(4.1,4.8),(5.4,4.1),(5.5,0)]],
'n':[[(.3,4.9),(.1,0)],[(.3,3.1),(1.8,4.8),(3.3,4.3),(3.7,2.6),(3.6,0)]],
'o':[[(2.1,5),(.5,4.1),(.1,2.2),(.8,.4),(2.7,.1),(4,1.5),(3.9,3.7),(2.1,5)]],
'p':[[(.4,4.9),(.1,-2)],[(.4,3.8),(2.2,4.9),(3.8,3.9),(4,1.9),(2.7,.4),(.3,.7)]],
'q':[[(3.8,4.1),(2,4.9),(.3,3.3),(.4,1.1),(1.8,.1),(3.7,1.5)],[(3.9,4.9),(3.6,-2),(4.3,-1.5)]],
'r':[[(.4,4.9),(.2,0)],[(.4,3.2),(1.8,4.8),(3.3,4.5)]],
's':[[(3.6,4.5),(2.1,5),(.6,4.4),(.3,3.3),(1.7,2.4),(3.3,1.7),(3.5,.7),(2.2,0),(.3,.6)]],
't':[[(1.9,6.5),(1.2,1.3),(1.8,.1),(3.4,.6)],[(.1,4.3),(3.8,4.6)]],
'u':[[(.4,4.8),(.3,1.4),(1.2,.1),(2.7,.5),(3.7,2.2)],[(3.9,4.9),(3.7,.1),(4.3,.3)]],
'v':[[(.1,4.9),(1.8,0)],[(1.8,0),(4.1,5)]],
'w':[[(.1,4.9),(1.1,0),(2.7,3.5)],[(2.7,3.5),(3.7,0),(5.2,5)]],
'x':[[(.1,4.8),(3.9,0)],[(4,4.9),(0,0)]],
'y':[[(.1,4.9),(1.9,.5)],[(4,5),(1.8,-.8),(.1,-2.2)]],
'z':[[(.1,4.7),(3.8,4.9),(.1,0),(3.9,.2)]],
'A':[[(.1,0),(2.3,7.2)],[(2.3,7.2),(4.5,-.1)],[(1,2.1),(3.8,2.5)]],
'M':[[(.2,0),(.6,7.1)],[(.6,7.1),(2.6,2.6)],[(2.6,2.6),(4.5,7.1)],[(4.5,7.1),(4.7,0)]],
'N':[[(.2,0),(.5,7.1)],[(.5,7.1),(4.5,0)],[(4.5,0),(4.7,7.2)]],
'O':[[(2.3,7.1),(.5,6.2),(-.1,3.5),(.6,.8),(2.7,-.1),(4.3,1.5),(4.5,4.3),(3.7,6.5),(2.3,7.1)]],
'ミ':[[(.1,6.7),(4.4,5.6)],[(.6,3.9),(3.9,3)],[(0,1.6),(4.8,-.1)]],
})
def smooth(points,steps=14):
 if len(points)==2:return [(points[0][0]+(points[1][0]-points[0][0])*t/steps,points[0][1]+(points[1][1]-points[0][1])*t/steps) for t in range(steps+1)]
 out=[]
 for i in range(len(points)-1):
  a=points[max(0,i-1)];b=points[i];c=points[i+1];d=points[min(len(points)-1,i+2)]
  for j in range(steps):
   t=j/steps;out.append(tuple(.5*(2*b[k]+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t) for k in range(2)))
 return out+[points[-1]]
def generate(name,weight):
 chars=list(dict.fromkeys(list(S)+list('àèéìòùÀÈÉÌÒÙâêîôûäëïöüñçãõåýÿ')+[' ','’','—','–','ō','Ō']))
 order=['.notdef']+[f'u{ord(c):04x}' for c in chars];glyphs={'.notdef':TTGlyphPen(None).glyph()};metrics={'.notdef':(600,0)};cmap={}
 for char in chars:
  key=f'u{ord(char):04x}';cmap[ord(char)]=key;pen=TTGlyphPen(None);decomp=unicodedata.normalize('NFD',char)
  paths=S.get(decomp[0],S["'"]) if char!=' ' else []
  if char in ['—','–']:paths=S['-']
  if char=='’':paths=S["'"]
  minx=0;maxx=0
  for path in paths:
   points=smooth(path);left=[];right=[]
   for j,(x,y) in enumerate(points):
    t=j/max(1,len(points)-1);prev=points[max(0,j-1)];nxt=points[min(len(points)-1,j+1)]
    dx=nxt[0]-prev[0];dy=nxt[1]-prev[1];length=math.hypot(dx,dy) or 1
    pressure=(.25+.95*math.sin(math.pi*(.12+.86*t))**.8)*(1-.75*t**6)
    radius=weight*pressure*(.75+.25*abs(dy/length))*(1+.025*math.sin(j*.8)+.012*math.sin(j*2.4))
    nx=-dy/length*radius;ny=dx/length*radius
    for collection,sign in [(left,1),(right,-1)]:
     px=(x+sign*nx+y*.09)*91;py=(y+sign*ny)*91;collection.append((px,py));minx=min(minx,px);maxx=max(maxx,px)
   poly=left+right[::-1];pen.moveTo(poly[0]);[pen.lineTo(p) for p in poly[1:]];pen.closePath()
  if len(decomp)>1:
   top=5.6 if char.islower() else 7.9
   a,b=[(1.6,top),(2.6,top+.7)] if decomp[1]=='\u0301' else [(1.6,top+.7),(2.6,top)]
   pen.moveTo((a[0]*91,a[1]*91));pen.lineTo((b[0]*91,b[1]*91));pen.lineTo((b[0]*91+40,b[1]*91));pen.lineTo((a[0]*91+32,a[1]*91));pen.closePath()
  glyph=pen.glyph()
  if glyph.numberOfContours:glyph.coordinates.translate((int(35-minx),0))
  glyphs[key]=glyph;metrics[key]=(int(maxx-minx+85) if char!=' ' else 245,35)
 fb=FontBuilder(1000,isTTF=True);fb.setupGlyphOrder(order);fb.setupCharacterMap(cmap);fb.setupGlyf(glyphs);fb.setupHorizontalMetrics(metrics);fb.setupHorizontalHeader(ascent=930,descent=-260)
 fb.setupNameTable({'familyName':name,'styleName':'Regular','uniqueFontIdentifier':name+' 2.0','fullName':name,'psName':name.replace(' ',''),'version':'Version 2.0','copyright':'Original glyph artwork — Yokai Site Dev, 2026. MIT License.'})
 fb.setupOS2(sTypoAscender=930,sTypoDescender=-260,usWinAscent=1050,usWinDescent=300);fb.setupPost();fb.setupMaxp()
 pairs=[('A','V',-55),('A','W',-45),('T','o',-45),('T','a',-40),('Y','o',-50),('Y','a',-45),('V','a',-30),('L','T',-25)]
 addOpenTypeFeaturesFromString(fb.font,'feature kern {'+''.join(f'pos u{ord(a):04x} u{ord(b):04x} {v};' for a,b,v in pairs)+'} kern;')
 fb.font.flavor='woff';fb.save(ROOT/'public/fonts'/f'{name.lower().replace(" ","-")}.woff')
if __name__=='__main__':
 for name,weight in [('Yokai Fude',.64),('Yokai Fude Light',.43),('Yokai Fude Bold',.81)]:generate(name,weight)
