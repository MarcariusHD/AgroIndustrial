"""Envía muestras de prueba sin ESP32 ni dependencias adicionales."""
import argparse
import json
import os
import random
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

parser = argparse.ArgumentParser()
parser.add_argument('--device-id', type=int, required=True)
parser.add_argument('--url', default='http://127.0.0.1:8000')
parser.add_argument('--count', type=int, default=3)
args = parser.parse_args()
key = os.environ.get('ESP32_API_KEY')
if not key:
    parser.error('Define ESP32_API_KEY antes de ejecutar')
for index in range(args.count):
    payload = dict(id_dispositivo=args.device_id, temperatura=round(random.uniform(20, 30), 1),
                   humedad=round(random.uniform(45, 75), 1), luz_adc=random.randint(500, 3500), simulado=True)
    request = Request(args.url.rstrip('/') + '/api/esp32/lecturas',
                      data=json.dumps(payload).encode(),
                      headers={'Content-Type': 'application/json', 'X-API-Key': key})
    try:
        with urlopen(request, timeout=10) as response:
            print(response.status, response.read().decode())
    except HTTPError as error:
        detail = error.read().decode(errors='replace')
        try:
            detail = json.loads(detail).get('detail', detail)
        except (ValueError, AttributeError):
            pass
        parser.exit(1, f'HTTP {error.code}: {detail}\n')
    except (URLError, TimeoutError) as error:
        parser.exit(1, f'No se pudo contactar con la API en {args.url}: {error}\n')
    if index + 1 < args.count:
        time.sleep(10)
