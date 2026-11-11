import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { AVATAR_COLORS, AVATAR_ICON_NAMES, AvatarBadge, MagicIcon } from "@/components/MagicIcon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fieldLabel, panel, useParentMutation } from "./common";
import type { Avatar, Ok, Profile, ProfileIn } from "@/lib/types";

const KEYS = [["profiles"], ["parent-stats"], ["profile"]];

export default function ParentChildren() {
  const { data: profiles } = useQuery({ queryKey: ["profiles"], queryFn: () => apiGet<Profile[]>("/profiles") });
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<Avatar>({ icon: "wand", color: AVATAR_COLORS[0] });

  const reset = () => {
    setEditId(null);
    setName("");
    setAvatar({ icon: "wand", color: AVATAR_COLORS[0] });
  };
  const save = useParentMutation(
    (body: ProfileIn) => (editId ? apiPut<Profile>(`/profiles/${editId}`, body) : apiPost<Profile>("/profiles", body)),
    KEYS, "Profil enregistré", reset,
  );
  const del = useParentMutation((id: string) => apiDelete<Ok>(`/profiles/${id}`), KEYS, "Profil supprimé");

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      <div className={panel}>
        <h3 className="font-heading text-xl font-bold text-white">Profils enfants</h3>
        <ul className="mt-4 space-y-2" data-testid="parent-children-list">
          {profiles?.map((p) => (
            <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-white/5 p-3" data-testid={`parent-child-${p.id}`}>
              <AvatarBadge icon={p.avatar.icon} color={p.avatar.color} size={40} />
              <div className="flex-1">
                <p className="font-semibold text-white">{p.name}</p>
                <p className="text-xs text-[#86EFAC]">niveau {p.level} · {p.xp} XP</p>
              </div>
              <Button variant="ghost" size="icon-sm" aria-label="Modifier" data-testid={`parent-child-edit-${p.id}`}
                onClick={() => { setEditId(p.id); setName(p.name); setAvatar(p.avatar); }}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="icon-sm" aria-label="Supprimer" data-testid={`parent-child-delete-${p.id}`}
                onClick={() => window.confirm(`Supprimer le profil de ${p.name} et toute sa progression ?`) && del.mutate(p.id)}>
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      </div>
      <form className={panel} onSubmit={(e) => { e.preventDefault(); if (name.trim()) save.mutate({ name: name.trim(), avatar }); }}>
        <h3 className="font-heading text-xl font-bold text-white">{editId ? "Modifier le profil" : "Ajouter un enfant"}</h3>
        <label className={`${fieldLabel} mt-4`}>Prénom</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex : Léo" data-testid="parent-child-name-input" />
        <label className={`${fieldLabel} mt-4`}>Avatar</label>
        <div className="flex flex-wrap gap-1.5">
          {AVATAR_ICON_NAMES.map((n) => (
            <button key={n} type="button" onClick={() => setAvatar({ ...avatar, icon: n })} data-testid={`parent-child-icon-${n}`}
              className={`flex size-9 items-center justify-center rounded-lg ${avatar.icon === n ? "bg-[#38BDF8] text-[#06202E]" : "bg-white/5 text-white"}`}>
              <MagicIcon name={n} className="size-4" />
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-1.5">
          {AVATAR_COLORS.map((c) => (
            <button key={c} type="button" aria-label={c} onClick={() => setAvatar({ ...avatar, color: c })}
              className={`size-8 rounded-full ${avatar.color === c ? "ring-2 ring-white" : ""}`} style={{ background: c }} />
          ))}
        </div>
        <div className="mt-5 flex gap-2">
          <Button type="submit" disabled={!name.trim() || save.isPending} data-testid="parent-child-save-button"><Plus /> {editId ? "Enregistrer" : "Ajouter"}</Button>
          {editId && <Button type="button" variant="ghost" onClick={reset}>Annuler</Button>}
        </div>
      </form>
    </div>
  );
}
