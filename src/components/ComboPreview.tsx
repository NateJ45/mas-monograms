import { useState, useRef } from 'react';

interface CategoryOption {
  name: string;
  slug: string;
}
interface FontOption {
  name: string;
  previewUrl: string;
  alt: string;
}
interface ThreadOption {
  name: string;
  hex: string;
}

interface Props {
  categories: CategoryOption[];
  fonts: FontOption[];
  threadColors: ThreadOption[];
}

// Heirloom Ink — legibility fallback when the chosen thread is near-white.
const HEIRLOOM_INK = '#26312E';

/**
 * WCAG relative luminance (0 = black, 1 = white) for a #rrggbb hex.
 * Used to detect pale threads (e.g. "Bright White") that would vanish
 * against the Paper ground; those fall back to Heirloom Ink.
 */
function relativeLuminance(hex: string): number {
  const m = hex.trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return 0;
  const int = parseInt(m[1], 16);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = channel((int >> 16) & 0xff);
  const g = channel((int >> 8) & 0xff);
  const b = channel(int & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Threads brighter than this against Paper are re-inked so they stay legible.
const PALE_THREAD_LUMINANCE = 0.7;

function PickerRow<T>({
  label,
  options,
  selectedIndex,
  onSelect,
  renderOption,
  optionLabel,
}: {
  label: string;
  options: T[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  renderOption: (option: T, isSelected: boolean) => React.ReactNode;
  /** Accessible name for each option button (required for icon/swatch-only
   *  options like the thread colors, which have no visible text). */
  optionLabel?: (option: T) => string;
}) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function moveTo(nextIndex: number) {
    const clamped = (nextIndex + options.length) % options.length;
    onSelect(clamped);
    buttonRefs.current[clamped]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        moveTo(selectedIndex + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        moveTo(selectedIndex - 1);
        break;
      case 'Home':
        e.preventDefault();
        moveTo(0);
        break;
      case 'End':
        e.preventDefault();
        moveTo(options.length - 1);
        break;
    }
  }

  return (
    <fieldset className="flex flex-col gap-xs">
      <legend className="text-xs uppercase tracking-eyebrow text-muted-foreground mb-xs">{label}</legend>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-s" onKeyDown={handleKeyDown}>
        {options.map((option, i) => (
          <button
            key={i}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={i === selectedIndex}
            aria-label={optionLabel ? optionLabel(option) : undefined}
            tabIndex={i === selectedIndex ? 0 : -1}
            onClick={() => onSelect(i)}
            className="min-h-[44px] min-w-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-md"
          >
            {renderOption(option, i === selectedIndex)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ComboPreview({ categories, fonts, threadColors }: Props) {
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [fontIndex, setFontIndex] = useState(0);
  const [threadIndex, setThreadIndex] = useState(0);
  const [initials, setInitials] = useState('ABC');

  const category = categories[categoryIndex];
  const font = fonts[fontIndex];
  const thread = threadColors[threadIndex];

  // Recolor the drawn initials to the selected thread — but if the thread is
  // near-white it would disappear on the Paper ground, so ink it instead.
  const threadHex = thread?.hex ?? HEIRLOOM_INK;
  const threadIsPale = relativeLuminance(threadHex) > PALE_THREAD_LUMINANCE;
  const monogramColor = threadIsPale ? HEIRLOOM_INK : threadHex;

  const displayInitials = initials.trim().length > 0 ? initials : 'ABC';

  // Deep link carrying the picked combination into the quote form.
  const quoteHref =
    `/request-a-quote?item=${encodeURIComponent(category?.slug ?? '')}` +
    `&font=${encodeURIComponent(font?.name ?? '')}` +
    `&thread=${encodeURIComponent(thread?.name ?? '')}` +
    `&initials=${encodeURIComponent(displayInitials)}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-l items-start">
      <div className="flex flex-col gap-l">
        <PickerRow
          label="Item"
          options={categories}
          selectedIndex={categoryIndex}
          onSelect={setCategoryIndex}
          renderOption={(opt, isSelected) => (
            <span
              className={`inline-flex items-center px-m py-s rounded-full border text-sm transition-colors ${
                isSelected ? 'border-primary bg-primary text-white' : 'border-border text-foreground hover:border-primary'
              }`}
            >
              {opt.name}
            </span>
          )}
        />
        <PickerRow
          label="Font"
          options={fonts}
          selectedIndex={fontIndex}
          onSelect={setFontIndex}
          renderOption={(opt, isSelected) => (
            <span
              className={`inline-flex items-center gap-xs px-s py-xs rounded-md border text-sm transition-colors ${
                isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'
              }`}
            >
              <img src={opt.previewUrl} alt="" aria-hidden="true" width={28} height={28} className="w-7 h-7 rounded object-cover" />
              {opt.name}
            </span>
          )}
        />
        <PickerRow
          label="Thread Color"
          options={threadColors}
          selectedIndex={threadIndex}
          onSelect={setThreadIndex}
          optionLabel={(opt) => opt.name}
          renderOption={(opt, isSelected) => (
            <span
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full border-2 ${
                isSelected ? 'border-primary' : 'border-border'
              }`}
              style={{ backgroundColor: opt.hex }}
              title={opt.name}
            />
          )}
        />

        <div className="flex flex-col gap-xs">
          <label
            htmlFor="combo-initials"
            className="text-xs uppercase tracking-eyebrow text-muted-foreground mb-xs"
          >
            Your Initials
          </label>
          <input
            id="combo-initials"
            type="text"
            inputMode="text"
            autoComplete="off"
            maxLength={3}
            value={initials}
            onChange={(e) => setInitials(e.target.value.toUpperCase())}
            placeholder="ABS"
            aria-label="Your initials (up to 3 letters)"
            className="w-32 min-h-[44px] rounded-md border border-border bg-background px-m py-s text-lg tracking-widest uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>
      </div>

      <div className="rounded-xl bg-background border border-border p-l flex flex-col items-center text-center gap-m">
        {/* Live monogram — the aspirational preview. Initials drawn in the
            Petemoss monogram utility, recolored inline to the thread hex (or
            inked when the thread is near-white), on a Paper ground inside the
            hoop-ring (brass p-1) frame. */}
        <div className="p-1 bg-secondary rounded-xl w-full max-w-xs">
          <div className="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)] bg-[#FBF8F1] aspect-[4/3] flex items-center justify-center px-m">
            <span
              className="font-monogram leading-none text-[clamp(3.5rem,14vw,6rem)] break-words"
              style={{
                color: monogramColor,
                textShadow: threadIsPale ? '0 0 1px rgba(0,0,0,0.15)' : undefined,
              }}
              aria-label={`Monogram preview of the initials ${displayInitials}`}
            >
              {displayInitials}
            </span>
          </div>
        </div>

        {/* The real specimen photo — the truth beneath the drawn preview. */}
        {font && (
          <div className="flex flex-col items-center gap-xs">
            <div className="p-1 bg-secondary rounded-lg">
              <div className="overflow-hidden rounded-[calc(var(--radius-lg,0.5rem)-0.25rem)]">
                <img
                  src={font.previewUrl}
                  alt={font.alt}
                  width={112}
                  height={112}
                  className="w-28 h-28 object-cover"
                />
              </div>
            </div>
            <p className="text-xs uppercase tracking-eyebrow text-[var(--color-text-tertiary)]">
              your font, stitched
            </p>
          </div>
        )}

        <p className="text-sm text-[var(--color-text-secondary)]">
          {category?.name} · {font?.name} · {thread?.name}
        </p>

        <a
          href={quoteHref}
          className="press-tactile inline-flex items-center justify-center min-h-[44px] px-l py-s text-xs font-semibold uppercase tracking-[0.18em] rounded-sm bg-[var(--color-rust-cta,#8C3A2E)] text-white hover:bg-[var(--color-rust-cta-hover,#722C22)] transition-colors"
        >
          Get a Quote for This Combination
        </a>
      </div>
    </div>
  );
}
