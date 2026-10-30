from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
import json,html
R=Path(__file__).resolve().parents[2]
for v in ('normal','extreme'):
 out=R/'fonts-src/yokai'/v;out.mkdir(parents=True,exist_ok=True);f=TTFont(R/f'public/fonts/yokai/yokai-{v}-r11.woff');f.flavor=None;f.save(out/f'yokai-{v}.ttf');f.saveXML(out/f'yokai-{v}.ttx');gs=f.getGlyphSet();cm=f.getBestCmap();metrics={};folder=out/'glyphs';folder.mkdir(exist_ok=True)
 for cp,n in cm.items():
  if not(chr(cp).isascii()and(chr(cp).isalnum()or chr(cp)in"'.,!?\""))and cp not in(0x30DF,0x2018,0x2019,0x201C,0x201D):continue
  g=f['glyf'][n];p=SVGPathPen(gs);gs[n].draw(p);x,y,xx,yy=g.xMin,g.yMin,g.xMax,g.yMax
  (folder/f'U+{cp:04X}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x-50} {-yy-50} {xx-x+100} {yy-y+100}"><title>{html.escape(chr(cp))}</title><path transform="scale(1,-1)" d="{p.getCommands()}"/></svg>\n');metrics[f'U+{cp:04X}']={'character':chr(cp),'glyph':n,'advance':f['hmtx'][n][0],'bounds':[x,y,xx,yy]}
 (out/'metrics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2));print(v,len(metrics))
