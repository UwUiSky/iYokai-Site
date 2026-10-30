from PIL import Image,ImageFont,ImageDraw,ImageChops
from fontTools.ttLib import TTFont
from pathlib import Path
import csv,json,os
from tempfile import TemporaryDirectory
ROOT=Path(__file__).resolve().parents[2]
os.chdir(ROOT)
out=[]
for v in ['normal','extreme']:
 f=TTFont(f'public/fonts/yokai/yokai-{v}-r11.woff');f.flavor=None;tmp=TemporaryDirectory();p=Path(tmp.name)/'font.ttf';f.save(p);font=ImageFont.truetype(str(p),160);cm=f.getBestCmap();abc='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'+"'’‘\"“”";masks={}
 for c in abc:
  im=Image.new('L',(600,260));ImageDraw.Draw(im).text((100,260),c,font=font,anchor='ls',fill=255);masks[c]=im
 kern={(r['left'],r['right']):int(r['kern']) for r in csv.DictReader(open(f'docs/font-proposals/spacing-r11-{v}-pairs.csv'))};fails=[];count=0
 for a in abc:
  for b in abc:
   if v=='extreme' and a+b in ('Le','Il'):continue
   shift=round((f['hmtx'][cm[ord(a)]][0]+kern.get((a,b),0))*.16)
   rhs=Image.new('L',(600,260));rhs.paste(masks[b],(shift,0))
   if ImageChops.multiply(masks[a],rhs).getbbox():fails.append(a+b)
   count+=1
 tmp.cleanup()
 out.append({'variant':v,'raster_pair_tests':count,'size_px':160,'overlaps_above_baseline':fails})
assert all(not r['overlaps_above_baseline'] for r in out),out
Path('docs/font-proposals/spacing-r11-raster.json').write_text(json.dumps(out,indent=2));print(out)
