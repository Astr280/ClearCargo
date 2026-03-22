const http = require("http");
const fs = require("fs");
const path = require("path");

const port = process.env.PORT || 4173;
const root = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8"
};

http
  .createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : req.url.split("?")[0];
    const filePath = path.join(root, decodeURIComponent(requestPath));

    if (!filePath.startsWith(root)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }

    fs.readFile(filePath, (error, file) => {
      if (error) {
        res.writeHead(error.code === "ENOENT" ? 404 : 500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end(error.code === "ENOENT" ? "Not found" : "Server error");
        return;
      }

      res.writeHead(200, { "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream" });
      res.end(file);
    });
  })
  .listen(port, () => {
    console.log(`CargoClear preview running at http://localhost:${port}`);
  });
