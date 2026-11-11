import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Sparkles } from "lucide-react";
import { apiGet } from "@/lib/api";
import { IMAGES, setCurrentProfile } from "@/lib/academy";
import { AvatarBadge } from "@/components/MagicIcon";
import Stardust from "@/components/Stardust";
import PinDialog from "@/components/PinDialog";
import type { Profile } from "@/lib/types";

export default function ProfilePicker() {
  const navigate = useNavigate();
  const [pinOpen, setPinOpen] = useState(false);
  const { data: profiles, isError, isLoading } = useQuery({
    queryKey: ["profiles"],
    queryFn: () => apiGet<Profile[]>("/profiles"),
  });

  const pick = (id: string) => {
    setCurrentProfile(id);
    navigate("/accueil");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <img src={IMAGES.castle} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,11,24,0.55)_0%,rgba(13,11,24,0.95)_75%)]" />
      <Stardust count={60} />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-sm font-medium text-[#FDE68A]">
            <Sparkles className="size-4" /> École de magie · Collège 5e
          </span>
          <button
            type="button"
            onClick={() => setPinOpen(true)}
            data-testid="open-parent-space-button"
            className="flex items-center gap-2 rounded-full border border-[#38BDF8]/40 bg-[#131E2A]/70 px-4 py-2 text-sm text-[#BAE6FD] backdrop-blur-md transition-[background-color,transform] duration-200 hover:scale-105 hover:bg-[#131E2A]"
          >
            <ShieldCheck className="size-4" /> Espace parent
          </button>
        </div>

        <div className="mt-auto grid items-end gap-10 pb-10 lg:grid-cols-[1.3fr_1fr]">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="font-heading text-5xl leading-[1.05] font-bold text-white sm:text-6xl lg:text-7xl">
              L'Académie
              <br />
              <span className="bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#EC4899] bg-clip-text text-transparent">
                de Jana
              </span>
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-[#DDD6FE]">
              Les portes du château s'ouvrent. Choisis ton profil d'apprentie sorcière pour commencer les leçons du jour.
            </p>
          </motion.div>

          <div className="rounded-3xl border border-[#8B5CF6]/30 bg-[#1A1530]/80 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <h2 className="font-heading text-2xl font-bold text-white">Qui entre dans l'Académie ?</h2>
            <div className="mt-5 grid gap-3" data-testid="profile-list">
              {isLoading && <div className="h-20 animate-pulse rounded-2xl bg-white/5" />}
              {isError && (
                <p className="text-sm text-[#C084FC]" data-testid="profiles-error">
                  Le château est momentanément endormi. Reviens dans un instant.
                </p>
              )}
              {profiles?.map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * i }}
                  onClick={() => pick(p.id)}
                  data-testid={`profile-card-${p.name.toLowerCase()}`}
                  className="group flex items-center gap-4 rounded-2xl border border-[#F59E0B]/20 bg-[#221B3D]/80 p-4 text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-[#F59E0B]/70 hover:shadow-[0_0_24px_rgba(245,158,11,0.3)]"
                >
                  <AvatarBadge icon={p.avatar.icon} color={p.avatar.color} size={56} />
                  <div className="flex-1">
                    <p className="font-heading text-xl font-bold text-white">{p.name}</p>
                    <p className="text-sm text-[#C4B5FD]">
                      {p.level_title} · niveau {p.level}
                    </p>
                  </div>
                  <span className="font-mono text-sm text-[#FDE68A] opacity-70 transition-opacity group-hover:opacity-100">
                    Entrer →
                  </span>
                </motion.button>
              ))}
              {profiles && profiles.length === 0 && (
                <p className="text-sm text-[#C4B5FD]">Aucun profil : un parent peut en créer depuis l'espace parent.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <PinDialog open={pinOpen} onOpenChange={setPinOpen} onUnlocked={() => navigate("/parent")} />
    </div>
  );
}
