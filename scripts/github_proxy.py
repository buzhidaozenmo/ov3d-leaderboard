import socket, threading, selectors, sys

LISTEN = ("127.0.0.1", 8899)
OVERRIDES = {"github.com": "140.82.112.3"}

def pipe(a, b):
    try:
        while True:
            data = a.recv(65536)
            if not data:
                break
            b.sendall(data)
    except Exception:
        pass
    finally:
        for s in (a, b):
            try: s.shutdown(socket.SHUT_RDWR)
            except Exception: pass

def handle(conn):
    try:
        conn.settimeout(20)
        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = conn.recv(4096)
            if not chunk: return
            buf += chunk
        head = buf.split(b"\r\n\r\n", 1)[0].decode("latin-1")
        line = head.split("\r\n", 1)[0]
        method, target, _ = line.split(" ", 2)
        if method != "CONNECT":
            conn.sendall(b"HTTP/1.1 405 Method Not Allowed\r\n\r\n"); return
        host, _, port = target.partition(":")
        port = int(port or 443)
        ip = OVERRIDES.get(host)
        if ip:
            addr = (ip, port)
        else:
            addr = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)[0][4]
        upstream = socket.create_connection(addr, timeout=20)
        conn.sendall(b"HTTP/1.1 200 Connection Established\r\n\r\n")
        conn.settimeout(None); upstream.settimeout(None)
        t = threading.Thread(target=pipe, args=(upstream, conn), daemon=True)
        t.start()
        pipe(conn, upstream)
    except Exception as e:
        print("proxy error:", e, flush=True)
    finally:
        try: conn.close()
        except Exception: pass

srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(LISTEN); srv.listen(50)
print("proxy on", LISTEN, flush=True)
while True:
    c, _ = srv.accept()
    threading.Thread(target=handle, args=(c,), daemon=True).start()
