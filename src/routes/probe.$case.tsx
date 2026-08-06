import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/probe/$case')({ component: Probe })

// Font-CLS probe pages. Each isolates a different mechanism by which a late web
// font shifts layout, so CLS can be attributed to a cause rather than a vibe.
//
//   hero     — the realistic marketing shape: wrapping headline + subhead with a
//              CTA row and card directly beneath, all inside the first viewport.
//              This is where font CLS actually costs you, because the shifted
//              elements are on screen.
//   tailwind — Tailwind type utilities everywhere. Tailwind's preflight sets a
//              unitless `line-height: 1.5` on html, so ascent/descent/line-gap
//              overrides are inert; only re-wrapping (line COUNT) can shift.
//   normal   — line-height: normal, opted out of preflight's inherited leading.
//              Here the vertical descriptors DO drive the line box.

const BODY = [
  'Typography is the craft of endowing human language with a durable visual form, and thus with an independent existence beyond the moment of its speaking.',
  'When a web font arrives after first paint the browser re-measures every line. Breaks move, paragraph heights change, and everything below the text jumps.',
  'A metric-compatible fallback removes that jump by making the locally available system font occupy the same space as the web font that is still downloading.',
  'Four descriptors do the work on an @font-face pointing at a local() source: size-adjust scales glyph advances while ascent-override, descent-override and line-gap-override pin the vertical box.',
  'Whether the vertical descriptors do anything depends entirely on the surrounding CSS. If line-height is a number or a length, the line box stops depending on font metrics.',
  'That distinction matters enormously for a utility-CSS codebase, because such frameworks set an inherited line-height on the root element in their preflight.',
]

function Probe() {
  const { case: kind } = Route.useParams()

  if (kind === 'normal') {
    return (
      <main className="probe-normal page-wrap px-4 pb-8 pt-8">
        <h1>Line-height normal is the vertical-metric case</h1>
        {BODY.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div data-probe="a" className="probe-box" />
        {BODY.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        <div data-probe="b" className="probe-box" />
      </main>
    )
  }

  if (kind === 'tailwind') {
    return (
      <main className="page-wrap px-4 pb-8 pt-4">
        <div className="max-w-2xl space-y-3 text-base">
          {BODY.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div data-probe="a" className="probe-box island-shell mt-4 rounded-2xl" />
        <div className="mt-4 max-w-2xl space-y-3 text-base">
          {BODY.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div data-probe="b" className="probe-box island-shell mt-4 rounded-2xl" />
      </main>
    )
  }

  // default: 'hero' — everything that shifts is above the fold on both viewports.
  return (
    <main className="page-wrap px-4 pb-8 pt-4">
      <h1 className="display-title probe-display mb-3 font-bold tracking-tight text-[var(--sea-ink)]">
        Ship a fast, beautiful TanStack Start application without the layout jank
      </h1>
      <p className="mb-4 max-w-xl text-base text-[var(--sea-ink-soft)]">
        {BODY[1]} {BODY[2]}
      </p>
      <div data-probe="a" className="mb-4 flex flex-wrap gap-3">
        <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold">
          Get started
        </span>
        <span className="rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-5 py-2.5 text-sm font-semibold">
          Read the docs
        </span>
      </div>
      <div data-probe="b" className="island-shell probe-box rounded-2xl" />
    </main>
  )
}
