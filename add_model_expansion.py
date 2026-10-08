"""Apply the common viewer to every registered case, without recreating its iframe."""
from pathlib import Path
from html import escape, unescape
import json
import re

ROOT = Path(__file__).resolve().parent


def apply():
    css = (ROOT/'model-expansion.css').read_text()
    js = (ROOT/'model-expansion.js').read_text()
    frame_js = (ROOT/'model-frame-tools.js').read_text()
    for case in json.loads((ROOT/'cases.json').read_text())['cases']:
        path = ROOT/case['page']
        text = path.read_text()
        pattern = r'(<iframe\b[^>]*?\bdata-srcdoc=")([^"]*)("[^>]*>)'
        match = re.search(pattern, text)
        assert match, f"Missing data-srcdoc: {path.name}"
        original = unescape(match[2])
        # The original teaching/learning viewer has no zoom handler.
        if case['id']=='teaching-learning' and 'geometry-world-zoom-v1' not in original:
            anchor='const scale=Math.min((w/2-18)/maxX,(h*.46-20)/maxY,(h*.54-24)/minY);'
            assert original.count(anchor)==1, 'Teaching/learning projection changed'
            original=original.replace(anchor,anchor.replace('const scale=Math.min','const scale=geometryWorldZoom*Math.min'))
            start='function drawWorld() {'
            original=original.replace(start, '/* geometry-world-zoom-v1 */\n      let geometryWorldZoom=1;\n      world.addEventListener("wheel",e=>{e.preventDefault();geometryWorldZoom=Math.max(.6,Math.min(2.5,geometryWorldZoom*Math.exp(-e.deltaY*.001)));schedule();},{passive:false});\n      '+start)
        block='<script id="model-frame-tools-v1">'+frame_js+'</script>'
        original=re.sub(r'<script id="model-frame-tools-v1">.*?</script>', '', original,flags=re.S)
        assert '</body>' in original
        original=original.replace('</body>', block+'</body>')
        text=text[:match.start(2)]+escape(original,quote=True)+text[match.end(2):]
        text=re.sub(r'<style id="model-expansion-v1">.*?</style>','',text,flags=re.S)
        text=re.sub(r'<script id="model-expansion-v1">.*?</script>','',text,flags=re.S)
        text=text.replace('</head>','<style id="model-expansion-v1">'+css+'</style></head>')
        text=text.replace('</body>','<script id="model-expansion-v1">'+js+'</script></body>')
        path.write_text(text)
    print('Applied in-place expansion and model zoom to all registered cases.')


if __name__=='__main__':
    apply()
