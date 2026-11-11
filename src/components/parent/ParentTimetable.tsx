import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { DAYS, useSubjects } from "@/lib/academy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fieldLabel, panel, useParentMutation } from "./common";
import type { Ok, Slot, SlotIn } from "@/lib/types";

const KEYS = [["timetable"], ["today"]];

export default function ParentTimetable() {
  const { data: subjects } = useSubjects();
  const { data: slots } = useQuery({ queryKey: ["timetable"], queryFn: () => apiGet<Slot[]>("/timetable") });
  const [form, setForm] = useState<SlotIn>({ day: 0, start: "08:00", end: "09:00", subject_id: null, label: "", room: "" });
  const add = useParentMutation((b: SlotIn) => apiPost<Slot>("/timetable", b), KEYS, "Cours ajouté");
  const del = useParentMutation((id: string) => apiDelete<Ok>(`/timetable/${id}`), KEYS);
  const subjLabel = (v: string) => (v === "none" ? "Autre (texte libre)" : subjects?.find((s) => s.id === v)?.name ?? "Matière");
  const valid = form.start < form.end && (form.subject_id || form.label.trim());

  return (
    <div className="space-y-5">
      <form className={`${panel} grid gap-3 md:grid-cols-[140px_110px_110px_1fr_1fr_120px_auto] md:items-end`}
        onSubmit={(e) => { e.preventDefault(); if (valid) add.mutate(form); }}>
        <div>
          <label className={fieldLabel}>Jour</label>
          <Select value={String(form.day)} onValueChange={(v: string) => setForm({ ...form, day: Number(v) })}>
            <SelectTrigger className="w-full" data-testid="parent-slot-day-select"><SelectValue>{(v: unknown) => DAYS[Number(v)]}</SelectValue></SelectTrigger>
            <SelectContent>{DAYS.slice(0, 5).map((d, i) => <SelectItem key={d} value={String(i)}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div>
          <label className={fieldLabel}>Début</label>
          <Input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} data-testid="parent-slot-start-input" />
        </div>
        <div>
          <label className={fieldLabel}>Fin</label>
          <Input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} data-testid="parent-slot-end-input" />
        </div>
        <div>
          <label className={fieldLabel}>Matière</label>
          <Select value={form.subject_id ?? "none"} onValueChange={(v: string) => setForm({ ...form, subject_id: v === "none" ? null : v })}>
            <SelectTrigger className="w-full" data-testid="parent-slot-subject-select"><SelectValue>{(v: unknown) => subjLabel(v as string)}</SelectValue></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Autre (texte libre)</SelectItem>
              {subjects?.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className={fieldLabel}>Libellé (si autre)</label>
          <Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="EPS, Vie de classe…" data-testid="parent-slot-label-input" />
        </div>
        <div>
          <label className={fieldLabel}>Salle</label>
          <Input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} data-testid="parent-slot-room-input" />
        </div>
        <Button type="submit" disabled={!valid || add.isPending} data-testid="parent-slot-add-button"><Plus /> Ajouter</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-5">
        {DAYS.slice(0, 5).map((d, day) => (
          <div key={d} className={panel} data-testid={`parent-timetable-day-${day}`}>
            <p className="font-heading text-lg font-bold text-white">{d}</p>
            <ul className="mt-2 space-y-1.5">
              {slots?.filter((s) => s.day === day).map((s) => (
                <li key={s.id} className="flex items-center gap-2 rounded-xl bg-white/5 px-2 py-1.5 text-sm">
                  <span className="font-mono text-[11px] text-[#86EFAC]">{s.start}</span>
                  <span className="flex-1 truncate text-white">{subjects?.find((x) => x.id === s.subject_id)?.name ?? s.label}</span>
                  <button type="button" aria-label="Supprimer" onClick={() => del.mutate(s.id)} className="text-[#A7A1C8] hover:text-[#FCA5A5]" data-testid={`parent-slot-delete-${s.id}`}>
                    <Trash2 className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
