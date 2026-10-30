"""Rebuild advances from the central brush body, never from decorative swashes.
Requires fontTools. Original r09 outlines are preserved, translated only in x.
The 450-unit x-height is unchanged. An italic body box uses x - 0.45*y;
20/80 percentiles reject tapered tips. Each box has 32/33-unit sidebearings before pair-specific kerning.
Each pair is then scanned at 2-unit intervals, with a 24-unit ink gap floor.
This is a measurable spacing convention, not a claim of universal optical perfection.
"""
from pathlib import Path
from copy import deepcopy
import json, math, csv, unicodedata as U
from tempfile import TemporaryDirectory
from PIL import Image,ImageDraw,ImageFont,ImageChops
from fontTools.ttLib import TTFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
ROOT=Path(__file__).resolve().parents[2]
ABC='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
PUNCT="'’‘\"“”"
GAP=65
class Outline(BasePen):
    def __init__(self,gs): super().__init__(gs); self.paths=[]; self.path=[]
    def _moveTo(self,p): self.path=[p]
    def _lineTo(self,p): self.path.append(p)
    def _qCurveToOne(self,c,p):
        a=self._getCurrentPoint()
        for i in range(1,25):
            t=i/24; self.path.append(tuple((1-t)**2*a[k]+2*(1-t)*t*c[k]+t*t*p[k] for k in (0,1)))
    def _curveToOne(self,c,d,p):
        a=self._getCurrentPoint()
        for i in range(1,33):
            t=i/32;self.path.append(tuple((1-t)**3*a[k]+3*(1-t)**2*t*c[k]+3*(1-t)*t*t*d[k]+t**3*p[k] for k in (0,1)))
    def _closePath(self): self.paths.append(self.path);self.path=[]
    def _endPath(self): self._closePath()
def quantile(xs,p):
    xs=sorted(xs);i=(len(xs)-1)*p;lo=math.floor(i);hi=math.ceil(i)
    return xs[lo]+(xs[hi]-xs[lo])*(i-lo)
def edges(f,n):
    pen=Outline(f.getGlyphSet()); f.getGlyphSet()[n].draw(pen); ls=[];rs=[]
    for y in range(50,421,4):
        xx=[]
        for pts in pen.paths:
            for a,b in zip(pts,pts[1:]+pts[:1]):
                if min(a[1],b[1])<=y<max(a[1],b[1]):xx.append(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))
        if xx:ls.append(min(xx)-.45*y);rs.append(max(xx)-.45*y)
    g=f['glyf'][n]
    return (round(quantile(ls,.20)),round(quantile(rs,.80))) if ls else (g.xMin,g.xMax)
def rows(f,n):
    pen=Outline(f.getGlyphSet());f.getGlyphSet()[n].draw(pen);out={}
    for y in range(0,801,2):
        xx=[]
        for pts in pen.paths:
            for a,b in zip(pts,pts[1:]+pts[:1]):
                if min(a[1],b[1])<=y<max(a[1],b[1]):xx.append(a[0]+(y-a[1])*(b[0]-a[0])/(b[1]-a[1]))
        if xx:out[y]=(min(xx),max(xx))
    return out
