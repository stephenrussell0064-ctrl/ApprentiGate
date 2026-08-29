import { ImageResponse } from 'next/og';

/**
 * The social card, generated at build time from the brand tokens.
 *
 * Served from a path ending `.png` rather than through Next's
 * `opengraph-image` convention, which emits an extensionless file. Wrangler
 * derives an asset's MIME type from its extension, so that file shipped with no
 * Content-Type at all — verified locally — and a social scraper handed an image
 * without a content type simply does not render a card. The acceptance
 * criterion is that the card renders in a preview tool, so the extension is
 * load-bearing rather than cosmetic.
 *
 * It carries the mark, the name and the proposition — and nothing else. No
 * stock photography, no logos, no figures, no claim of any kind, because a
 * social card is shared out of context and is the last place to put something
 * that needs qualifying.
 *
 * Colours are the token values written out, because ImageResponse renders in
 * its own document with no access to the stylesheet's custom properties. They
 * are the only place in the codebase besides tokens.css and the favicon where a
 * hex may appear, and the design-token guard allow-lists this file for that
 * reason. If the palette changes, this changes with it.
 */

/** Generated once at build time, like every other asset under `output: 'export'`. */
export const dynamic = 'force-static';

export const OG_IMAGE_ALT =
  'ApprentiGate — apprenticeships for growing businesses in England';
export const OG_IMAGE_SIZE = { width: 1200, height: 630 };

// --color-ag-ink, --color-ag-slate, --color-ag-signal, --color-ag-paper, --color-ag-mist
const INK = '#0F1D2A';
const SLATE = '#4A5B6B';
const SIGNAL = '#0B6E5F';
const PAPER = '#FFFFFF';
const MIST = '#EDF1F4';
// --color-ag-brand-accent
const ACCENT = '#C8862B';

/*
 * The mark, as the same SVG that ships as icon.svg, embedded as a data URI.
 *
 * Satori lays out flexbox, not arcs — the arch cannot be expressed with the
 * divs the rest of this card is built from. Handing it the finished SVG keeps
 * the social card and the favicon from drifting apart, which is exactly what
 * happened to the previous mark: it was redrawn here as a rounded div and a
 * white bar, and had to be changed in two places every time.
 */
const MARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="64" height="64">` +
  `<circle cx="16" cy="16" r="16" fill="${INK}"/>` +
  `<path d="M10.4 24.6V14.4a5.6 5.6 0 0 1 11.2 0v10.2" fill="none" stroke="${PAPER}" stroke-width="2.6" stroke-linecap="round"/>` +
  `<path d="M12.5 19.4 16 15.9l3.5 3.5" fill="none" stroke="${ACCENT}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>` +
  `</svg>`;

const MARK_DATA_URI = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString('base64')}`;

export function GET(): Response {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: PAPER,
        padding: '72px 80px',
      }}
    >
      {/* Mark and name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={MARK_DATA_URI} width={64} height={64} alt="" />
        <div style={{ fontSize: 40, fontWeight: 700, color: INK, letterSpacing: -1 }}>
          ApprentiGate
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div
          style={{
            fontSize: 68,
            fontWeight: 700,
            color: INK,
            lineHeight: 1.1,
            letterSpacing: -2,
            maxWidth: 900,
          }}
        >
          Build your apprenticeship programme without the complexity.
        </div>
        <div style={{ fontSize: 30, color: SLATE, maxWidth: 820, lineHeight: 1.35 }}>
          Apprenticeships for growing businesses in England.
        </div>
      </div>

      {/* The relay band, as a rule. The signature element, legible even at
            the size a social card is actually seen. */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {['Employer', 'ApprentiGate', 'Training provider'].map((label, index) => (
          <div
            key={label}
            style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                background: index === 1 ? SIGNAL : PAPER,
                border: `3px solid ${index === 1 ? SIGNAL : SLATE}`,
              }}
            />
            <div
              style={{
                fontSize: 22,
                color: index === 1 ? SIGNAL : SLATE,
                letterSpacing: 1,
              }}
            >
              {label.toUpperCase()}
            </div>
            {index < 2 && <div style={{ flex: 1, height: 2, background: MIST }} />}
          </div>
        ))}
      </div>
    </div>,
    OG_IMAGE_SIZE,
  );
}
