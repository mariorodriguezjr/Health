"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Calendar,
  HeartPulse,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  patients,
  trackedMarkers,
  type Lab,
  type PatientKey,
} from "@/data/patients";

type ViewMode = PatientKey | "compare";

const compareColors = {
  mario: "#111827",
  cici: "#D4A017",
};

const markerDesign: Record<
  string,
  {
    accent: string;
    soft: string;
    glow: string;
    description: string;
    goodDirection?: "up" | "down" | "neutral";
    category: string;
  }
> = {
  A1C: {
    accent: "#7C3AED",
    soft: "#F3E8FF",
    glow: "rgba(124,58,237,0.28)",
    description: "Long-term glucose rhythm",
    goodDirection: "down",
    category: "Glucose",
  },
  Glucose: {
    accent: "#0284C7",
    soft: "#E0F2FE",
    glow: "rgba(2,132,199,0.25)",
    description: "Fasting metabolic signal",
    goodDirection: "neutral",
    category: "Glucose",
  },
  LDL: {
    accent: "#F97316",
    soft: "#FFEDD5",
    glow: "rgba(249,115,22,0.25)",
    description: "Atherogenic cholesterol",
    goodDirection: "down",
    category: "Cholesterol",
  },
  HDL: {
    accent: "#16A34A",
    soft: "#DCFCE7",
    glow: "rgba(22,163,74,0.22)",
    description: "Protective cholesterol",
    goodDirection: "up",
    category: "Cholesterol",
  },
  Triglycerides: {
    accent: "#EA580C",
    soft: "#FED7AA",
    glow: "rgba(234,88,12,0.22)",
    description: "Circulating blood fats",
    goodDirection: "down",
    category: "Cholesterol",
  },
  Creatinine: {
    accent: "#0D9488",
    soft: "#CCFBF1",
    glow: "rgba(13,148,136,0.22)",
    description: "Kidney filtration marker",
    goodDirection: "neutral",
    category: "Kidney",
  },
  AST: {
    accent: "#65A30D",
    soft: "#ECFCCB",
    glow: "rgba(101,163,13,0.2)",
    description: "Liver enzyme pattern",
    goodDirection: "neutral",
    category: "Liver",
  },
  ALT: {
    accent: "#2563EB",
    soft: "#DBEAFE",
    glow: "rgba(37,99,235,0.22)",
    description: "Liver enzyme pattern",
    goodDirection: "neutral",
    category: "Liver",
  },
  TSH: {
    accent: "#9333EA",
    soft: "#F3E8FF",
    glow: "rgba(147,51,234,0.22)",
    description: "Thyroid signaling",
    goodDirection: "neutral",
    category: "Thyroid",
  },
  "Free T4": {
  accent: "#6366F1",
  soft: "#E0E7FF",
  glow: "rgba(99,102,241,0.22)",
  description: "Active thyroid hormone",
  goodDirection: "neutral",
  category: "Thyroid",
},
  "Vitamin D": {
    accent: "#F59E0B",
    soft: "#FEF3C7",
    glow: "rgba(245,158,11,0.24)",
    description: "Vitamin reserve status",
    goodDirection: "up",
    category: "Vitamins",
  },
};

function formatDate(date: string) {
  return new Date(date).getFullYear().toString();
}

function formatFullDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStatus(lab?: Lab) {
  if (!lab) return "No Data";
  if (lab.value > lab.normalHigh) return "Elevated";
  if (lab.value < lab.normalLow) return "Below Zone";
  return "Optimal";
}

function getLatestLabs(labs: Lab[]) {
  const latestByMarker = labs
    .slice()
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, lab) => {
      acc[lab.marker] = lab;
      return acc;
    }, {} as Record<string, Lab>);

  return trackedMarkers.map((marker) => latestByMarker[marker]);
}

function getLatestLab(labs: Lab[], marker: string) {
  return labs
    .filter((lab) => lab.marker === marker)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
}

function getHistory(labs: Lab[], marker: string) {
  return labs
    .filter((lab) => lab.marker === marker)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((lab) => ({
      date: formatDate(lab.date),
      value: lab.value,
    }));
}

