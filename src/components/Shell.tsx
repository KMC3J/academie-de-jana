import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays, Calculator, Castle, Clock, Globe2, GraduationCap, LogOut, Map, Menu, NotebookPen, Palette, ScrollText,
  Sparkles, Star, Gem, UserRound, BookOpen, RotateCcw, Library,
} from "lucide-react";
import { apiPost, resetAcademy } from "@/lib/api";
import { setCurrentProfile, useProfile, useProfileId } from "@/lib/academy";
import { AvatarBadge } from "@/components/MagicIcon";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { Ok } from "@/lib/types";

// Subject the child is currently working on — read by the screen-time heartbeat.
let currentActivity = "general";
export function setActivity(subjectId: string | null) {
  currentActivity = subjectId ?? "general";
}

const NAV = [
  { to: "/accueil", label: "Accueil", icon: Castle, id: "home" },
  { to: "/matieres", label: "Matières", icon: BookOpen, id: "subjects" },
  { to: "/globe", label: "Carte & quiz du monde", icon: Globe2, id: "globe" },
  { to: "/quetes", label: "Quêtes", icon: Map, id: "quests" },
  { to: "/professeur", label: "Professeur magique", icon: GraduationCap, id: "teacher" },
  { to: "/bibliotheque", label: "Bibliothèque", icon: Library, id: "library" },
  { to: "/fiches", label: "Fiches & cartes", icon: ScrollText, id: "sheets" },
  { to: "/atelier", label: "Atelier création", icon: Palette, id: "workshop" },
  { to: "/calculatrice", label: "Calculatrice", icon: Calculator, id: "calculator" },
  { to: "/emploi-du-temps", label: "Emploi du temps", icon: CalendarDays, id: "timetable" },
  { to: "/temps-ecran", label: "Temps d'écran", icon: Clock, id: "screentime" },
  { to: "/profil", label: "Mon profil", icon: UserRound, id: "profile" },
];

function NavList({ onPick }: { onPick?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, id }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onPick}
          data-testid={`nav-${id}`}
          className={({ isActive }) =>
            `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-[background-color,color,transform] duration-200 hover:translate-x-0.5 ${
              isActive
                ? "bg-gradient-to-r from-[#F59E0B]/20 to-transparent text-[#FDE68A] ring-1 ring-[#F59E0B]/30"
                : "text-[#C4B5FD] hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function useHeartbeat(profileId: string | null) {
  useEffect(() => {
    if (!profileId) return;
    const t = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        apiPost<Ok>(`/profiles/${profileId}/heartbeat`, { subject_id: currentActivity, seconds: 30 }).catch(() => {});
      }
    }, 30_000);
    return () => window.clearInterval(t);
  }, [profileId]);
}

export default function Shell() {
  const id = useProfileId();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useHeartbeat(id);
  if (!id) return <Navigate to="/" replace />;

  const leave = () => {
    setCurrentProfile(null);
    navigate("/");
  };

  // Remet l'Académie dans son état de départ (profils, progression, contenus ajoutés).
  const reset = () => {
    if (!window.confirm("Réinitialiser l'Académie ? Toute la progression et les contenus ajoutés seront effacés.")) return;
    resetAcademy();
    setCurrentProfile(null);
    navigate("/");
    window.location.reload();
  };

  const brand = (
    <div className="mb-6 flex items-center gap-2 px-2">
      <Sparkles className="size-5 text-[#F59E0B]" />
      <span className="font-heading text-lg font-bold text-white">L'Académie de Jana</span>
    </div>
  );

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-[#8B5CF6]/20 bg-[#120F22]/90 p-4 backdrop-blur-xl lg:flex">
        {brand}
        <NavList />
        <div className="mt-auto space-y-1">
          <Button variant="ghost" className="w-full justify-start text-[#A7A1C8]" onClick={leave} data-testid="switch-profile-button">
            <LogOut className="size-4" /> Changer de profil
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start text-[#A7A1C8]/70" onClick={reset} data-testid="reset-academy-button">
            <RotateCcw className="size-3.5" /> Réinitialiser l'Académie
          </Button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[#8B5CF6]/20 bg-[#0D0B18]/75 px-4 py-3 backdrop-blur-xl sm:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" data-testid="mobile-menu-button" />}>
              <Menu />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-[#120F22] p-4">
              <SheetTitle className="sr-only">Menu</SheetTitle>
              {brand}
              <NavList onPick={() => setOpen(false)} />
              <Button variant="ghost" className="mt-4 w-full justify-start text-[#A7A1C8]" onClick={leave}>
                <LogOut className="size-4" /> Changer de profil
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-[#A7A1C8]/70" onClick={reset}>
                <RotateCcw className="size-3.5" /> Réinitialiser l'Académie
              </Button>
            </SheetContent>
          </Sheet>
          {profile && (
            <>
              <AvatarBadge icon={profile.avatar.icon} color={profile.avatar.color} size={38} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white" data-testid="header-profile-name">
                  {profile.name} · <span className="text-[#FDE68A]">{profile.level_title}</span>
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#A7A1C8]">Niv. {profile.level}</span>
                  <div className="h-1.5 w-full max-w-48 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] via-[#F59E0B] to-[#FDE68A] shadow-[0_0_10px_#F59E0B]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(profile.xp_in_level / profile.xp_for_next) * 100}%` }}
                      transition={{ type: "spring", stiffness: 60, damping: 16 }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 font-mono text-sm sm:gap-5">
                <span className="flex items-center gap-1 text-[#FDE68A]" data-testid="header-xp">
                  <Sparkles className="size-4" /> {profile.xp} <span className="hidden sm:inline">XP</span>
                </span>
                <span className="flex items-center gap-1 text-[#FBBF24]" data-testid="header-stars">
                  <Star className="size-4 fill-current" /> {profile.stars}
                </span>
                <span className="flex items-center gap-1 text-[#C4B5FD]" data-testid="header-crystals">
                  <Gem className="size-4" /> {profile.crystals}
                </span>
              </div>
            </>
          )}
          {!profile && <NotebookPen className="size-5 text-[#A7A1C8]" />}
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
