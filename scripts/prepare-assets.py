"""Prepare owner-supplied assets without changing screens or aspect ratios."""
from pathlib import Path
from PIL import Image, ImageOps
import shutil
import json

ROOT = Path(__file__).resolve().parents[1]
OLD = Path(r'D:\Importante\Codex\LP Gabriel Kaminise\kaminise\src\assets')
OUT = ROOT / 'public/images/projects'
BRAND = ROOT / 'public/images/brand'
MASTERS = ROOT / 'assets/originals'
for folder in [OUT, BRAND, MASTERS / 'mockups', MASTERS / 'brand', MASTERS / 'screenshots']:
    folder.mkdir(parents=True, exist_ok=True)
manifest = {}

def export(source, name, sizes=(640, 1000, 1600), original_folder='screenshots'):
    master = MASTERS / original_folder / source.name
    if source.resolve() != master.resolve():
        shutil.copy2(source, master)
    im = ImageOps.exif_transpose(Image.open(source)).convert('RGB')
    widths = sorted(set([min(w, im.width) for w in sizes]))
    variants = []
    for w in widths:
        h = round(im.height * w / im.width)
        target = OUT / f'{name}-{w}.webp'
        im.resize((w, h), Image.Resampling.LANCZOS).save(target, 'WEBP', quality=88, method=6)
        variants.append({'file': target.name, 'width': w, 'height': h, 'bytes': target.stat().st_size})
    manifest[name] = {'width': im.width, 'height': im.height, 'source': f'assets/originals/{original_folder}/{source.name}', 'variants': variants}

mockup_source = MASTERS / 'mockups' if list((MASTERS / 'mockups').glob('*.png')) else ROOT / 'work/kit/assets/mockups'
for source in mockup_source.glob('*.png'):
    export(source, source.stem.removesuffix('-mockup'), sizes=(320, 480, 640, 1000, 1600), original_folder='mockups')

screens = {
    'alcar-huma': ('portfolio-1.png', 'case-01.png'),
    'odontologia-fl': ('portfolio-4.png', 'case-02.png'),
    'acquagyn': ('portfolio-5.png', 'case-05.png'),
    'leandro-kaminise': ('portfolio-2.png', 'case-03.png'),
    'clube-das-zizas': ('case-04.png', 'case-04.png'),
    'saldanha-moveis': ('portfolio-7.png', 'case-06.png'),
    'ecos-da-alma': ('portfolio-3.png', 'case-07.png'),
    'salon-2-beaute': ('portfolio-salon.jpg', None),
    'brasa': ('portfolio-brasa.jpg', None),
}
for name, (screen, full) in screens.items():
    source = MASTERS / 'screenshots' / screen
    if not source.exists():
        source = OLD / screen
    if name == 'clube-das-zizas':
        captured = MASTERS / 'screenshots/clube-das-zizas-screen.png'
        if not captured.exists():
            captured = ROOT / 'work/clube-das-zizas-screen.png'
        if captured.exists():
            source = captured
    export(source, name + '-screen')
    if name not in ['alcar-huma', 'odontologia-fl', 'acquagyn', 'salon-2-beaute', 'brasa']:
        export(source, name, sizes=(320, 480, 640, 1000, 1600))
    if full:
        source = MASTERS / 'screenshots' / full
        if not source.exists():
            source = OLD / full
        im = Image.open(source).convert('RGB')
        master = MASTERS / 'screenshots' / source.name
        if source.resolve() != master.resolve():
            shutil.copy2(source, master)
        target = OUT / f'full-{name}.webp'
        im.save(target, 'WEBP', quality=90, method=6)
        manifest['full-' + name] = {'width': im.width, 'height': im.height, 'file': target.name, 'bytes': target.stat().st_size}

for source_name, name in [('bkm-tcg-screen.png', 'bkm-tcg'), ('bkm-tcg-reveal.png', 'bkm-tcg-reveal')]:
    source = MASTERS / 'screenshots' / source_name
    if not source.exists():
        source = ROOT / 'work' / source_name
    if source.exists():
        export(source, name, sizes=(320, 480, 640, 1000, 1440) if name == 'bkm-tcg' else (640, 1000, 1440))

logos = MASTERS / 'brand' if (MASTERS / 'brand/12_KMZ_Studio_Horizontal_Transparente_1920x600.png').exists() else ROOT / 'work/logos'
for source in logos.iterdir():
    if source.is_file():
        master = MASTERS / 'brand' / source.name
        if source.resolve() != master.resolve():
            shutil.copy2(source, master)
