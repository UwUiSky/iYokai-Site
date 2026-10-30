"""Independent shaping and outline regression checks for revision 11."""
from pathlib import Path
from tempfile import TemporaryDirectory
from itertools import product
import json,csv,unicodedata as U
from PIL import Image,ImageDraw,ImageFont,ImageChops
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[2];ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';PUNCT="'’‘\"“”";results=[]
for variant in ['normal','extreme']:
    f=TTFont(ROOT/f'public/fonts/yokai/yokai-{variant}-r11.woff');old=TTFont(ROOT/f'docs/font-proposals/spacing-source/yokai-{variant}-r09.woff');cm=f.getBestCmap()
    assert all(cm[cp]==name for cp,name in old.getBestCmap().items())
    checked=0
    for n in set(cm.values())|{'ligLe','ligIl'}:
        if n not in f['glyf']:continue
        if n not in old['glyf']:continue
        a=f['glyf'][n];b=old['glyf'][n]
        if a.numberOfContours<=0 or n in ('u0027','u2018','u2019','u0022','u201C','u201D'):continue
        assert a.numberOfContours==b.numberOfContours and list(a.endPtsOfContours)==list(b.endPtsOfContours)
        diffs={(x1-x0,y1-y0) for (x1,y1),(x0,y0) in zip(a.coordinates,b.coordinates)}
        assert len(diffs)==1 and next(iter(diffs))[1]==0,(variant,n,diffs)
        checked+=1
    assert f['GSUB'].compile(f)==old['GSUB'].compile(old),'ligatures changed'
    with TemporaryDirectory() as tmp:
        p=Path(tmp)/'font.ttf';f.flavor=None;f.save(p);font=ImageFont.truetype(str(p),1000)
        kern={(r['left'],r['right']):int(r['kern']) for r in csv.DictReader((ROOT/f'docs/font-proposals/spacing-r11-{variant}-pairs.csv').open())}
        def expected_advance(text):
            tokens=[];i=0
            while i<len(text):
                if variant=='extreme' and text[i:i+2] in ('Le','Il'):
                    tokens.append(text[i:i+2]);i+=2
                else:tokens.append(text[i]);i+=1
            return sum(f['hmtx']['lig'+t if len(t)==2 else cm[ord(t)]][0] for t in tokens)+sum(kern.get((a,b),0) for a,b in zip(tokens,tokens[1:]))
        pairs=0
        for a,b in product(ABC+PUNCT,repeat=2):
            text=a+b
            expected=expected_advance(text)
            assert abs(font.getlength(text)-expected)<1,(variant,text,font.getlength(text),expected)
            pairs+=1
        triplets=0
        for chars in product(ABC,repeat=3):
            text=''.join(chars);expected=expected_advance(text)
            assert abs(font.getlength(text)-expected)<1,(variant,text,font.getlength(text),expected)
            triplets+=1
        eq=[]
        for text in ['é','ü','ắ','ộ','ǿ','ĩ','ḍ','ấ','ễ','ț','İ']:
            ims=[]
            for t in [text,U.normalize('NFD',text)]:
                im=Image.new('L',(800,600));ImageDraw.Draw(im).text((100,350),t,font=ImageFont.truetype(str(p),120),anchor='ls',fill=255);ims.append(im)
            assert ImageChops.difference(*ims).getbbox() is None,(variant,text)
            eq.append(text)
    results.append({'variant':variant,'unchanged_outline_shapes':checked,'actual_shaped_letter_and_quote_pairs':pairs,'actual_shaped_ASCII_triplets':triplets,'canonical_equivalence':eq,'ligature_binary_unchanged':True})
path=ROOT/'docs/font-proposals/spacing-r11-verification.json';path.write_text(json.dumps(results,ensure_ascii=False,indent=2));print(json.dumps(results,ensure_ascii=False))
