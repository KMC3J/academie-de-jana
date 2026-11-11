import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { apiGet } from "@/lib/api";
import { formatDuration, useProfileId, useSubjects } from "@/lib/academy";
import type { ScreenDay, Subject } from "@/lib/types";

export function ScreenTimeView({ days, subjects }: { days: ScreenDay[]; subjects: Subject[] | undefined }) {
  const name = (id: string) => (id === "general" ? "Navigation libre" : subjects?.find((s) => s.id === id)?.name ?? "Autre");
  const color = (id: string) => subjects?.find((s) => s.id === id)?.color ?? "#A7A1C8";
  const data = days.map((d) => ({
    jour: new Date(d.date).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" }),
    minutes: Math.round(d.total_seconds / 60),
  }));
  const week: Record<string, number> = {};
  days.forEach((d) => Object.entries(d.by_subject).forEach(([k, v]) => (week[k] = (week[k] ?? 0) + v)));
  const total = Object.values(week).reduce((a, b) => a + b, 0);
  const today = days[days.length - 1];

  return (
    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
      <div className="rounded-3xl border border-[#8B5CF6]/20 bg-[#18142A] p-5">
        <div className="flex items-baseline justify-between">
          <h2 className="font-heading text-xl font-bold text-white">7 derniers jours</h2>
          <span className="font-mono text-sm text-[#FDE68A]" data-testid="screen-week-total">{formatDuration(total)} au total</span>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="rgba(139,92,246,0.12)" vertical={false} />
              <XAxis dataKey="jour" stroke="#A7A1C8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#A7A1C8" fontSize={12} tickLine={false} axisLine={false} unit=" min" width={56} />
              <Tooltip
                cursor={{ fill: "rgba(245,158,11,0.08)" }}
                contentStyle={{ background: "#1A1530", border: "1px solid rgba(139,92,246,0.4)", borderRadius: 12, color: "#fff" }}
                formatter={(value: number) => [`${value} min`, "Temps"]}
              />
              <Bar dataKey="minutes" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-3xl border border-[#8B5CF6]/20 bg-[#18142A] p-5">
        <h2 className="font-heading text-xl font-bold text-white">Par matière (semaine)</h2>
        <p className="mt-1 text-sm text-[#A7A1C8]" data-testid="screen-today-total">Aujourd'hui : {formatDuration(today?.total_seconds ?? 0)}</p>
        <ul className="mt-4 space-y-3">
          {Object.entries(week)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => (
              <li key={k}>
                <div className="flex justify-between text-sm">
                  <span className="text-white">{name(k)}</span>
                  <span className="font-mono text-[#A7A1C8]">{formatDuration(v)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${(v / Math.max(total, 1)) * 100}%`, background: color(k) }} />
                </div>
              </li>
            ))}
          {total === 0 && <li className="text-sm text-[#9D95C2]">Pas encore de temps enregistré.</li>}
        </ul>
      </div>
    </div>
  );
}

export default function TempsEcran() {
  const id = useProfileId();
  const { data: subjects } = useSubjects();
  const { data, isError } = useQuery({
    queryKey: ["screen-time", id],
    queryFn: () => apiGet<ScreenDay[]>(`/profiles/${id}/screen-time`),
    enabled: !!id,
  });
  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">Le sablier magique</p>
      <h1 className="mt-1 mb-6 font-heading text-4xl font-bold text-white">Mon temps d'écran</h1>
      {isError && <p className="text-sm text-[#C084FC]">Le sablier se remplira dès que le château se réveille.</p>}
      {data && <ScreenTimeView days={data} subjects={subjects} />}
    </div>
  );
}
