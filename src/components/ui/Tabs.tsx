'use client';

export interface TabDef {
  value: string;
  label: string;
  /** Shown as a count beside the label. */
  badge?: number;
}

interface TabsProps {
  tabs: TabDef[];
  value: string;
  onChange: (_value: string) => void;
  label: string;
}

/**
 * Underlined tabs. A real tablist so arrow keys and screen readers work; the
 * row scrolls rather than wraps on a narrow screen, with the scrollbar hidden
 * because a cut-off last tab is its own affordance.
 */
export default function Tabs({ tabs, value, onChange, label }: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="no-scrollbar flex gap-6 overflow-x-auto border-b border-secondary/10"
    >
      {tabs.map((tab) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(tab.value)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-1 pb-3 pt-2 text-14 transition-colors ${
              selected
                ? 'border-primary font-medium text-primary'
                : 'border-transparent text-gray hover:text-secondary'
            }`}
          >
            {tab.label}
            {typeof tab.badge === 'number' && (
              <span
                className={`rounded-full px-2 py-0.5 text-11 ${
                  selected ? 'bg-primary/10 text-primary' : 'bg-secondary/8 text-gray'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
