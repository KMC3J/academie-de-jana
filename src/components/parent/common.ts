import { useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";

/** Mutation for parent-only writes: invalidates `keys`, toasts, and re-locks on 401. */
export function useParentMutation<TVars, TOut>(
  fn: (v: TVars) => Promise<TOut>,
  keys: QueryKey[],
  success?: string,
  onDone?: (out: TOut) => void,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (out) => {
      keys.forEach((k) => qc.invalidateQueries({ queryKey: k }));
      if (success) toast.success(success);
      onDone?.(out);
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 401) {
        qc.invalidateQueries({ queryKey: ["parent-status"] });
        toast.error("Session parent expirée, saisis à nouveau le code.");
        return;
      }
      const detail = e instanceof ApiError ? (e.body as { detail?: unknown })?.detail : null;
      toast.error(typeof detail === "string" ? detail : "Vérifie les champs et réessaie.");
    },
  });
}

export const panel = "rounded-3xl border border-[#38BDF8]/20 bg-[#131E2A] p-5";
export const fieldLabel = "mb-1 block text-xs font-medium text-[#86EFAC]";