function getCompareHistory(marker: string) {
  const marioHistory = patients.mario.labs.filter((lab) => lab.marker === marker);
  const ciciHistory = patients.cici.labs.filter((lab) => lab.marker === marker);

  const years = Array.from(
    new Set(
      [...marioHistory, ...ciciHistory].map((lab) =>
        new Date(lab.date).getFullYear().toString()
      )
    )
  ).sort();

  return years.map((year) => {
    const marioYearLabs = marioHistory.filter(
      (lab) => new Date(lab.date).getFullYear().toString() === year
    );

    const ciciYearLabs = ciciHistory.filter(
      (lab) => new Date(lab.date).getFullYear().toString() === year
    );

    return {
      date: year,
      Mario: marioYearLabs.at(-1)?.value ?? null,
      Cici: ciciYearLabs.at(-1)?.value ?? null,
    };
  });
}

function getChange(labs: Lab[], marker: string) {
  const history = labs
    .filter((lab) => lab.marker === marker)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (history.length < 2) return null;

  const previous = history[history.length - 2].value;
  const latest = history[history.length - 1].value;
  const raw = Number((latest - previous).toFixed(2));

  return { raw, label: raw > 0 ? `+${raw}` : raw < 0 ? `${raw}` : "0" };
}

function getRangeText(lab: Lab) {
  if (lab.normalLow === 0) return `Optimal under ${lab.normalHigh} ${lab.unit}`;
  return `Optimal ${lab.normalLow}–${lab.normalHigh} ${lab.unit}`;
}

function getTrendTone(labs: Lab[], lab: Lab) {
  const change = getChange(labs, lab.marker);
  const design = markerDesign[lab.marker];

  if (!change || change.raw === 0 || design?.goodDirection === "neutral") {
    return "#64748B";
  }

  if (design?.goodDirection === "up") {
    return change.raw > 0 ? "#16A34A" : "#F97316";
  }

  if (design?.goodDirection === "down") {
    return change.raw < 0 ? "#16A34A" : "#F97316";
  }

  return change.raw > 0 ? "#F97316" : "#16A34A";
}

function getLatestDate(labs: Lab[]) {
  return [...labs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]?.date;
}

