import importlib.util
import hashlib
import json
import unittest
from pathlib import Path

root = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('generator', root / 'tools/gen-commands.py')
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
SHA = '77c0f05593a3d419ec7ab30d14485ef1bb96b6fe'
SOURCE = '''Generato il 2026-10-28 23:34 UTC
**Totale: 2 comandi in 1 categorie.**

## App
- **`/play`** — Play a track.
- **`/Profile`** — Menu «App» (tasto destro)
'''

def blob_sha(source):
    content=source.encode()
    return hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest()

class CatalogueGeneratorTests(unittest.TestCase):
    def test_signature_and_context_menu_are_preserved(self):
        data = generator.parse_catalog(SOURCE, blob_sha(SOURCE))
        self.assertEqual(data['total'], 2)
        self.assertEqual(data['categories'][0]['commands'][1], ['/Profile', 'Menu «App» (tasto destro)', {'kind':'context'}])
        self.assertEqual(data['generated_at'], '2026-10-28 23:34 UTC')

    def test_incomplete_or_duplicate_snapshots_are_rejected(self):
        for source in [SOURCE.replace('2 comandi', '3 comandi'), SOURCE.replace('/Profile', '/play'), SOURCE.replace('## App','## App\n\n## App')]:
            with self.assertRaises(ValueError):generator.parse_catalog(source, blob_sha(source))
        with self.assertRaises(ValueError):generator.parse_catalog(SOURCE, 'main')
        with self.assertRaises(ValueError):generator.parse_catalog(SOURCE, SHA)

    def test_saved_snapshot_reproduces_shipped_catalogue(self):
        actual = generator.parse_catalog((root/'docs/BOT_COMMAND_LIST.md').read_text(), SHA)
        self.assertEqual(actual, json.loads((root/'src/data/commands.json').read_text()))

if __name__ == '__main__':unittest.main()
