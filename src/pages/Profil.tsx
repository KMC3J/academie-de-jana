import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Gem, Lock, Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { apiGet, apiPut } from "@/lib/api";
import { useBadges, useProfile, useProfileId, useSubjects } from "@/lib/academy";
import { AVATAR_COLORS, AVATAR_ICON_NAMES, AvatarBadge, MagicIcon } from "@/components/MagicIcon";
import type { Avatar, Creation, Profile } from "@/lib/types";

export default function Profil() {
  const id = useProfileId();
  const qc = useQueryClient();
  const { data: profile } = useProfile();
  const { data: badges } = useBadges();
  const { data: subjects } = useSubjects();
  const { data: creations } = useQuery({
    queryKey: ["creations", id],
    queryFn: () => apiGet<Creation[]>(`/profiles/${id}/creations`),
    enabled: !!id,
  });
  const saveAvatar = useMutation({
    mutationFn: (a: Avatar) => apiPut<Profile>(`/profiles/${id}/avatar`, a),
    onSuccess: (p) => {
      qc.setQueryData(["profile", id], p);
      qc.invalidateQueries({ queryKey: ["profiles"] });
      toast.success("Avatar enchanté !");
    },
  });

  if (!profile) return <div className="h-64 animate-pulse rounded-3xl bg-white/5" />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
      <section className="rounded-3xl border border-[#F59E0B]/25 bg-gradient-to-b from-[#221B3D] to-[#18142A] p-6">
        <div className="flex items-center gap-5">
          <AvatarBadge icon={profile.avatar.icon} color={profile.avatar.color} size={88} testId="profile-avatar" />
          <div>
            <h1 className="font-heading text-4xl font-bold text-white" data-testid="profile-name">{profile.name}</h1>
            <p className="text-[#FDE68A]" data-testid="profile-level">
              {profile.level_title} · niveau {profile.level}
            </p>
          </div>
        </div>
        <div className="mt-5">
          <div className="flex justify-between font-mono text-xs text-[#A7A1C8]">
            <span>{profile.xp_in_level} / {profile.xp_for_next} XP</span>
            <span>niveau {profile.level + 1}</span>
          </div>
          <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#F59E0B] to-[#FDE68A] transition-[width] duration-700"
              style={{ width: `${(profile.xp_in_level / profile.xp_for_next) * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          {[
            { label: "XP", value: profile.xp, icon: <Sparkles className="mx-auto size-5 text-[#FDE68A]" /> },
            { label: "Étoiles", value: profile.stars, icon: <Star className="mx-auto size-5 fill-[#F59E0B] text-[#F59E0B]" /> },
            { label: "Cristaux", value: profile.crystals, icon: <Gem className="mx-auto size-5 text-[#C4B5FD]" /> },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-white/5 p-3" data-testid={`profile-stat-${s.label.toLowerCase()}`}>
              {s.icon}
              <p className="mt-1 font-mono text-xl text-white">{s.value}</p>
              <p className="text-xs text-[#A7A1C8]">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-8 font-heading text-xl font-bold text-white">Personnaliser mon avatar</h2>
        <div className="mt-3 flex flex-wrap gap-2" data-testid="avatar-icon-picker">
          {AVATAR_ICON_NAMES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => saveAvatar.mutate({ ...profile.avatar, icon: n })}
              data-testid={`avatar-icon-${n}`}
              className={`flex size-11 items-center justify-center rounded-xl transition-[background-color,transform] hover:scale-110 ${
                profile.avatar.icon === n ? "bg-[#F59E0B] text-[#1A1202]" : "bg-white/5 text-white"
              }`}
            >
              <MagicIcon name={n} className="size-5" />
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2" data-testid="avatar-color-picker">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => saveAvatar.mutate({ ...profile.avatar, color: c })}
              data-testid={`avatar-color-${c.slice(1)}`}
              aria-label={`Couleur ${c}`}
              className={`size-9 rounded-full transition-transform hover:scale-110 ${profile.avatar.color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#18142A]" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="rounded-3xl border border-[#8B5CF6]/20 bg-[#18142A] p-6">
          <h2 className="font-heading text-2xl font-bold text-white">Badges</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="badges-grid">
            {badges?.map((b) => {
              const owned = profile.badges.includes(b.id);
              return (
                <div
                  key={b.id}
                  data-testid={`badge-${b.id}`}
                  data-owned={owned}
                  className={`rounded-2xl border p-3 text-center transition-[opacity] ${
                    owned ? "border-[#F59E0B]/50 bg-[#F59E0B]/10" : "border-white/5 bg-white/[0.02] opacity-50"
                  }`}
                >
                  <span className={`mx-auto flex size-11 items-center justify-center rounded-full ${owned ? "bg-[#F59E0B] text-[#1A1202] shadow-[0_0_16px_#F59E0B]" : "bg-white/10 text-white/50"}`}>
                    {owned ? <MagicIcon name={b.icon} className="size-5" /> : <Lock className="size-4" />}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-white">{b.title}</p>
                  <p className="text-[11px] text-[#A7A1C8]">{b.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[#8B5CF6]/20 bg-[#18142A] p-6">
          <h2 className="font-heading text-2xl font-bold text-white">Progression par matière</h2>
          <div className="mt-4 space-y-3" data-testid="subject-progress-list">
            {subjects?.map((s) => {
              const xp = profile.subject_xp[s.id] ?? 0;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="w-36 truncate text-sm text-white">{s.name}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, (xp / 200) * 100)}%`, background: s.color }} />
                  </div>
                  <span className="w-16 text-right font-mono text-xs text-[#A7A1C8]">{xp} XP</span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-3xl border border-[#8B5CF6]/20 bg-[#18142A] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl font-bold text-white">Mes créations</h2>
            <Link to="/atelier" className="text-sm text-[#FDE68A] hover:underline" data-testid="profile-go-workshop">Atelier →</Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3" data-testid="profile-creations">
            {creations?.slice(0, 6).map((c) => (
              <div key={c.id} className="overflow-hidden rounded-2xl bg-white/5">
                {c.kind === "dessin" ? (
                  <img src={c.content} alt={c.title} className="aspect-square w-full bg-white object-cover" />
                ) : (
                  <p className="line-clamp-5 aspect-square p-3 text-xs text-[#DDD6FE]">{c.content}</p>
                )}
                <p className="truncate px-3 py-2 text-xs text-white">{c.title}</p>
              </div>
            ))}
            {creations?.length === 0 && <p className="col-span-3 text-sm text-[#A7A1C8]">Rien encore : file à la Tour des rêves !</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
