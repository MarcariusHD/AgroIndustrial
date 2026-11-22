"""Arranca la API local usando la misma clave del firmware, sin imprimirla."""
import os
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
config = ROOT / 'firmware' / 'esp32_suelo_agua' / 'config.h'
match = re.search(r'^\s*#define\s+API_KEY\s+"([^"\r\n]+)"',
                  config.read_text(encoding='utf-8'), re.MULTILINE)
if not match:
    raise SystemExit('No se encontro API_KEY en firmware/esp32_suelo_agua/config.h')
os.environ['ESP32_API_KEY'] = match.group(1)
os.chdir(ROOT)
sys.path.insert(0, str(ROOT))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run('main:app', host='0.0.0.0', port=8000)
