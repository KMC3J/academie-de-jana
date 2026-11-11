import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProfile, useSubjects } from "@/lib/academy";
import { MagicIcon } from "@/components/MagicIcon";

export default function Matieres() {
  const { data: subjects, isError } = useSubjects();
  const { data: profile } = useProfile();

  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">Le grimoire</p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Les matières de 5e</h1>
      <p className="mt-2 max-w-2xl text-[#A7A1C8]">
        Choisis une matière, puis un chapitre : le grimoire crée un quiz magique rien que pour toi.
      </p>
      {isError && <p className="mt-6 text-sm text-[#C084FC]">Les matières se chargeront dès que le château se réveille.</p>}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="subjects-grid">
        {subjects?.map((s, i) => {
          const xp = profile?.subject_xp[s.id] ?? 0;
          const pct = Math.min(100, (xp / 200) * 100);
          return (
            <motion.div key={s.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Link
                to={`/matieres/${s.id}`}
                data-testid={`subject-card-${s.id}`}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border bg-[#18142A] p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1"
                style={{ borderColor: `${s.color}40`, boxShadow: `0 0 0 0 ${s.color}` }}
              >
                <span
                  className="absolute -top-10 -right-10 size-32 rounded-full opacity-25 blur-2xl transition-opacity duration-300 group-hover:opacity-50"
                  style={{ background: s.color }}
                />
                <span className="flex size-12 items-center justify-center rounded-2xl" style={{ background: `${s.color}22`, color: s.color }}>
                  <MagicIcon name={s.icon} className="size-6" />
                </span>
                <h2 className="mt-4 font-heading text-2xl font-bold text-white">{s.name}</h2>
                <p className="text-sm text-[#C4B5FD]">{s.magic_name}</p>
                <p className="mt-3 text-xs text-[#9D95C2]">{s.chapters.length} chapitre{s.chapters.length > 1 ? "s" : ""}</p>
                <div className="mt-auto pt-4">
                  <div className="flex justify-between font-mono text-[11px] text-[#A7A1C8]">
                    <span>Maîtrise</span>
                    <span data-testid={`subject-xp-${s.id}`}>{xp} XP</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
