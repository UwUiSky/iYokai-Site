# Rigenera src/data/commands.json dal COMMAND_LIST.md del bot: python3 tools/gen-commands.py percorso/COMMAND_LIST.md
import json, re, sys
s = open(sys.argv[1], encoding='utf-8').read()
gen = re.search(r'il (\d{4}-\d{2}-\d{2})', s)
cats = []
for sec in re.split(r'\n## ', s)[1:]:
    name, body = sec.split('\n', 1)
    cmds = [[m.group(1), m.group(2).strip()] for m in re.finditer(r'^- \*\*`(/[^`]+)`\*\*\s*[—-]\s*(.*)$', body, re.M)]
    cats.append({'name': name.strip(), 'commands': cmds})
out = {'generated': gen.group(1) if gen else '', 'total': sum(len(c['commands']) for c in cats), 'categories': cats}
json.dump(out, open('src/data/commands.json', 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
print(out['total'], 'comandi in', len(cats), 'categorie')
