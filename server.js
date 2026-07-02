const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

// Đọc nội dung request body dạng JSON
function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// Gửi JSON response
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  res.end(body);
}

// Phục vụ file tĩnh
function serveStatic(req, res, urlPath) {
  let filePath = path.join(ROOT, decodeURIComponent(urlPath));
  if (urlPath === "/" || urlPath === "") filePath = path.join(ROOT, "index.html");

  const ext = path.extname(filePath);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = url.pathname;
  const method = req.method;

  // CORS cho phép mọi origin (tiện khi test)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  // API: đọc danh sách cụm từ
  if (p === "/api/phrases" && method === "GET") {
    try {
      const data = fs.readFileSync(path.join(ROOT, "phrases.json"), "utf-8");
      sendJson(res, 200, JSON.parse(data));
    } catch (e) {
      sendJson(res, 500, { error: "Không đọc được phrases.json" });
    }
    return;
  }

  // API: ghi danh sách cụm từ
  if (p === "/api/phrases" && (method === "POST" || method === "PUT")) {
    try {
      const body = await readBody(req);
      if (!Array.isArray(body)) {
        sendJson(res, 400, { error: "Dữ liệu phải là mảng các chuỗi" });
        return;
      }
      const clean = body.map((s) => String(s).trim()).filter((s) => s.length > 0);
      if (clean.length === 0) {
        sendJson(res, 400, { error: "Danh sách không được rỗng" });
        return;
      }
      fs.writeFileSync(
        path.join(ROOT, "phrases.json"),
        JSON.stringify(clean, null, 2),
        "utf-8"
      );
      sendJson(res, 200, { ok: true, phrases: clean });
    } catch (e) {
      sendJson(res, 500, { error: "Không ghi được phrases.json" });
    }
    return;
  }

  // API: đọc cấu hình (thời gian)
  if (p === "/api/config" && method === "GET") {
    try {
      const data = fs.readFileSync(path.join(ROOT, "config.json"), "utf-8");
      sendJson(res, 200, JSON.parse(data));
    } catch (e) {
      sendJson(res, 500, { error: "Không đọc được config.json" });
    }
    return;
  }

  // API: ghi cấu hình (thời gian)
  if (p === "/api/config" && (method === "POST" || method === "PUT")) {
    try {
      const body = await readBody(req);
      const duration = parseInt(body.displayDuration, 10);
      if (!duration || duration < 1000) {
        sendJson(res, 400, { error: "Thời gian phải ≥ 1000ms" });
        return;
      }
      const cfg = { displayDuration: duration };
      fs.writeFileSync(
        path.join(ROOT, "config.json"),
        JSON.stringify(cfg, null, 2),
        "utf-8"
      );
      sendJson(res, 200, { ok: true, config: cfg });
    } catch (e) {
      sendJson(res, 500, { error: "Không ghi được config.json" });
    }
    return;
  }

  // Mặc định: phục vụ file tĩnh
  serveStatic(req, res, p);
});

server.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
  console.log(`  Trang hiển thị: http://localhost:${PORT}/index.html`);
  console.log(`  Trang quản lý : http://localhost:${PORT}/admin.html`);
});