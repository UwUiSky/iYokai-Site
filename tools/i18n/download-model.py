import urllib.request,concurrent.futures,json,hashlib,argparse
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('--output-directory',required=True);args=parser.parse_args();p=Path(args.output_directory).resolve();p.mkdir(parents=True,exist_ok=True);repo='gn64/M2M100_418M_CTranslate2';rev='18e406c615ef2991fa74d53734bf66b0a6b10cb4'
def get(n):
 f=p/n
 if not f.exists():
  with urllib.request.urlopen(f'https://huggingface.co/{repo}/resolve/{rev}/{n}',timeout=60)as r,f.open('wb')as w:
   while b:=r.read(1024*1024):w.write(b)
 print(n,f.stat().st_size,flush=True);return {'file':n,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
with concurrent.futures.ThreadPoolExecutor(max_workers=4)as pool:files=list(pool.map(get,['config.json','shared_vocabulary.json','model.bin','sentencepiece.bpe.model','README.md']))
(p/'provenance.json').write_text(json.dumps({'repository':repo,'revision':rev,'files':files},indent=2))
