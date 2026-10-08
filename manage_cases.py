"""Generate and validate the public static case catalogue; no runtime fetch needed."""
from pathlib import Path
from html import escape, unescape
from html.parser import HTMLParser
import argparse
import json
import re

ROOT = Path(__file__).resolve().parent


class CaseFrame(HTMLParser):
    def __init__(self):
        super().__init__(); self.frames=[]; self.policies=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs)
        if tag=='iframe': self.frames.append(a)
        if tag=='meta' and a.get('http-equiv','').lower()=='content-security-policy': self.policies.append(a.get('content',''))


def validate_viewer(page, filename):
    parsed=CaseFrame(); parsed.feed(page)
    assert len(parsed.frames)==1, f'{filename}: expected one sandboxed model'
    f=parsed.frames[0]
    assert f.get('id')=='codex-visualization' and f.get('sandbox')=='allow-scripts', f'{filename}: preserve sandbox'
    assert len(parsed.policies)==1 and "connect-src blob: data:" in parsed.policies[0], f'{filename}: preserve CSP'
    for tag,file in [('style','model-expansion.css'),('script','model-expansion.js')]:
        expected=f'<{tag} id="model-expansion-v1">'+(ROOT/file).read_text()+f'</{tag}>'
        assert page.count(expected)==1, f'{filename}: run add_model_expansion.py'
    expected='<script id="model-frame-tools-v1">'+(ROOT/'model-frame-tools.js').read_text()+'</script>'
    assert f.get('data-srcdoc','').count(expected)==1, f'{filename}: model zoom and Escape hook missing'
    assert re.search(r'''addEventListener\(\s*['"]wheel['"]''', f.get('data-srcdoc','')), f'{filename}: implement canvas wheel zoom before registration'


def render(catalog):
    cards = []
    ids, pages = set(), set()
    for c in catalog['cases']:
        for key in ('id', 'page', 'title', 'summary', 'date', 'era', 'topics'):
            assert c.get(key), f'Missing {key}: {c}'
        assert c['id'] not in ids and c['page'] not in pages, 'Duplicate case'
        ids.add(c['id']); pages.add(c['page'])
        assert re.fullmatch(r'[a-z0-9-]+', c['id']), 'Invalid ID'
        assert re.fullmatch(r'[a-z0-9-]+\.html', c['page']), 'Invalid page'
        assert c['era'] in catalog['eras'], 'Unknown era'
        assert all(t in catalog['topics'] for t in c['topics']), 'Unknown topic'
        assert len(c['topics']) == len(set(c['topics'])), 'Duplicate topic'
        page = (ROOT/c['page']).read_text()
        validate_viewer(page, c['page'])
        image = re.search(r'<img\b[^>]*\bsrc="([^"]+)"[^>]*>', page)
        thumbnail = ('<img src="'+escape(unescape(image[1]), quote=True)+'" alt="" loading="lazy">') if image else '<div class="date" aria-hidden="true">시각화 실험</div>'
        attrs = f'data-case-id="{c["id"]}" data-era="{c["era"]}" data-topics="{" ".join(c["topics"])}"'
        cards.append(f'<a class="card" href="{c["page"]}" {attrs}>{thumbnail}<div><p class="date">{escape(c["date"])}</p><h2>{escape(c["title"])}</h2><p>{escape(c["summary"])}</p><span class="open">비교하고 조작하기 →</span></div></a>')
    return '<section class="cards" aria-labelledby="cases-title">'+''.join(cards)+'</section>'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--write', action='store_true')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    catalog = json.loads((ROOT/'cases.json').read_text())
    path = ROOT/'geometry-lab.html'
    text = path.read_text()
    block = render(catalog)
    pattern = r'<section class="cards" aria-labelledby="cases-title">.*?</section>'
    assert len(re.findall(pattern, text, re.S)) == 1, 'Expected one catalogue'
    count = f'{len(catalog["cases"])}개 개별 사례'
    if args.write:
        text = re.sub(pattern, lambda _: block, text, count=1, flags=re.S)
        text = re.sub(r'(<p id="case-count"[^>]*>).*?(</p>)', lambda m:m[1]+count+m[2], text, count=1)
        path.write_text(text)
    assert re.search(pattern, text, re.S)[0] == block, 'Run --write to sync catalogue'
    assert re.search(r'<p id="case-count"[^>]*>(.*?)</p>', text)[1] == count
    assert 'lacan-atlas.html' not in block, 'Reading guides are not cases'
    assert 'data-field=' not in block, 'Use common, nonexclusive topic tags'
    assert "c.dataset.topics.split(' ').includes(field.value)" in text
    print(f'Validated {len(catalog["cases"])} unique cases, target pages and static cards.')


if __name__ == '__main__':
    main()
