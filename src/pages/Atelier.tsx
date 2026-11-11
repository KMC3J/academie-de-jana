import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Brush, Dices, Eraser, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { useProfileId } from "@/lib/academy";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import DicteeWriter from "@/components/DicteeWriter";
import type { Creation, CreationIn, CreationKind, Ok } from "@/lib/types";

const COLORS = ["#1A1202", "#F59E0B", "#8B5CF6", "#06B6D4", "#10B981", "#EC4899", "#E11D48", "#FFFFFF"];
const STORY_IDEAS = [
  "Un chat noir découvre une porte secrète sous la bibliothèque de l'Académie.",
  "Ta baguette se met soudain à parler… mais seulement en espagnol !",
  "Une potion ratée transforme ton professeur de maths en hibou.",
  "La Tour des rêves s'envole pendant la nuit avec toi à l'intérieur.",
  "Tu trouves une carte qui mène au Jardin des merveilles oublié.",
];
const KIND_LABEL: Record<CreationKind, string> = { dessin: "Dessin", histoire: "Histoire", theatre: "Théâtre" };

function useSaveCreation(onDone: () => void) {
  const id = useProfileId();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (c: CreationIn) => apiPost<Creation>(`/profiles/${id}/creations`, c),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["creations", id] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Création enregistrée dans ton profil ! +10 XP");
      onDone();
    },
    onError: () => toast.error("Impossible d'enregistrer, réessaie."),
  });
}

function DrawingPad() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[2]);
  const [size, setSize] = useState(6);
  const [eraser, setEraser] = useState(false);
  const [title, setTitle] = useState("");

  const clear = () => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || !canvas.current) return;
    ctx.fillStyle = "#FFFDF7";
    ctx.fillRect(0, 0, canvas.current.width, canvas.current.height);
  };
  useEffect(clear, []);
  const save = useSaveCreation(() => {
    setTitle("");
    clear();
  });

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * e.currentTarget.width, y: ((e.clientY - r.top) / r.height) * e.currentTarget.height };
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = e.currentTarget.getContext("2d");
    if (!ctx) return;
    const p = pos(e);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = eraser ? "#FFFDF7" : color;
    ctx.lineWidth = eraser ? size * 3 : size;
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <div className="space-y-4 rounded-3xl border border-[#8B5CF6]/25 bg-[#18142A] p-4">
        <p className="text-sm font-semibold text-white">Couleurs</p>
        <div className="grid grid-cols-4 gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Couleur ${c}`}
              data-testid={`draw-color-${c.slice(1)}`}
              onClick={() => {
                setColor(c);
                setEraser(false);
              }}
              className={`size-9 rounded-full border border-white/20 transition-transform hover:scale-110 ${color === c && !eraser ? "ring-2 ring-[#F59E0B] ring-offset-2 ring-offset-[#18142A]" : ""}`}
              style={{ background: c }}
            />
          ))}
        </div>
        <p className="text-sm font-semibold text-white">Taille : <span className="font-mono">{size}</span></p>
        <input type="range" min={2} max={30} value={size} onChange={(e) => setSize(Number(e.target.value))} className="w-full accent-[#F59E0B]" data-testid="draw-size-slider" />
        <div className="flex gap-2">
          <Button variant={eraser ? "outline" : "default"} size="sm" onClick={() => setEraser(false)} data-testid="draw-brush-button"><Brush /> Pinceau</Button>
          <Button variant={eraser ? "default" : "outline"} size="sm" onClick={() => setEraser(true)} data-testid="draw-eraser-button"><Eraser /> Gomme</Button>
        </div>
        <Button variant="ghost" size="sm" onClick={clear} data-testid="draw-clear-button"><Trash2 /> Tout effacer</Button>
      </div>
      <div>
        <canvas
          ref={canvas}
          width={1000}
          height={620}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => (drawing.current = false)}
          onPointerLeave={() => (drawing.current = false)}
          className="w-full touch-none rounded-3xl border-4 border-[#F59E0B]/30 shadow-[0_0_30px_rgba(139,92,246,0.25)]"
          style={{ cursor: "crosshair" }}
          data-testid="draw-canvas"
        />
        <div className="mt-3 flex gap-3">
          <Input placeholder="Titre de ton dessin" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="draw-title-input" />
          <Button
            disabled={!title.trim() || save.isPending}
            onClick={() => canvas.current && save.mutate({ kind: "dessin", title: title.trim(), content: canvas.current.toDataURL("image/png") })}
            data-testid="draw-save-button"
          >
            <Save /> Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
}

function StoryWriter() {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [idea, setIdea] = useState(STORY_IDEAS[0]);
  const save = useSaveCreation(() => {
    setTitle("");
    setText("");
  });
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3">
        <Input placeholder="Titre de ton histoire" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="story-title-input" />
        <Textarea
          placeholder="Il était une fois, à l'Académie…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-80 bg-[#F5ECD7] font-heading text-lg leading-relaxed text-[#2A1E0F] placeholder:text-[#2A1E0F]/40"
          data-testid="story-text-input"
        />
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs text-[#A7A1C8]" data-testid="story-word-count">{words} mots</span>
          <Button disabled={!title.trim() || !text.trim() || save.isPending} onClick={() => save.mutate({ kind: "histoire", title: title.trim(), content: text })} data-testid="story-save-button">
            <Save /> Enregistrer l'histoire
          </Button>
        </div>
      </div>
      <aside className="rounded-3xl border border-[#F59E0B]/25 bg-[#221B3D] p-5">
        <p className="font-heading text-xl font-bold text-white">Idée magique</p>
        <p className="mt-3 text-[#DDD6FE]" data-testid="story-idea">{idea}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => setIdea(STORY_IDEAS[(STORY_IDEAS.indexOf(idea) + 1) % STORY_IDEAS.length])} data-testid="story-new-idea-button">
          <Dices /> Autre idée
        </Button>
        <ul className="mt-5 space-y-1 text-sm text-[#A7A1C8]">
          <li>· Présente ton héros et le lieu</li>
          <li>· Un problème arrive…</li>
          <li>· Raconte les péripéties</li>
          <li>· Trouve une fin magique</li>
        </ul>
      </aside>
    </div>
  );
}

