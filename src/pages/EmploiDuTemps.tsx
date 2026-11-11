import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import { DAYS, useProfileId, useSubjects } from "@/lib/academy";
import type { Slot, TodayView } from "@/lib/types";

export default function EmploiDuTemps() {
  const id = useProfileId();
  const { data: subjects } = useSubjects();
  const { data: slots, isError } = useQuery({ queryKey: ["timetable"], queryFn: () => apiGet<Slot[]>("/timetable") });
  const { data: today } = useQuery({
    queryKey: ["today", id],
    queryFn: () => apiGet<TodayView>(`/profiles/${id}/today`),
    enabled: !!id,
  });

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">Le collège</p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Emploi du temps</h1>
      {isError && <p className="mt-4 text-sm text-[#C084FC]">L'emploi du temps apparaîtra dès que le château se réveille.</p>}
      <div className="mt-6 grid gap-4 md:grid-cols-5" data-testid="timetable-grid">
        {DAYS.slice(0, 5).map((d, day) => {
          const isToday = today?.weekday === day;
          const list = slots?.filter((s) => s.day === day) ?? [];
          return (
            <div
              key={d}
              data-testid={`timetable-day-${day}`}
              className={`rounded-3xl border p-4 ${isToday ? "border-[#F59E0B]/60 bg-[#F59E0B]/5 shadow-[0_0_24px_rgba(245,158,11,0.2)]" : "border-[#8B5CF6]/20 bg-[#18142A]"}`}
            >
              <p className={`font-heading text-xl font-bold ${isToday ? "text-[#FDE68A]" : "text-white"}`}>
                {d} {isToday && <span className="ml-1 text-xs font-sans font-medium">· aujourd'hui</span>}
              </p>
              <ul className="mt-3 space-y-2">
                {list.map((s) => {
                  const subj = subjects?.find((x) => x.id === s.subject_id);
                  const color = subj?.color ?? "#A7A1C8";
                  return (
                    <li key={s.id} className="rounded-xl border-l-4 bg-white/[0.04] px-3 py-2" style={{ borderColor: color }} data-testid={`timetable-slot-${s.id}`}>
                      <p className="font-mono text-[11px] text-[#A7A1C8]">
                        {s.start} – {s.end}
                      </p>
                      <p className="text-sm font-semibold text-white">{subj?.name ?? s.label}</p>
                      {s.room && <p className="text-xs text-[#9D95C2]">{s.room}</p>}
                    </li>
                  );
                })}
                {slots && list.length === 0 && <li className="text-sm text-[#9D95C2]">Pas de cours</li>}
              </ul>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-[#9D95C2]">L'emploi du temps se modifie depuis l'espace parent.</p>
    </div>
  );
}
