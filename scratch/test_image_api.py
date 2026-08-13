import urllib.request
import json

boundary = '----WebKitFormBoundary123456789'
with open('data/sample_images/wet1.png', 'rb') as f:
    file_bytes = f.read()

part_header = (
    f"--{boundary}\r\n"
    f"Content-Disposition: form-data; name=\"file\"; filename=\"wet1.png\"\r\n"
    f"Content-Type: image/png\r\n\r\n"
).encode('utf-8')

part_footer = f"\r\n--{boundary}--\r\n".encode('utf-8')
body = part_header + file_bytes + part_footer

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/analyze',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

with urllib.request.urlopen(req) as resp:
    res = json.loads(resp.read().decode('utf-8'))
    print("IMAGE API RESPONSE SUCCESS:")
    print(json.dumps(res, indent=2))
