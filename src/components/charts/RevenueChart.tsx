import { moneyShort } from 'lib/format';

interface Point {
  month: string;
  retail: number;
  wholesale: number;
}

/* Hand-drawn SVG rather than a charting library: two series and twelve bars do
   not justify 100KB of JavaScript, and a library that measures the DOM on
   mount renders differently on the server than in the browser. This is the
   same markup both times. */

const W = 760;
const H = 280;
const PAD = { top: 16, right: 8, bottom: 28, left: 56 };
const PLOT_W = W - PAD.left - PAD.right;
const PLOT_H = H - PAD.top - PAD.bottom;

/** A round-ish number at or above the tallest bar, so the axis reads cleanly. */
const niceCeiling = (max: number): number => {
  if (max <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
};

export default function RevenueChart({ data }: { data: Point[] }) {
  const peak = niceCeiling(
    Math.max(...data.map((point) => Math.max(point.retail, point.wholesale)))
  );
  const slot = PLOT_W / data.length;
  const barWidth = Math.min(14, slot / 3.2);
  const y = (value: number) => PAD.top + PLOT_H - (value / peak) * PLOT_H;
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="brand-scroll overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Monthly revenue, retail against wholesale"
        className="h-auto w-full min-w-[560px]"
      >
        {gridLines.map((step) => {
          const value = peak * step;
          return (
            <g key={step}>
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(value)}
                y2={y(value)}
                stroke="rgb(var(--secondary-rgb) / 0.08)"
                strokeWidth="1"
              />
              <text
                x={PAD.left - 10}
                y={y(value) + 4}
                textAnchor="end"
                className="fill-[rgb(var(--gray-rgb))] text-[10px]"
              >
                {moneyShort(value).replace('AED ', '')}
              </text>
            </g>
          );
        })}

        {data.map((point, index) => {
          const centre = PAD.left + slot * index + slot / 2;
          return (
            <g key={point.month}>
              <rect
                x={centre - barWidth - 2}
                y={y(point.wholesale)}
                width={barWidth}
                height={PAD.top + PLOT_H - y(point.wholesale)}
                rx="3"
                fill="rgb(var(--primary-rgb))"
              />
              <rect
                x={centre + 2}
                y={y(point.retail)}
                width={barWidth}
                height={PAD.top + PLOT_H - y(point.retail)}
                rx="3"
                fill="rgb(var(--secondary-rgb) / 0.35)"
              />
              <text
                x={centre}
                y={H - 8}
                textAnchor="middle"
                className="fill-[rgb(var(--gray-rgb))] text-[10px]"
              >
                {point.month}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function ChartLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-4 px-1 pt-3 text-12 text-gray">
      <li className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-sm bg-primary" aria-hidden="true" />
        Wholesale
      </li>
      <li className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-sm bg-secondary/35"
          aria-hidden="true"
        />
        Retail
      </li>
    </ul>
  );
}
