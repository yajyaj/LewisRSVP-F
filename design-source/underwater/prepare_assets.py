"""Export generated PNG masters without resizing or altering their composition."""
import hashlib
import json
from pathlib import Path
import sys
import tempfile

sys.path.insert(0, str(Path(tempfile.gettempdir()) / 'rsvp-image-tools'))
from PIL import Image

source_dir = Path(__file__).resolve().parent
frontend = source_dir.parents[1]
output_dir = frontend / 'src/assets/images/underwater'
output_dir.mkdir(parents=True, exist_ok=True)
records = []
for source in sorted(source_dir.glob('*.png')):
    target = output_dir / (source.stem + '.webp')
    with Image.open(source) as original:
        image = original.convert('RGBA')
        alpha_range = image.getchannel('A').getextrema()
        transparent = alpha_range[0] < 255
        if source.stem.startswith('ocean-backdrop-'):
            assert not transparent, f'Unexpected transparent backdrop: {source.name}'
            image = image.convert('RGB')
        else:
            assert transparent, f'Missing alpha: {source.name}'
        image.save(target, format='WEBP', quality=88, method=6, alpha_quality=100, exact=True)
        with Image.open(target) as exported:
            assert exported.size == original.size
            if transparent:
                assert exported.convert('RGBA').getchannel('A').tobytes() == image.getchannel('A').tobytes()
        records.append({
            'file': target.relative_to(frontend).as_posix(),
            'source': source.relative_to(frontend).as_posix(),
            'width': original.width, 'height': original.height,
            'transparent': transparent, 'alpha_range': alpha_range,
            'bytes': target.stat().st_size, 'source_bytes': source.stat().st_size,
            'sha256': hashlib.sha256(target.read_bytes()).hexdigest(),
            'source_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
            'status': 'exported; reviewed individually; awaiting approval in layout',
        })
assert len(records) == 10, f'Expected exactly 10 images; found {len(records)}'
(source_dir / 'asset-manifest.json').write_text(json.dumps(records, indent=2) + '\n', encoding='utf-8')
print(json.dumps(records, indent=2))