for name, source_name, maxwidth in [
    ('logo-horizontal', '12_KMZ_Studio_Horizontal_Transparente_1920x600.png', 480),
    ('symbol', '13_KMZ_Studio_Simbolo_Transparente_1024x1024.png', 600),
]:
    im = Image.open(logos / source_name).convert('RGBA')
    im = im.crop(im.getchannel('A').getbbox())
    original_size = im.size
    im.thumbnail((maxwidth, maxwidth), Image.Resampling.LANCZOS)
    target = BRAND / f'{name}.webp'
    if name == 'logo-horizontal':
        im.save(target, 'WEBP', quality=90, method=6)
    else:
        im.save(target, 'WEBP', lossless=True, method=6)
    manifest[name] = {'width': im.width, 'height': im.height, 'croppedMaster': original_size, 'file': str(target.relative_to(ROOT / 'public'))}
shutil.copy2(logos / '14_KMZ_Studio_Favicon.ico', ROOT / 'public/favicon.ico')
shutil.copy2(logos / '07_KMZ_Studio_Favicon_256x256.png', ROOT / 'public/favicon.png')
Image.open(logos / '07_KMZ_Studio_Favicon_256x256.png').resize((180, 180), Image.Resampling.LANCZOS).save(ROOT / 'public/apple-touch-icon.png')

og = Image.new('RGB', (1200, 630), '#111418')
logo = Image.open(BRAND / 'logo-horizontal.webp').convert('RGBA')
logo.thumbnail((480, 92), Image.Resampling.LANCZOS)
og.paste(logo, ((1200 - logo.width)//2, 43), logo)
for x, name in zip([195, 475, 755], ['acquagyn', 'alcar-huma', 'brasa']):
    im = Image.open(mockup_source / f'{name}-mockup.png').convert('RGB')
    im.thumbnail((250, 400), Image.Resampling.LANCZOS)
    og.paste(im, (x, 208))
og.save(ROOT / 'public/og-image.png', optimize=True)
og.save(ROOT / 'public/og-image.webp', quality=88, method=6)
(ROOT / 'public/images/asset-manifest.json').write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')

titles = {'alcar-huma': 'Alçar Humà', 'odontologia-fl': 'Odontologia FL', 'acquagyn': 'Acquagyn', 'leandro-kaminise': 'Leandro Kaminise', 'clube-das-zizas': 'Clube das Zizas', 'saldanha-moveis': 'Saldanha Móveis', 'ecos-da-alma': 'Ecos da Alma', 'salon-2-beaute': 'Salon 2Beauté ADN', 'brasa': 'BRASA', 'bkm-tcg': 'BKM TCG'}
projects = {}
for name, title in titles.items():
    if name not in manifest:
        continue
    main = manifest[name]
    variant = main['variants'][-1]
    item = {'width': main['width'], 'height': main['height'], 'src': '/images/projects/' + variant['file'], 'srcSet': ', '.join('/images/projects/' + v['file'] + ' ' + str(v['width']) + 'w' for v in main['variants']), 'gallery': []}
    def gallery_image(key, alt):
        data = manifest[key]
        src = data.get('file') or data['variants'][-1]['file']
        return {'src': '/images/projects/' + src, 'width': data['width'], 'height': data['height'], 'alt': alt}
    item['gallery'].append(gallery_image(name, ('Mockup fornecido pelo proprietário — ' if name in ['alcar-huma', 'odontologia-fl', 'acquagyn', 'salon-2-beaute', 'brasa'] else 'Captura real — ') + title))
    if name + '-screen' in manifest and name in ['alcar-huma', 'odontologia-fl', 'acquagyn', 'salon-2-beaute', 'brasa']:
        item['gallery'].append(gallery_image(name + '-screen', 'Captura real da página inicial — ' + title))
    if 'full-' + name in manifest:
        item['gallery'].append(gallery_image('full-' + name, 'Captura real da página completa — ' + title))
    if name == 'bkm-tcg' and 'bkm-tcg-reveal' in manifest:
        item['gallery'].append(gallery_image('bkm-tcg-reveal', 'Outra etapa da animação real da loja BKM TCG'))
    projects[name] = item
(ROOT / 'src/data').mkdir(parents=True, exist_ok=True)
(ROOT / 'src/data/project-images.json').write_text(json.dumps(projects, indent=2, ensure_ascii=False), encoding='utf-8')
print(json.dumps(manifest, ensure_ascii=False, indent=2))
