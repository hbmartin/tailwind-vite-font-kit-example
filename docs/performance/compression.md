# Production asset compression

Nitro now generates gzip and Brotli variants of compressible public assets. The
original files remain available for identity requests. The `/assets/**` response
rule includes `Vary: Accept-Encoding` for identity responses too; this Nitro version
only adds that header itself when selecting an encoded variant. Font binaries and
font preload behavior are preserved. Existing Sentry externalization is unchanged.

Verified locally on 2026-09-14 with Node 24.21.0 and the frozen lockfile's Nitro
3.0.260610-beta. A disposable copy of reference commit
`93506fd58ce8b5385525cdda7df60885d397f2c7` used this Vite configuration and its own
locked font plugin (0.1.0), without benchmark instrumentation or local plugin imports.

The initial main JavaScript asset measured 319,794 bytes with identity encoding,
100,964 with gzip, and 87,633 with Brotli (68.4% and 72.6% smaller). These are native
production-server response bodies, not estimates from a measurement proxy.

The [21-response audit](compression-results.json) checked every built JS/CSS/font
asset under gzip, Brotli and identity requests. It verified decoded byte equality,
content types, immutable caching, `Vary`, encoding negotiation, uncompressed WOFF2,
and the hero page's font preload header. A second build using the current local
font-kit source also passed. Compression adds no client code.

Reproduce manually after a production build:

```sh
pnpm install --frozen-lockfile
pnpm build
PORT=3000 node .output/server/index.mjs
# In another terminal:
node scripts/verify-compression.mjs http://localhost:3000 .output/public compression-results.json
```

This is a local manual check; no CI or scheduled browser runs were added. Deployment
must serve Nitro's output (including `.br`/`.gz` files), or provide equivalent
compression at its CDN. No deployment or package upgrade is part of this change.
