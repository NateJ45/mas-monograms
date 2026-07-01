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
}: {
  label: string;
  options: T[];
  selectedIndex: number;
  onSelect: (i: number) => void;
  renderOption: (option: T, isSelected: boolean) => React.ReactNode;
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

  const category = categories[categoryIndex];
  const font = fonts[fontIndex];
  const thread = threadColors[threadIndex];

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
      </div>

      <div className="rounded-xl bg-background border border-border p-l flex flex-col items-center text-center gap-m">
        {font && (
          <div className="p-1 bg-secondary rounded-xl">
            <div className="overflow-hidden rounded-[calc(var(--radius-xl)-0.25rem)]">
              <img src={font.previewUrl} alt={font.alt} width={160} height={160} className="w-40 h-40 object-cover" />
            </div>
          </div>
        )}
        <p className="font-display text-h4 text-foreground">
          {category?.name} · {font?.name} · {thread?.name}
        </p>
        <a
          href="/request-a-quote"
          className="press-tactile inline-flex items-center justify-center min-h-[44px] px-l py-s text-xs font-semibold uppercase tracking-[0.18em] rounded-sm bg-[var(--color-rust-cta,#b8492a)] text-white hover:bg-[var(--color-rust-cta-hover,#9c3c20)] transition-colors"
        >
          Get a Quote for This Combination
        </a>
      </div>
    </div>
  );
}