function getCompareStats() {
  const shared = trackedMarkers.filter(
    (marker) =>
      getLatestLab(patients.mario.labs, marker) &&
      getLatestLab(patients.cici.labs, marker)
  );

  const differences = shared.map((marker) => {
    const mario = getLatestLab(patients.mario.labs, marker)!;
    const cici = getLatestLab(patients.cici.labs, marker)!;
    return {
      marker,
      diff: Math.abs(mario.value - cici.value),
    };
  });

  const closest = [...differences].sort((a, b) => a.diff - b.diff)[0];
  const largest = [...differences].sort((a, b) => b.diff - a.diff)[0];

  return { shared, closest, largest };
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewMode>("mario");
  const isCompare = activeView === "compare";

  const patient = !isCompare ? patients[activeView] : null;
  const activeLabs = patient?.labs ?? [];

  const latestDate = useMemo(() => {
    if (isCompare) {
      const dates = [
        getLatestDate(patients.mario.labs),
        getLatestDate(patients.cici.labs),
      ].filter(Boolean) as string[];

      return dates.sort(
        (a, b) => new Date(b).getTime() - new Date(a).getTime()
      )[0];
    }

    return getLatestDate(activeLabs);
  }, [activeLabs, isCompare]);

  const latestLabs = useMemo(() => getLatestLabs(activeLabs), [activeLabs]);
  const completedMarkers = latestLabs.filter(Boolean) as Lab[];

  const optimalCount = completedMarkers.filter(
    (lab) => getStatus(lab) === "Optimal"
  ).length;

  const outOfZoneCount = completedMarkers.length - optimalCount;

  const optimalPercent = completedMarkers.length
    ? Math.round((optimalCount / completedMarkers.length) * 100)
    : 0;

  const compareStats = getCompareStats();

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7fb] text-slate-950">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-white blur-3xl" />
        <div className="absolute left-[-160px] top-48 h-[460px] w-[460px] rounded-full bg-sky-100/60 blur-3xl" />
        <div className="absolute right-[-180px] top-24 h-[520px] w-[520px] rounded-full bg-violet-100/60 blur-3xl" />
      </div>

      <section className="relative mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        <header className="mb-6 rounded-[2.5rem] border border-white/70 bg-white/55 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-3xl">
          <div className="mb-7 flex w-fit rounded-full border border-white/80 bg-white/70 p-1 shadow-sm backdrop-blur-xl">
            {(["mario", "cici", "compare"] as ViewMode[]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  activeView === key
                    ? "bg-slate-950 text-white shadow-lg"
                    : "text-slate-500 hover:text-slate-950"
                }`}
              >
                {key === "compare"
                  ? "Compare"
                  : patients[key as PatientKey].name}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur-xl">
                <Sparkles size={14} />
                Biometric intelligence
              </div>

              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-slate-950 sm:text-6xl">
                {isCompare
                  ? "Mario + Cici biometrics"
                  : `${patient?.name}’s metabolic picture, beautifully tracked.`}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                {isCompare
                  ? "A refined side-by-side view of shared biomarkers, movement, and contrast across both profiles."
                  : "A premium visual layer for bloodwork, trends, optimal zones, and subtle changes between lab draws."}
              </p>
            </div>

            <div className="rounded-full border border-white/80 bg-white/75 px-5 py-3 shadow-sm backdrop-blur-xl">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Calendar size={16} />
                Latest sample: {latestDate ? formatFullDate(latestDate) : "No labs yet"}
              </div>
            </div>
          </div>
        </header>

        <div key={activeView} className="animate-[fadeIn_520ms_cubic-bezier(0.22,1,0.36,1)]">
          {isCompare ? (
            <CompareDashboard compareStats={compareStats} />
          ) : (
            <IndividualDashboard
              patientName={patient!.name}
              labs={activeLabs}
              latestLabs={latestLabs}
              completedMarkers={completedMarkers}
              optimalCount={optimalCount}
              optimalPercent={optimalPercent}
              outOfZoneCount={outOfZoneCount}
            />
          )}
        </div>
      </section>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
            filter: blur(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }
      `}</style>
    </main>
  );
}