for variant in ['normal','extreme']:
    f=TTFont(ROOT/f'docs/font-proposals/spacing-source/yokai-{variant}-r09.woff');f.flavor=None
    cm=f.getBestCmap()
    order=f.getGlyphOrder()
    for cp in (0x27,0x2018,0x2019,0x22,0x201C,0x201D):
        pen=TTGlyphPen(None);double=cp in (0x22,0x201C,0x201D);opening=cp in (0x2018,0x201C)
        for off in ([0,100] if double else [0]):
            pts=[(28+off,675),(87+off,650),(70+off,565),(30+off,495),(12+off,505),(40+off,583)]
            if opening:pts=[(100+2*off-x,y) for x,y in pts]
            pen.moveTo(pts[0])
            for point in pts[1:]:pen.lineTo(point)
            pen.closePath()
        name=f'u{cp:04X}'
        if name not in order:order.append(name)
        g=pen.glyph();g.recalcBounds(f['glyf']);f['glyf'][name]=g;f['hmtx'][name]=(235 if double else 135,g.xMin);cm[cp]=name
    f.setGlyphOrder(order)
    for table in f['cmap'].tables:
        if table.isUnicode() and table.format in (4,12):table.cmap=cm.copy()
    bases={c:edges(f,cm[ord(c)]) for c in ABC}; shifts={};body={};metrics=f['hmtx'];glyf=f['glyf']
    for cp,n in cm.items():
        ch=chr(cp);base=U.normalize('NFD',ch)[0]
        if 'LATIN' not in U.name(ch,'') or not ch.isalpha():continue
        # All canonical accents inherit the body's box, not the accent's width.
        l,r=bases[base] if base in bases else edges(f,n)
        shifts[n]=32-l; body[n]=(l,r);metrics[n]=(r-l+GAP,metrics[n][1])
    for n in ['ligLe','ligIl']:
        if n in f.getGlyphOrder():
            l,r=edges(f,n);shifts[n]=32-l;body[n]=(l,r);metrics[n]=(r-l+GAP,metrics[n][1])
    original=deepcopy(glyf)
    for n,dx in shifts.items():
        pen=TTGlyphPen(None);original[n].draw(TransformPen(pen,(1,0,0,1,dx,0)),original);g=pen.glyph();g.recalcBounds(glyf);glyf[n]=g;metrics[n]=(metrics[n][0],g.xMin)
    # Keep GSUB (including Le/Il) and mark attachment. Remove only old kerning.
    old=deepcopy(f['GPOS']);gsub=deepcopy(f['GSUB']);gdef=deepcopy(f['GDEF'])
    for lookup in old.table.LookupList.Lookup:
        if lookup.LookupType==4:
            for sub in lookup.SubTable:
                for n,rec in zip(sub.BaseCoverage.glyphs,sub.BaseArray.BaseRecord):
                    for anchor in rec.BaseAnchor:
                        if anchor:anchor.XCoordinate+=shifts.get(n,0)
    rules=[]; pairdata=[];kern={}
    classes={c:[] for c in ABC}
    for cp,n in cm.items():
        base=U.normalize('NFD',chr(cp))[0]
        if base in classes and chr(cp).isalpha():classes[base].append(n)
    for c in PUNCT:classes[c]=[cm[ord(c)]]
    classrules=[f'@B{ord(c)} = ['+' '.join(sorted(set(ns)))+'];' for c,ns in classes.items()]
    names=[cm[ord(c)] for c in ABC+PUNCT]+(['ligLe','ligIl'] if variant=='extreme' else [])
    profiles={n:rows(f,n) for n in names}
    labels={cm[ord(c)]:c for c in ABC+PUNCT}|{'ligLe':'Le','ligIl':'Il'}
    # Independent raster condition for every pair, including tapered sub-row tips.
    # Individual glyphs are rendered before assembling kerning; no old pair adjustment applies.
    raster=[]
    with TemporaryDirectory() as tmp:
        path=Path(tmp)/'individuals.ttf';f.save(path)
        for size in (32,80,160):
            face=ImageFont.truetype(str(path),size);masks={}
            for n in names:
                im=Image.new('L',(600,260));ImageDraw.Draw(im).text((100,260),labels[n],font=face,anchor='ls',fill=255);masks[n]=im
            raster.append((size,masks))
    def raster_overlap(an,bn,k):
        for size,masks in raster:
            rhs=Image.new('L',(600,260));rhs.paste(masks[bn],(round((metrics[an][0]+k)*size/1000),0))
            if ImageChops.multiply(masks[an],rhs).getbbox():return True
        return False
    for an in names:
        for bn in names:
            shared=sorted(set(profiles[an])&set(profiles[bn]))
            if not shared:continue
            ds=[metrics[an][0]+profiles[bn][y][0]-profiles[an][y][1] for y in shared]
            core=[d for y,d in zip(shared,ds) if 30<=y<=420] or ds
            # Pair-specific optical target, with a hard non-intersection floor.
            # The intended under-baseline L sweep is outside this collision band.
            minimum=48 if len(labels[an])==1 and labels[an].isupper() and len(labels[bn])==1 and labels[bn].islower() else 32
            k=max(math.ceil(minimum-min(ds)),round(56-quantile(core,.20)))
            a,b=labels[an],labels[bn]
            if not(variant=='extreme' and a+b in ('Le','Il')):
                tries=0
                while raster_overlap(an,bn,k):
                    k+=8;tries+=1
                    if tries>80:raise AssertionError(('raster spacing did not converge',variant,a,b))
            kern[a,b]=k
            left=f'@B{ord(a)}' if len(a)==1 else an
            right=f'@B{ord(b)}' if len(b)==1 else bn
            if k:rules.append(f'pos {left} {right} {k};')
            assert min(ds)+k>=minimum
            pairdata.append({'left':a,'right':b,'kern':k,'minimum_gap':round(min(ds)+k,3),'core_20_percentile':round(quantile(core,.20)+k,3)})
    with (ROOT/f'docs/font-proposals/spacing-r11-{variant}-pairs.csv').open('w') as fh:
        writer=csv.DictWriter(fh,fieldnames=pairdata[0].keys());writer.writeheader();writer.writerows(pairdata)
    for cp,n in cm.items():
        if n not in shifts:continue
        g=glyf[n]; l,r=body[n]
        # Punctuation follows the baseline body, not the trailing brush extension.
        edge=r+shifts[n]
        for c,gap in [('.',38),(',',42)]:
            pn=cm[ord(c)];k=round(edge+gap-metrics[n][0]-glyf[pn].xMin)
            rules.append(f'pos {n} {pn} {k};')
    addOpenTypeFeaturesFromString(f,'\n'.join(classrules)+'feature kern {'+''.join(rules)+'} kern;')
    new=f['GPOS']; oldrecs=old.table.FeatureList.FeatureRecord
    # Non-kern lookup indices are retained; dormant old kern lookups are removed.
    used=sorted({i for rec in oldrecs if rec.FeatureTag!='kern' for i in rec.Feature.LookupListIndex})
    lookupmap={v:i for i,v in enumerate(used)};lookups=[old.table.LookupList.Lookup[i] for i in used]
    recs=[]
    for rec in oldrecs:
        if rec.FeatureTag!='kern':
            rec.Feature.LookupListIndex=[lookupmap[i] for i in rec.Feature.LookupListIndex];recs.append(rec)
    off=len(lookups)
    for rec in new.table.FeatureList.FeatureRecord:
        rec.Feature.LookupListIndex=[i+off for i in rec.Feature.LookupListIndex];recs.append(rec)
    lookups+=new.table.LookupList.Lookup;recs.sort(key=lambda r:r.FeatureTag)
    old.table.LookupList.Lookup=lookups;old.table.LookupList.LookupCount=len(lookups)
    old.table.FeatureList.FeatureRecord=recs;old.table.FeatureList.FeatureCount=len(recs)
    for s in old.table.ScriptList.ScriptRecord:
        for lang in [s.Script.DefaultLangSys]+[l.LangSys for l in s.Script.LangSysRecord]:
            if lang:lang.FeatureIndex=list(range(len(recs)));lang.FeatureCount=len(recs)
    f['GPOS']=old;f['GSUB']=gsub;f['GDEF']=gdef
    f['name'].setName('Yokai',9,3,1,1033)
    f['name'].setName('MIT License — original Yokai font outlines and tooling. Noto support faces are separately licensed.',13,3,1,1033)
    f['name'].setName('Version 0.11 — central body spacing',5,3,1,1033)
    dest=ROOT/'public/fonts/yokai'/f'yokai-{variant}-r11.woff';f.flavor='woff';f.save(dest)
    # Exhaustive body-box pair and triplet advances, including precomposed accents.
    letters=sorted(set(cm[cp] for cp in cm if cm[cp] in body and 'LATIN' in U.name(chr(cp),'')))
    assert all(metrics[n][0]-(body[n][1]+shifts[n])==33 for n in letters)
    assert all(body[n][0]+shifts[n]==32 for n in letters)
    triplets=0
    for a in ABC:
        for b in ABC:
            for c in ABC:
                ns=[cm[ord(x)] for x in (a,b,c)]
                for left,right in zip(ns,ns[1:]):
                    assert metrics[left][0]+body[right][0]+shifts[right]-(body[left][1]+shifts[left])==GAP
                triplets+=1
    report={'variant':variant,'body_gap_units':GAP,'body_band':[50,420],'slant':.45,'percentiles':[20,80],'latin_glyphs':len(letters),'body_box_pairs_checked':len(letters)**2,'ASCII_triplets_checked':triplets,'pair_contour_checks':len(pairdata),'minimum_contour_gap_units':32,'uppercase_lowercase_gap_units':48,'pair_specific_kerning':True,'outline_changes':'horizontal translations only','GSUB_features':[r.FeatureTag for r in f['GSUB'].table.FeatureList.FeatureRecord],'boxes':{chr(cp):{'left':body[n][0]+shifts[n],'right':body[n][1]+shifts[n],'advance':metrics[n][0]} for cp,n in cm.items() if n in body}}
    (ROOT/f'docs/font-proposals/spacing-r11-{variant}.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(variant,'pair boxes',len(letters)**2,'triplets',52**3,'WOFF',dest.stat().st_size)
