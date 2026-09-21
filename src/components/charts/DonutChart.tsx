interface Slice {
  label: string;
  value: number;
  tone: string;
}

/* A ring built from one circle per slice, each rotated into place with a
   dash offset. No paths to get wrong, and it scales with the viewBox. */

const SIZE = 160;
const STROKE = 22;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function DonutChart({
  slices,
  centreLabel,
  centreValue
}: {
  slices: Slice[];
  centreLabel: string;
  centreValue: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  if (total === 0)
    return <p className="py-10 text-center text-13 text-gray">No orders yet.</p>;

  let consumed = 0;

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-2">
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Order mix: ${slices
          .map((slice) => `${slice.label} ${slice.value}`)
          .join(', ')}`}
        className="h-[160px] w-[160px] shrink-0 -rotate-90"
      >
        {slices.map((slice) => {
          const length = (slice.value / total) * CIRCUMFERENCE;
          const offset = consumed;
          consumed += length;

          return (
            <circle
              key={slice.label}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={slice.tone}
              strokeWidth={STROKE}
              // 2px gap so touching slices stay distinguishable
              strokeDasharray={`${Math.max(0, length - 2)} ${CIRCUMFERENCE}`}
              strokeDashoffset={-offset}
            />
          );
        })}

        <text
          x={SIZE / 2}
          y={SIZE / 2 - 4}
          textAnchor="middle"
          transform={`rotate(90 ${SIZE / 2} ${SIZE / 2})`}
          className="fill-[rgb(var(--secondary-rgb))] text-[20px] font-semibold"
        >
          {centreValue}
        </text>
        <text
          x={SIZE / 2}
          y={SIZE / 2 + 14}
          textAnchor="middle"
          transform={`rotate(90 ${SIZE / 2} ${SIZE / 2})`}
          className="fill-[rgb(var(--gray-rgb))] text-[10px]"
        >
          {centreLabel}
        </text>
      </svg>

      <ul className="flex flex-col gap-2.5">
        {slices.map((slice) => (
          <li key={slice.label} className="flex items-center gap-2.5 text-13">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: slice.tone }}
            />
            <span className="text-gray">{slice.label}</span>
            <span className="ml-auto font-medium text-secondary">
              {slice.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
