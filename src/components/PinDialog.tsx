import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, Delete } from "lucide-react";
import { ApiError, apiPost } from "@/lib/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ParentStatus } from "@/lib/types";

export default function PinDialog({
  open, onOpenChange, onUnlocked,
}: { open: boolean; onOpenChange: (o: boolean) => void; onUnlocked: () => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const qc = useQueryClient();
  const unlock = useMutation({
    mutationFn: (p: string) => apiPost<ParentStatus>("/parent/unlock", { pin: p }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["parent-status"] });
      setPin("");
      onUnlocked();
    },
    onError: (e) => {
      setError(e instanceof ApiError && e.status === 401 ? "Code incorrect" : "Erreur, réessaie");
      setPin("");
    },
  });

  const press = (d: string) => {
    setError("");
    const next = (pin + d).slice(0, 8);
    setPin(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#38BDF8]/30 bg-[#131E2A] sm:max-w-sm" data-testid="parent-pin-dialog">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading text-2xl text-white">
            <Lock className="size-5 text-[#38BDF8]" /> Espace parent
          </DialogTitle>
          <DialogDescription className="text-[#86EFAC]">Saisis le code parent pour continuer.</DialogDescription>
        </DialogHeader>
        <motion.div
          animate={error ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
          className="flex justify-center gap-3 py-2"
          data-testid="parent-pin-display"
        >
          {Array.from({ length: Math.max(4, pin.length) }, (_, i) => (
            <span
              key={i}
              className={`size-4 rounded-full border border-[#38BDF8]/60 transition-[background-color] duration-150 ${
                i < pin.length ? "bg-[#38BDF8]" : "bg-transparent"
              }`}
            />
          ))}
        </motion.div>
        <p className="h-5 text-center text-sm text-[#FCA5A5]" data-testid="parent-pin-error">{error}</p>
        <div className="grid grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => press(d)}
              data-testid={`parent-pin-digit-${d}`}
              className="h-14 rounded-xl bg-white/5 font-mono text-xl text-white transition-[background-color,transform] duration-150 hover:bg-[#38BDF8]/20 active:scale-95"
            >
              {d}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPin(pin.slice(0, -1))}
            data-testid="parent-pin-delete"
            className="flex h-14 items-center justify-center rounded-xl bg-white/5 text-[#A7A1C8] transition-[background-color] hover:bg-white/10"
            aria-label="Effacer"
          >
            <Delete className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => press("0")}
            data-testid="parent-pin-digit-0"
            className="h-14 rounded-xl bg-white/5 font-mono text-xl text-white transition-[background-color,transform] duration-150 hover:bg-[#38BDF8]/20 active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            disabled={pin.length < 4 || unlock.isPending}
            onClick={() => unlock.mutate(pin)}
            data-testid="parent-pin-submit"
            className="h-14 rounded-xl bg-[#38BDF8] font-semibold text-[#06202E] transition-[opacity,transform] duration-150 hover:scale-[1.03] disabled:opacity-40"
          >
            OK
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
