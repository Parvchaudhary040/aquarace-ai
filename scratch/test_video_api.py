import urllib.request
import json
import uuid

boundary = '----WebKitFormBoundary123456789'
with open('data/sample_video.mp4', 'rb') as f:
    file_bytes = f.read()

part_header = (
    f"--{boundary}\r\n"
    f"Content-Disposition: form-data; name=\"file\"; filename=\"sample_video.mp4\"\r\n"
    f"Content-Type: video/mp4\r\n\r\n"
).encode('utf-8')

part_footer = f"\r\n--{boundary}--\r\n".encode('utf-8')
body = part_header + file_bytes + part_footer

req = urllib.request.Request(
    'http://127.0.0.1:8000/api/analyze-video',
    data=body,
    headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
)

try:
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("API RESPONSE SUCCESS:")
        print(json.dumps(res, indent=2))
except Exception as e:
    print("API ERROR:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
