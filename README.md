# tailwind-font-kit-example

A real TanStack Start + Tailwind v4 app using
[`tailwind-font-kit`](https://github.com/hbmartin/tailwind-font-kit), plus the measurement harness
that produced the numbers in its README — so you can reproduce them rather than take my word for it.

Two families, deliberately chosen to exercise different paths:

- **Manrope** → `--font-sans`, self-hosted, body face preloaded.
- **Fraunces** → `--font-display`, carries an `opsz` axis, pinned at 48.

```bash
pnpm install
pnpm dev
```

## What to look at

`vite.config.ts` has one added line, `fonts()`, before `tailwindcss()`. `fonts.config.mjs` names the
families. **`src/routes/__root.tsx` contains nothing font-related** — preloads arrive as an HTTP
`Link:` response header, so no app code is involved.

Verify that for yourself on a build:

```bash
pnpm build
PORT=3000 node .output/server/index.mjs

curl -sI localhost:3000/ | grep -i '^link'          # preload header, with crossorigin
curl -sI localhost:3000/fonts/*.woff2 | grep -i cache-control   # immutable
grep -o -- '--default-font-family:[^;}]*' .output/public/assets/styles-*.css
```

The last one should print `--default-font-family:var(--font-sans)`. If it printed a literal font
stack instead, the `@theme` was emitted as `inline` somewhere and the fallbacks are not reaching the
root font-family — that is the single most common way this setup silently half-works.

## Measuring

```bash
pnpm build && PORT=3000 node .output/server/index.mjs &

pnpm measure:cls      # CLS per probe x viewport, font response delayed 2s
pnpm measure:net      # FCP / fonts-applied at 150ms RTT / 4Mbps, 9 runs
pnpm measure:widths   # CLS swept across container widths
```

`/probe/hero`, `/probe/tailwind` and `/probe/normal` isolate the three ways a late font moves layout:
above-the-fold re-wrap, Tailwind's pinned leading (only `size-adjust` can matter), and
`line-height: normal` (where the vertical descriptors are live).

Two things worth knowing before you read your own numbers:

- **Use 9 runs for `measure:net`.** FCP is noisy enough that a 3-run median once read 844 ms against
  a true value of 644 ms.
- **A single-viewport CLS number is a bad instrument for width changes.** A config reading 0.0001 at
  two viewports was shifting 51 px at 2 of 36 container widths. That is what `measure:widths` is for.

## Reproducing the "before"

To see the untreated baseline, remove `fonts()` from `vite.config.ts` and put a Google `@import`
back at the top of `src/styles.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
```

with `--font-sans: 'Poppins', ui-sans-serif, system-ui, sans-serif` in your `@theme`. Measured that
way, mobile `/probe/hero` reads **0.1211** — a failing Core Web Vitals score — against **0.0004**
with the kit. Manrope, the font this app ships, happens to sit within 1.9% of macOS system-ui, so it
shows far less difference; that is a property of the font, not of the tooling.