function TheatreWriter() {
  const [title, setTitle] = useState("");
  const [lines, setLines] = useState<{ who: string; say: string }[]>([]);
  const [who, setWho] = useState("");
  const [say, setSay] = useState("");
  const save = useSaveCreation(() => {
    setTitle("");
    setLines([]);
  });
  const add = () => {
    if (!who.trim() || !say.trim()) return;
    setLines([...lines, { who: who.trim().toUpperCase(), say: say.trim() }]);
    setSay("");
  };
  return (
    <div className="space-y-4">
      <Input placeholder="Titre de ta scène" value={title} onChange={(e) => setTitle(e.target.value)} data-testid="theatre-title-input" />
      <div className="min-h-48 space-y-3 rounded-3xl bg-[#F5ECD7] p-6 text-[#2A1E0F]" data-testid="theatre-script">
        {lines.length === 0 && <p className="text-[#2A1E0F]/50 italic">Ajoute les répliques de tes personnages ci-dessous.</p>}
        {lines.map((l, i) => (
          <p key={i}>
            <span className="font-bold tracking-wide">{l.who}</span> — {l.say}
          </p>
        ))}
      </div>
      <div className="flex flex-wrap gap-3">
        <Input className="w-40" placeholder="Personnage" value={who} onChange={(e) => setWho(e.target.value)} data-testid="theatre-character-input" />
        <Input className="min-w-60 flex-1" placeholder="Réplique" value={say} onChange={(e) => setSay(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} data-testid="theatre-line-input" />
        <Button variant="outline" onClick={add} data-testid="theatre-add-line-button"><Plus /> Réplique</Button>
        <Button
          disabled={!title.trim() || lines.length === 0 || save.isPending}
          onClick={() => save.mutate({ kind: "theatre", title: title.trim(), content: lines.map((l) => `${l.who} — ${l.say}`).join("\n") })}
          data-testid="theatre-save-button"
        >
          <Save /> Enregistrer la scène
        </Button>
      </div>
    </div>
  );
}

function CreationList() {
  const id = useProfileId();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["creations", id], queryFn: () => apiGet<Creation[]>(`/profiles/${id}/creations`), enabled: !!id });
  const del = useMutation({
    mutationFn: (cid: string) => apiDelete<Ok>(`/profiles/${id}/creations/${cid}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["creations", id] }),
  });
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="creation-list">
      {data?.map((c) => (
        <div key={c.id} className="overflow-hidden rounded-3xl border border-[#8B5CF6]/25 bg-[#18142A]" data-testid={`creation-${c.id}`}>
          {c.kind === "dessin" ? (
            <img src={c.content} alt={c.title} className="aspect-[1000/620] w-full object-cover" />
          ) : (
            <p className="line-clamp-6 h-40 bg-[#F5ECD7] p-4 text-sm whitespace-pre-wrap text-[#2A1E0F]">{c.content}</p>
          )}
          <div className="flex items-center gap-2 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-white">{c.title}</p>
              <p className="text-xs text-[#9D95C2]">
                {c.title.startsWith("Dictée —") ? "Dictée" : KIND_LABEL[c.kind]} · {new Date(c.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <Button variant="ghost" size="icon-sm" onClick={() => del.mutate(c.id)} aria-label="Supprimer" data-testid={`creation-delete-${c.id}`}>
              <Trash2 />
            </Button>
          </div>
        </div>
      ))}
      {data?.length === 0 && <p className="text-sm text-[#A7A1C8]">Tes créations apparaîtront ici.</p>}
    </div>
  );
}

export default function Atelier() {
  return (
    <div>
      <p className="text-sm font-medium tracking-wide text-[#FDE68A] uppercase">La Tour des rêves</p>
      <h1 className="mt-1 font-heading text-4xl font-bold text-white">Atelier création</h1>
      <Tabs defaultValue="dessin" className="mt-6">
        <TabsList>
          <TabsTrigger value="dessin" data-testid="workshop-tab-dessin">Dessin</TabsTrigger>
          <TabsTrigger value="histoire" data-testid="workshop-tab-histoire">Histoire</TabsTrigger>
          <TabsTrigger value="theatre" data-testid="workshop-tab-theatre">Théâtre</TabsTrigger>
          <TabsTrigger value="dictee" data-testid="workshop-tab-dictee">Dictée</TabsTrigger>
          <TabsTrigger value="mes-creations" data-testid="workshop-tab-creations">Mes créations</TabsTrigger>
        </TabsList>
        <TabsContent value="dessin" className="mt-5"><DrawingPad /></TabsContent>
        <TabsContent value="histoire" className="mt-5"><StoryWriter /></TabsContent>
        <TabsContent value="theatre" className="mt-5"><TheatreWriter /></TabsContent>
        <TabsContent value="dictee" className="mt-5"><DicteeWriter /></TabsContent>
        <TabsContent value="mes-creations" className="mt-5"><CreationList /></TabsContent>
      </Tabs>
    </div>
  );
}
