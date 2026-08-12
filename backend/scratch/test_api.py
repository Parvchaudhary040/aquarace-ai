import json
import urllib.request
from pathlib import Path

BASE_URL = "http://127.0.0.1:8000/api"

def main():
    url = f"{BASE_URL}/analyze"
    boundary = "----WebKitFormBoundary7MA4YWxkTrZu0gW"
    payload = bytearray()
    payload.extend(f"--{boundary}\r\n".encode())
    payload.extend(b'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n')
    payload.extend(b"Content-Type: text/plain\r\n\r\nHello text file\r\n")
    payload.extend(f"--{boundary}--\r\n".encode())

    req = urllib.request.Request(
        url,
        data=bytes(payload),
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print("Status:", resp.status)
    except urllib.error.HTTPError as e:
        print("Invalid file test -> Status:", e.code, "Response:", json.loads(e.read().decode("utf-8")))

if __name__ == "__main__":
    main()
