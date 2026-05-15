"use client";

import { Calendar, Sparkles } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { labs } from "@/data/labs";

const heroMarkers = ["A1C", "Glucose", "LDL"];

const markerColors: Record<string, { stroke: string; fill: string }> = {
  A1C: { stroke: "#7C3AED", fill: "#F3E8FF" },
  Glucose: { stroke: "#0EA5E9", fill: "#E0F2FE" },
  LDL: { stroke: "#F97316", fill: "#FFEDD5" },
  HDL: { stroke: "#22C55E", fill: "#DCFCE7" },
  Triglycerides: { stroke: "#FB923C", fill: "#FED7AA" },
  Creatinine: { stroke: "#14B8A6", fill: "#CCFBF1" },
  AST: { stroke: "#22C55E", fill: "#DCFCE7" },
  ALT: { stroke: "#3B82F6", fill: "#DBEAFE" },
  TSH: { stroke: "#A855F7", fill: "#F3E8FF" },
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const latestLabs = Object.values(
  labs.reduce((acc, lab) => {
    acc[lab.marker] = lab;
    return acc;
  }, {} as Record<string, (typeof labs)[number]>)
);

const sortedLabs = [...latestLabs].sort((a, b) => {
  const aHero = heroMarkers.includes(a.marker) ? 0 : 1;
  const bHero = heroMarkers.includes(b.marker) ? 0 : 1;
  return aHero - bHero;
});

const latestDate = [...labs].sort(
  (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
)[0]?.date;

function getStatus(lab: (typeof labs)[number]) {
  if (lab.value > lab.normalHigh) return "High";
  if (lab.value < lab.normalLow) return "Low";
  return "Normal";
}

function getHistory(marker: string) {
  return labs
    .filter((lab) => lab.marker === marker)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((lab) => ({
      date: formatDate(lab.date),
      value: lab.value,
    }));
}

function getChange(marker: string) {
  const history = labs
    .filter((lab) => lab.marker === marker)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (history.length < 2) return null;

  const previous = history[history.length - 2].value;
  const latest = history[history.length - 1].value;
  const change = Number((latest - previous).toFixed(2));

  return {
    value: change,
    label:
      change > 0 ? `↑ ${change}` : change < 0 ? `↓ ${Math.abs(change)}` : "— 0",
  };
}

function getRangeText(lab: (typeof labs)[number]) {
  if (lab.normalLow === 0) return `< ${lab.normalHigh} ${lab.unit}`;
  return `${lab.normalLow} – ${lab.normalHigh} ${lab.unit}`;
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#ffffff_0%,#f5f5f7_45%,#eef1f5_100%)] text-slate-950">
      <section className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-5 rounded-[2.25rem] bg-white/70 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur-2xl md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-black/5">
              <Sparkles size={14} />
              Designer-built biometric dashboard
            </div>

            <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
              Lab Dashboard
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              A premium Apple-style view of your bloodwork, trends, reference
              ranges, and marker movement over time.
            </p>
          </div>

          <div className="rounded-full bg-white/90 px-5 py-3 text-slate-800 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar size={16} />
              Latest lab date: {formatDate(latestDate)}
            </div>
          </div>
        </header>

        <section className="rounded-[2.25rem] bg-white/65 p-6 shadow-[0_20px_80px_rgba(15,23,42,0.07)] ring-1 ring-black/5 backdrop-blur-2xl">
          <div className="mb-7">
            <h2 className="text-2xl font-semibold tracking-tight">
              Latest Markers
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Each marker has its own reference-aware mini trend graph.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {sortedLabs.map((lab) => (
              <MarkerCard
                key={lab.marker}
                lab={lab}
                isHero={heroMarkers.includes(lab.marker)}
              />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function MarkerCard({
  lab,
  isHero,
}: {
  lab: (typeof labs)[number];
  isHero: boolean;
}) {
  const status = getStatus(lab);
  const history = getHistory(lab.marker);
  const change = getChange(lab.marker);
  const colors = markerColors[lab.marker] || {
    stroke: "#64748B",
    fill: "#E2E8F0",
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)] ring-1 ring-black/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_90px_rgba(15,23,42,0.14)] ${
        isHero ? "min-h-[390px]" : "min-h-[330px]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-70 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `linear-gradient(180deg, ${colors.fill} 0%, transparent 100%)`,
        }}
      />

      <div className="relative z-10 mb-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold" style={{ color: colors.stroke }}>
            {lab.category}
          </p>
          <h3 className={`${isHero ? "text-3xl" : "text-2xl"} mt-1 font-semibold tracking-tight`}>
            {lab.marker}
          </h3>
        </div>

        <StatusPill status={status} />
      </div>

      <div className="relative z-10 mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="flex items-end gap-2">
            <span
              className={`font-semibold tracking-tight ${
                isHero ? "text-5xl" : "text-4xl"
              }`}
            >
              {lab.value}
            </span>
            <span className="mb-1 text-sm text-slate-500">{lab.unit}</span>
          </div>

          <p className="mt-2 text-sm text-slate-500">
            Ref. range: {getRangeText(lab)}
          </p>
        </div>

        {change && (
          <div className="text-right">
            <p
              className="text-sm font-semibold"
              style={{
                color:
                  change.value > 0
                    ? "#F97316"
                    : change.value < 0
                      ? "#16A34A"
                      : "#64748B",
              }}
            >
              {change.label}
            </p>
            <p className="text-xs text-slate-400">from last test</p>
          </div>
        )}
      </div>

      <div
        className={`${isHero ? "h-44" : "h-36"} relative z-10 mt-5 overflow-hidden rounded-[1.5rem]`}
        style={{
          background: `linear-gradient(180deg, ${colors.fill}70 0%, rgba(255,255,255,0.35) 100%)`,
        }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={history}
            margin={{ top: 22, right: 22, left: 22, bottom: 10 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${lab.marker}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={colors.stroke} stopOpacity={0.35} />
                <stop offset="80%" stopColor={colors.stroke} stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              tick={{ fontSize: 11, fill: "#64748B" }}
            />

            <YAxis
              hide
              domain={[
                (dataMin: number) => Math.min(dataMin, lab.normalLow) - 1,
                (dataMax: number) => Math.max(dataMax, lab.normalHigh) + 1,
              ]}
            />

            <Tooltip
              cursor={{
                stroke: colors.stroke,
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                borderRadius: "18px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 18px 50px rgba(15,23,42,0.14)",
                fontSize: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={isHero ? 4 : 3}
              fill={`url(#gradient-${lab.marker})`}
              dot={{
                r: isHero ? 5 : 4,
                strokeWidth: 3,
                stroke: colors.stroke,
                fill: "#ffffff",
              }}
              activeDot={{
                r: 7,
                strokeWidth: 3,
                stroke: "#ffffff",
                fill: colors.stroke,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

function StatusPill({ status }: { status: string }) {
  const style =
    status === "Normal"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : status === "High"
        ? "bg-orange-50 text-orange-700 ring-orange-100"
        : "bg-sky-50 text-sky-700 ring-sky-100";

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ${style}`}
    >
      {status}
    </span>
  );
}