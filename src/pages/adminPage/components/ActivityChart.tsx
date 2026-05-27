interface ActivityChartProps {
  signups: { date: string; count: number }[];
  workspaces: { date: string; count: number }[];
}

export const ActivityChart = ({ signups, workspaces }: ActivityChartProps) => {
  const maxCount = Math.max(
    1,
    ...signups.map((d) => d.count),
    ...workspaces.map((d) => d.count),
  );

  const chartW = 700;
  const chartH = 140;
  const padL = 28;
  const padR = 8;
  const padT = 8;
  const padB = 24;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const toX = (i: number) => padL + (i / Math.max(1, signups.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - (v / maxCount) * innerH;

  const buildPath = (data: { count: number }[]) =>
    data
      .map((d, i) => `${i === 0 ? "M" : "L"}${toX(i).toFixed(1)},${toY(d.count).toFixed(1)}`)
      .join(" ");

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(maxCount * f));

  const labelIndices: number[] = [];
  if (signups.length > 0) {
    const step = Math.max(1, Math.floor(signups.length / 6));
    for (let i = 0; i < signups.length; i += step) labelIndices.push(i);
    if (!labelIndices.includes(signups.length - 1)) labelIndices.push(signups.length - 1);
  }

  return (
    <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
      {gridLines.map((v) => (
        <g key={v}>
          <line
            x1={padL}
            y1={toY(v)}
            x2={chartW - padR}
            y2={toY(v)}
            className="stroke-black/[0.06] dark:stroke-white/[0.06]"
            strokeWidth={0.5}
          />
          <text
            x={padL - 4}
            y={toY(v) + 3}
            textAnchor="end"
            className="fill-[#b5bbb7] dark:fill-[#4a514d] text-[8px]"
          >
            {v}
          </text>
        </g>
      ))}

      {labelIndices.map((i) => (
        <text
          key={i}
          x={toX(i)}
          y={chartH - 4}
          textAnchor="middle"
          className="fill-[#b5bbb7] dark:fill-[#4a514d] text-[7px]"
        >
          {signups[i].date.slice(5)}
        </text>
      ))}

      {signups.length > 1 && (
        <>
          <path d={buildPath(signups)} fill="none" stroke="#5a8a6b" strokeWidth={1.5} strokeLinejoin="round" />
          <path d={buildPath(workspaces)} fill="none" stroke="#7a9bbf" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4 2" />
        </>
      )}

      {signups.map((d, i) =>
        d.count > 0 ? (
          <circle key={`s-${i}`} cx={toX(i)} cy={toY(d.count)} r={2.5} fill="#5a8a6b" />
        ) : null,
      )}
      {workspaces.map((d, i) =>
        d.count > 0 ? (
          <circle key={`w-${i}`} cx={toX(i)} cy={toY(d.count)} r={2.5} fill="#7a9bbf" />
        ) : null,
      )}
    </svg>
  );
};
