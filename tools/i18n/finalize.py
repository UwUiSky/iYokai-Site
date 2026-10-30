"""Apply editorial overrides and validate complete local dictionaries."""
from pathlib import Path
import json,re
R=Path(__file__).resolve().parents[2];en=json.loads((R/'src/i18n/en.json').read_text());overrides=json.loads((R/'tools/i18n/overrides.json').read_text());output=R/'public/legal-locales';output.mkdir(exist_ok=True);report=[]
gloss={'de':{'Mäßigung':'Moderation','Mässigung':'Moderation'},'ru':{'Умеренность':'Модерация','умеренность':'модерация'},'uk':{'Помірність':'Модерація','помірність':'модерація'},'ja':{'適度':'モデレーション','節度':'モデレーション'},'ko':{'절제':'관리'},'zh-CN':{'适度':'管理','适量':'管理'}}
for f in sorted((R/'src/i18n').glob('*.json')):
 code=f.stem;d=json.loads(f.read_text())
 for k,source in en.items():
  value=d.get(k,'')
  if 'moderat' in source.lower():
   for bad,good in gloss.get(code,{}).items():value=value.replace(bad,good)
  if 'bot' in source.lower():
   for c,bad,good in [('zh-CN','博特','机器人'),('ja','ボート','ボット'),('ko','보트','봇')]:
    if code==c:value=value.replace(bad,good)
  if k in d:d[k]=value
 d.update(overrides.get(code,{}));missing=set(en)-set(d);extra=set(d)-set(en)
 assert not missing and not extra,(code,'missing',sorted(missing),'extra',sorted(extra))
 for k,v in en.items():
  assert isinstance(d[k],str) and d[k].strip(),(code,k,'empty')
  assert sorted(re.findall(r'\{\w+\}',v))==sorted(re.findall(r'\{\w+\}',d[k])),(code,k,'placeholder')
  if k.startswith('copy.'):assert not re.search(r'<\s*(script|iframe|img|svg)\b',d[k],re.I)
 f.write_text(json.dumps({k:d[k] for k in en},ensure_ascii=False,indent=2)+'\n');(output/f.name).write_text(json.dumps({k:v for k,v in d.items()if k.startswith('legal.')},ensure_ascii=False,indent=2)+'\n')
 report.append({'locale':code,'keys':len(d),'missing':0,'placeholders':'passed','review':'IT/EN authored; other locales are offline machine drafts with editorial overrides, native review pending'})
(R/'docs/LOCALIZATION_COVERAGE.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print(report)
