"""Local draft translation, no runtime service. Requires ctranslate2/sentencepiece.
Use --model-directory with the pinned M2M100 CT2 model. Source is English.
"""
import argparse,json,re,time
from pathlib import Path
import ctranslate2,sentencepiece as sp
parser=argparse.ArgumentParser();parser.add_argument('--model-directory',required=True);a=parser.parse_args();P=Path(a.model_directory).resolve();R=Path(__file__).resolve().parents[2];en=json.loads((R/'src/i18n/en.json').read_text());targets={'de':'de','fr':'fr','es-ES':'es','ru':'ru','uk':'uk','ja':'ja','ko':'ko','zh-CN':'zh'}
s=sp.SentencePieceProcessor(model_file=str(P/'sentencepiece.bpe.model'));model=ctranslate2.Translator(str(P),device='cpu',compute_type='int8',inter_threads=2,intra_threads=4)
protect=re.compile(r'\{\w+\}|The Oni of Jah|iYokaiミ|iYokai|Discord|YouTube|Spotify|Twitch|Kick|Instagram|TikTok|Steam|GitHub|AutoMod|JavaScript|WebGPU|WebGL 2|Three\.js|Python|AIDA|HMAC|CSRF|API|VIP(?:\s*\d+)?|Premium|ミ')
cachepath=P/'cache.json';cache=json.loads(cachepath.read_text())if cachepath.exists()else{};errors=[]
def shield(t):
 es=[]
 def sub(m):es.append(m.group());return f'ZXQ{len(es)-1}'
 return protect.sub(sub,t),es
def restore(t,es):
 t=t.replace('ЗXQ','ZXQ')
 for i,e in enumerate(es):
  pat=rf'Z\s*X\s*Q\s*{i}(?!\d)'
  if not re.search(pat,t,re.I):raise ValueError(('missing_marker',i,t))
  t=re.sub(pat,lambda _:e,t,flags=re.I)
 if 'ZXQ' in t:raise ValueError(('marker',t))
 return t
for locale,target in targets.items():
 start=time.time();out={};pending=[]
 for k,text in en.items():
  ck=locale+'\0'+text
  if ck in cache:out[k]=cache[ck];continue
  body,es=shield(text)
  if not re.search('[A-Za-z]{2}',protect.sub('',text)):out[k]=text;cache[ck]=text;continue
  pending.append((k,text,body,es))
 for startindex in range(0,len(pending),32):
  group=pending[startindex:startindex+32];source=[['__en__']+s.encode(x[2],out_type=str)+['</s>']for x in group]
  rs=model.translate_batch(source,target_prefix=[[f'__{target}__']]*len(source),max_batch_size=16,beam_size=3,max_decoding_length=256,no_repeat_ngram_size=4)
  for (key,text,body,es),r in zip(group,rs):
   raw=s.decode([x for x in r.hypotheses[0]if not(x.startswith('__')or x=='</s>')])
   try:
    t=restore(raw,es);assert sorted(re.findall(r'\{\w+\}',t))==sorted(re.findall(r'\{\w+\}',text));out[key]=t;cache[locale+'\0'+text]=t
   except Exception as e:errors.append({'locale':locale,'key':key,'source':text,'raw':raw,'entities':es,'error':str(e)})
  cachepath.write_text(json.dumps(cache,ensure_ascii=False));(P/'errors.json').write_text(json.dumps(errors,ensure_ascii=False,indent=2));print(locale,startindex+len(group),'/',len(pending),flush=True)
 # The finalizer applies the editorial overrides, validates parity and creates legal JSON.
 (R/f'src/i18n/{locale}.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(locale,'SAVED',len(out),'seconds',round(time.time()-start,1),flush=True)
print('ERRORS',len(errors),flush=True)