function IndividualDashboard({
  patientName,
  labs,
  latestLabs,
  completedMarkers,
  optimalCount,
  optimalPercent,
  outOfZoneCount,
}: {
  patientName: string;
  labs: Lab[];
  latestLabs: (Lab | undefined)[];
  completedMarkers: Lab[];
  optimalCount: number;
  optimalPercent: number;
  outOfZoneCount: number;
}) {
  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <KpiCard
          icon={<HeartPulse size={20} />}
          label="Optimal markers"
          value={`${optimalPercent}%`}
          sub={`${optimalCount} of ${completedMarkers.length} in optimal zone`}
        />
        <KpiCard
          icon={<Activity size={20} />}
          label="Out of zone"
          value={String(outOfZoneCount)}
          sub={outOfZoneCount ? "Worth monitoring" : "No flagged markers"}
        />
        <KpiCard
          icon={<TrendingUp size={20} />}
          label="Tracked biomarkers"
          value={String(completedMarkers.length)}
          sub={`${trackedMarkers.length} available slots`}
        />
        <KpiCard
          icon={<Calendar size={20} />}
          label="Lab history"
          value={String(new Set(labs.map((lab) => lab.date)).size)}
          sub="Total blood draws"
        />
      </section>

      <section className="rounded-[2.5rem] border border-white/70 bg-white/50 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-3xl sm:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">
              Biomarker trends
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Each tile is scaled to its own optimal zone for cleaner visual reading.
            </p>
          </div>
          <div className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white shadow-lg">
            {patientName}
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {trackedMarkers.map((marker) => (
            <MarkerCard
              key={marker}
              marker={marker}
              lab={latestLabs.find((item) => item?.marker === marker)}
              labs={labs}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function CompareDashboard({
  compareStats,
}: {
  compareStats: ReturnType<typeof getCompareStats>;
}) {
  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <KpiCard
          icon={<Users size={20} />}
          label="Shared markers"
          value={String(compareStats.shared.length)}
          sub="Available for comparison"
        />
        <KpiCard
          icon={<HeartPulse size={20} />}
          label="Closest match"
          value={compareStats.closest?.marker ?? "—"}
          sub={compareStats.closest ? `${compareStats.closest.diff.toFixed(2)} apart` : "No overlap yet"}
        />
        <KpiCard
          icon={<Activity size={20} />}
          label="Largest variance"
          value={compareStats.largest?.marker ?? "—"}
          sub={compareStats.largest ? `${compareStats.largest.diff.toFixed(2)} apart` : "No overlap yet"}
        />
        <KpiCard
          icon={<Calendar size={20} />}
          label="Profiles"
          value="2"
          sub="Mario + Cici"
        />
      </section>

      <section className="rounded-[2.5rem] border border-white/70 bg-white/50 p-5 shadow-[0_30px_90px_rgba(15,23,42,0.08)] backdrop-blur-3xl sm:p-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-0.03em]">
              Shared biomarker comparison
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Graphite represents Mario. Soft gold represents Cici.
            </p>
          </div>

          <div className="flex gap-2 rounded-full bg-white/70 p-1 shadow-sm ring-1 ring-black/5">
            <LegendDot color={compareColors.mario} label="Mario" />
            <LegendDot color={compareColors.cici} label="Cici" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {trackedMarkers.map((marker) => (
            <CompareCard key={marker} marker={marker} />
          ))}
        </div>
      </section>
    </>
  );
}

function KpiCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/70 bg-white/65 p-4 shadow-[0_18px_60px_rgba(15,23,42,0.06)] backdrop-blur-3xl sm:rounded-[2rem] sm:p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg sm:mb-5 sm:h-11 sm:w-11 sm:rounded-2xl">
        {icon}
      </div>

      <p className="text-xs font-medium text-slate-500 sm:text-sm">
        {label}
      </p>

      <p className="mt-1 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
        {sub}
      </p>
    </div>
  );
}

function MarkerCard({
  marker,
  lab,
  labs,
}: {
  marker: string;
  lab?: Lab;
  labs: Lab[];
}) {
  const design = markerDesign[marker];
  const history = getHistory(labs, marker);
  const status = getStatus(lab);
  const change = lab ? getChange(labs, lab.marker) : null;
  const trendTone = lab ? getTrendTone(labs, lab) : "#64748B";
  const gradientId = `gradient-${marker.replace(/\s+/g, "-")}`;

  return (
    <article className="group relative h-[430px] overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/70 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/85 hover:shadow-[0_35px_100px_rgba(15,23,42,0.14)]">
      <div
        className="pointer-events-none absolute inset-x-8 top-8 h-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: design.glow }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-80"
        style={{
          background: `linear-gradient(180deg, ${design.soft} 0%, rgba(255,255,255,0) 100%)`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {lab?.category || design.category}
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {marker}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{design.description}</p>
          </div>

          <StatusPill status={status} />
        </div>

        {lab ? (
          <>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-semibold tracking-[-0.06em]">
                    {lab.value}
                  </span>
                  <span className="mb-1.5 text-sm font-medium text-slate-500">
                    {lab.unit}
                  </span>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {getRangeText(lab)}
                </p>
              </div>

              {change && (
                <div className="rounded-2xl bg-white/70 px-3 py-2 text-right shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
                  <p className="text-sm font-bold" style={{ color: trendTone }}>
                    {change.label}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    since last
                  </p>
                </div>
              )}
            </div>

            <SingleChart
              marker={marker}
              history={history}
              lab={lab}
              design={design}
              gradientId={gradientId}
            />
          </>
        ) : (
          <div className="mt-auto flex h-[290px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white/45 text-center backdrop-blur-xl">
            <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-400">
              No history yet
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Add this marker when it appears on a future lab report.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function CompareCard({ marker }: { marker: string }) {
  const design = markerDesign[marker];

  const marioLab = getLatestLab(patients.mario.labs, marker);
  const ciciLab = getLatestLab(patients.cici.labs, marker);
  const data = getCompareHistory(marker);

  const referenceLab = marioLab || ciciLab;
  const gradientId = `compare-gradient-${marker.replace(/\s+/g, "-")}`;

  return (
    <article className="group relative h-[430px] overflow-hidden rounded-[2.25rem] border border-white/80 bg-white/70 p-5 shadow-[0_22px_70px_rgba(15,23,42,0.08)] backdrop-blur-3xl transition-all duration-500 hover:-translate-y-1.5 hover:bg-white/85 hover:shadow-[0_35px_100px_rgba(15,23,42,0.14)]">
      <div
        className="pointer-events-none absolute inset-x-8 top-8 h-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: design.glow }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-80"
        style={{
          background: `linear-gradient(180deg, ${design.soft} 0%, rgba(255,255,255,0) 100%)`,
        }}
      />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              {design.category}
            </p>
            <h3 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
              {marker}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{design.description}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <CompareValueBlock name="Mario" lab={marioLab} color={compareColors.mario} />
          <CompareValueBlock name="Cici" lab={ciciLab} color={compareColors.cici} />
        </div>

        {referenceLab ? (
          <div className="mt-auto pt-6">
            <div className="relative h-[185px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/55 shadow-inner backdrop-blur-xl">
              <div
                className="absolute inset-0 opacity-80"
                style={{
                  background: `linear-gradient(180deg, ${design.soft} 0%, rgba(255,255,255,0.55) 65%, rgba(255,255,255,0.85) 100%)`,
                }}
              />

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{ top: 24, right: 20, left: 20, bottom: 12 }}
                >
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={design.accent} stopOpacity={0.16} />
                      <stop offset="78%" stopColor={design.accent} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>

                  <ReferenceArea
                    y1={referenceLab.normalLow}
                    y2={referenceLab.normalHigh}
                    fill="#ffffff"
                    fillOpacity={0.48}
                    strokeOpacity={0}
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
                  />

                  <YAxis
                    hide
                    domain={[
                      (min: number) =>
                        Math.min(min, referenceLab.normalLow) -
                        Math.abs(referenceLab.normalHigh - referenceLab.normalLow) * 0.3,
                      (max: number) =>
                        Math.max(max, referenceLab.normalHigh) +
                        Math.abs(referenceLab.normalHigh - referenceLab.normalLow) * 0.3,
                    ]}
                  />

                  <Tooltip
                    cursor={{
                      stroke: "#94A3B8",
                      strokeWidth: 1.5,
                      strokeDasharray: "5 5",
                    }}
                    contentStyle={{
                      borderRadius: "20px",
                      border: "1px solid rgba(255,255,255,0.9)",
                      background: "rgba(255,255,255,0.86)",
                      backdropFilter: "blur(18px)",
                      boxShadow: "0 22px 70px rgba(15,23,42,0.16)",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="Mario"
                    stroke={compareColors.mario}
                    strokeWidth={4}
                    fill={`url(#${gradientId})`}
                    dot={{
                      r: 5,
                      strokeWidth: 3,
                      stroke: "#ffffff",
                      fill: compareColors.mario,
                    }}
                    activeDot={{
                      r: 7,
                      strokeWidth: 4,
                      stroke: "#ffffff",
                      fill: compareColors.mario,
                    }}
                    connectNulls
                  />

                  <Line
                    type="monotone"
                    dataKey="Cici"
                    stroke={compareColors.cici}
                    strokeWidth={4}
                    dot={{
                      r: 5,
                      strokeWidth: 3,
                      stroke: "#ffffff",
                      fill: compareColors.cici,
                    }}
                    activeDot={{
                      r: 7,
                      strokeWidth: 4,
                      stroke: "#ffffff",
                      fill: compareColors.cici,
                    }}
                    connectNulls
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="mt-auto flex h-[245px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-white/45 text-center backdrop-blur-xl">
            <p className="text-3xl font-semibold tracking-[-0.04em] text-slate-400">
              No shared data
            </p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Add this marker to one profile to begin comparison.
            </p>
          </div>
        )}
      </div>
    </article>
  );
}

function CompareValueBlock({
  name,
  lab,
  color,
}: {
  name: string;
  lab?: Lab;
  color: string;
}) {
  return (
    <div className="rounded-2xl bg-white/70 p-3 shadow-sm ring-1 ring-black/5 backdrop-blur-xl">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ background: color }}
          />
          <p className="text-xs font-bold text-slate-500">{name}</p>
        </div>

        <MiniStatus status={getStatus(lab)} />
      </div>

      {lab ? (
        <div className="flex items-end gap-1">
          <span className="text-2xl font-semibold tracking-[-0.05em]">
            {lab.value}
          </span>
          <span className="mb-1 text-[11px] font-medium text-slate-400">
            {lab.unit}
          </span>
        </div>
      ) : (
        <p className="text-sm font-semibold text-slate-300">No data</p>
      )}
    </div>
  );
}

function SingleChart({
  history,
  lab,
  design,
  gradientId,
}: {
  marker: string;
  history: { date: string; value: number }[];
  lab: Lab;
  design: (typeof markerDesign)[string];
  gradientId: string;
}) {
  return (
    <div className="mt-auto pt-6">
      <div className="relative h-[185px] overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/55 shadow-inner backdrop-blur-xl">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `linear-gradient(180deg, ${design.soft} 0%, rgba(255,255,255,0.55) 65%, rgba(255,255,255,0.85) 100%)`,
          }}
        />

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={history}
            margin={{ top: 24, right: 20, left: 20, bottom: 12 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={design.accent} stopOpacity={0.36} />
                <stop offset="78%" stopColor={design.accent} stopOpacity={0.04} />
              </linearGradient>
            </defs>

            <ReferenceArea
              y1={lab.normalLow}
              y2={lab.normalHigh}
              fill="#ffffff"
              fillOpacity={0.48}
              strokeOpacity={0}
            />

            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
              tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
            />

            <YAxis
              hide
              domain={[
                (min: number) =>
                  Math.min(min, lab.normalLow) -
                  Math.abs(lab.normalHigh - lab.normalLow) * 0.3,
                (max: number) =>
                  Math.max(max, lab.normalHigh) +
                  Math.abs(lab.normalHigh - lab.normalLow) * 0.3,
              ]}
            />

            <Tooltip
              cursor={{
                stroke: design.accent,
                strokeWidth: 1.5,
                strokeDasharray: "5 5",
              }}
              contentStyle={{
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.9)",
                background: "rgba(255,255,255,0.86)",
                backdropFilter: "blur(18px)",
                boxShadow: "0 22px 70px rgba(15,23,42,0.16)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            />

            <Area
              type="monotone"
              dataKey="value"
              stroke={design.accent}
              strokeWidth={4}
              fill={`url(#${gradientId})`}
              dot={{
                r: 5,
                strokeWidth: 3,
                stroke: "#ffffff",
                fill: design.accent,
              }}
              activeDot={{
                r: 7,
                strokeWidth: 4,
                stroke: "#ffffff",
                fill: design.accent,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full px-3 py-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-xs font-bold text-slate-600">{label}</span>
    </div>
  );
}

function MiniStatus({ status }: { status: string }) {
  const color =
    status === "Optimal"
      ? "text-emerald-600"
      : status === "Elevated"
        ? "text-orange-600"
        : status === "Below Zone"
          ? "text-sky-600"
          : "text-slate-300";

  return <span className={`text-[10px] font-bold ${color}`}>{status}</span>;
}

function StatusPill({ status }: { status: string }) {
  const style =
    status === "Optimal"
      ? "bg-emerald-500 text-white shadow-emerald-500/25"
      : status === "Elevated"
        ? "bg-orange-500 text-white shadow-orange-500/25"
        : status === "Below Zone"
          ? "bg-sky-500 text-white shadow-sky-500/25"
          : "bg-slate-300 text-slate-700 shadow-slate-300/25";

  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-lg ${style}`}>
      {status}
    </span>
  );
}