"""Build the website catalogue from the bot's generated COMMAND_LIST.md snapshot.
No network calls. Pin the source blob SHA from the repository response.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path


def parse_catalog(source, source_sha):
    if not re.fullmatch(r'[0-9a-f]{40}', source_sha):
        raise ValueError('A full source blob SHA is required')
    content=source.encode('utf-8')
    digest=hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest()
    if digest != source_sha:
        raise ValueError('Source content does not match the supplied Git blob SHA')
    date = re.search(r'il (\d{4}-\d{2}-\d{2})(?: (\d{2}:\d{2}) UTC)?', source)
    declared = re.search(r'Totale:\s*(\d+) comandi in (\d+) categorie', source)
    if not date or not declared:
        raise ValueError('Missing source generation date or declared totals')
    categories, names, groups = [], set(), set()
    for section in re.split(r'\n## ', source)[1:]:
        name, body = section.split('\n', 1)
        name = name.strip()
        if name in groups:
            raise ValueError('Duplicate category: ' + name)
        groups.add(name)
        commands = []
        for command, description in re.findall(r'^- \*\*`(/[^`]+)`\*\*\s*[—-]\s*(.*)$', body, re.M):
            if command in names:
                raise ValueError('Duplicate command: ' + command)
            if not description.strip():
                raise ValueError('Missing description: ' + command)
            names.add(command)
            row = [command, description.strip()]
            if description.startswith('Menu «App»'):
                row.append({'kind': 'context'})
            commands.append(row)
        if not commands:
            raise ValueError('Empty category: ' + name)
        categories.append({'name': name, 'commands': commands})
    if (len(names), len(categories)) != tuple(map(int, declared.groups())):
        raise ValueError('Parsed catalogue does not match declared source totals')
    return {'generated': date[1], 'generated_at': date[0][3:], 'total': len(names),
            'source': {'repository': 'UwUiSky/iYokai-DS-BOT', 'path': 'COMMAND_LIST.md', 'blob_sha': source_sha},
            'categories': categories}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source', type=Path)
    parser.add_argument('--source-sha', required=True)
    parser.add_argument('--output', type=Path, default=Path('src/data/commands.json'))
    args = parser.parse_args()
    result = parse_catalog(args.source.read_text(encoding='utf-8'), args.source_sha)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"{result['total']} commands / {len(result['categories'])} categories / {result['source']['blob_sha']}")
