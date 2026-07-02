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
              className={`inline-flex items-center justify-center w-11 h-11 rounded-full border-2 transition-transform hover:scale-105 ${
                isSelected ? 'border-primary' : 'border-border hover:border-primary/60'
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

      {/* Block flow + text-center + mx-auto to center the stacked children.
          NB: use max-w-[18rem], NOT max-w-xs — this project maps the `xs` scale
          key to --spacing-xs (~0.4rem), so `max-w-xs` would clamp these to ~6px. */}
      <div className="rounded-xl bg-background border border-border p-l text-center space-y-m">
        {/* The real font specimen — the ACTUAL letterforms of the selected
            embroidery font (not a webfont stand-in), shown on a Paper ground
            inside the hoop-ring (brass p-1) frame. This is the honest preview:
            it changes whenever the Font picker changes. */}
        {font && (
          <div className="mx-auto w-full max-w-[18rem] p-1 bg-secondary rounded-xl">
            <div className="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)] bg-[#FBF8F1] aspect-[4/3] p-m">
              <img
                src={font.previewUrl}
                alt={font.alt}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}
        <p className="text-xs uppercase tracking-eyebrow text-[var(--color-text-tertiary)]">
          The {font?.name} alphabet
        </p>

        {/* Your selections, spelled out — every row mirrors a picker so the card
            always reflects the current Item / Thread / Initials choices. */}
        <dl className="mx-auto w-full max-w-[18rem] text-sm">
          <div className="flex items-center justify-between gap-m py-s border-b border-border">
            <dt className="text-xs uppercase tracking-eyebrow text-[var(--color-text-tertiary)]">Item</dt>
            <dd className="font-medium text-foreground">{category?.name}</dd>
          </div>
          <div className="flex items-center justify-between gap-m py-s border-b border-border">
            <dt className="text-xs uppercase tracking-eyebrow text-[var(--color-text-tertiary)]">Thread</dt>
            <dd className="flex items-center gap-xs font-medium text-foreground">
              <span
                className="inline-block w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: thread?.hex }}
                aria-hidden="true"
              />
              {thread?.name}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-m py-s">
            <dt className="text-xs uppercase tracking-eyebrow text-[var(--color-text-tertiary)]">Initials</dt>
            <dd className="font-display text-lg tracking-widest text-foreground">{displayInitials}</dd>
          </div>
        </dl>

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
