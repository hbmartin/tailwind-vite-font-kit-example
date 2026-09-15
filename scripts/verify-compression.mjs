// Manual production check: node scripts/verify-compression.mjs ORIGIN PUBLIC_DIR OUT.json
import assert from "node:assert/strict";
import { get } from "node:http";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { gunzipSync, brotliDecompressSync } from "node:zlib";
const [
  origin = "http://localhost:3000",
  publicDir = ".output/public",
  output = "compression-results.json",
] = process.argv.slice(2);
const request = (path, encoding) =>
  new Promise((resolve, reject) => {
    get(new URL(path, origin), { headers: { "accept-encoding": encoding } }, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () =>
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks) }),
      );
      res.on("error", reject);
    }).on("error", reject);
  });
const html = await request("/probe/hero", "identity");
assert.equal(html.status, 200);
assert.match(html.headers.link, /rel="?preload/);
assert.match(html.headers.link, /as="?font/);
const rows = [];
for (const directory of ["assets", "fonts"])
  for (const file of readdirSync(join(publicDir, directory)).filter((f) =>
    /\.(?:js|css|woff2)$/.test(f),
  )) {
    const path = `/${directory}/${file}`;
    const original = readFileSync(join(publicDir, directory, file));
    for (const encoding of ["identity", "gzip", "br"]) {
      const response = await request(path, encoding);
      assert.equal(response.status, 200, path);
      const compressed = directory === "assets" && original.length >= 1024;
      assert.equal(
        response.headers["content-encoding"],
        compressed && encoding !== "identity" ? encoding : undefined,
        path,
      );
      if (compressed) assert.match(response.headers.vary, /accept-encoding/i);
      assert.match(response.headers["cache-control"], /immutable/);
      assert.match(
        response.headers["content-type"],
        file.endsWith(".js") ? /javascript/ : file.endsWith(".css") ? /text\/css/ : /font\/woff2/,
      );
      const decoded =
        response.headers["content-encoding"] === "gzip"
          ? gunzipSync(response.body)
          : response.headers["content-encoding"] === "br"
            ? brotliDecompressSync(response.body)
            : response.body;
      assert.deepEqual(decoded, original, path);
      rows.push({
        path,
        encoding,
        bytes: response.body.length,
        decodedBytes: decoded.length,
        sha256: createHash("sha256").update(decoded).digest("hex"),
        headers: response.headers,
      });
    }
  }
assert(
  rows.some((r) => r.encoding === "br" && r.bytes < r.decodedBytes),
  "No compressed asset tested",
);
const report = { validated: true, preload: html.headers.link, rows };
writeFileSync(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ output, validated: true, requests: rows.length }));
