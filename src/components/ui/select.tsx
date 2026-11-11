import * as React from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

// Remplacement local du Select (base-ui) : liste déroulante accessible, sans dépendance.
type SelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
};

type Option = { value: string; label: React.ReactNode };

function collectItems(children: React.ReactNode): Option[] {
  const out: Option[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const el = child as React.ReactElement<{ value?: string; children?: React.ReactNode }>;
    if (typeof el.props.value === "string") {
      out.push({ value: el.props.value, label: el.props.children });
    } else if (el.props.children) {
      out.push(...collectItems(el.props.children));
    }
  });
  return out;
}

function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const items = collectItems(children);
  const current = items.find((i) => i.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" data-slot="select">
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        data-slot="select-trigger"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-full items-center justify-between gap-1.5 rounded-lg border border-[#8B5CF6]/30 bg-[#0D0B18] px-2.5 py-2 text-sm text-white whitespace-nowrap transition-colors outline-none hover:border-[#8B5CF6]/60 focus-visible:border-[#F59E0B]"
      >
        <span data-slot="select-value" className="flex flex-1 items-center gap-1.5 truncate text-left">
          {current?.label ?? ""}
        </span>
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 text-[#A7A1C8]" />
      </button>
      {open && (
        <div
          role="listbox"
          data-slot="select-content"
          className="absolute z-50 mt-1 max-h-72 w-full min-w-36 overflow-y-auto rounded-lg border border-[#8B5CF6]/30 bg-[#1A1530] p-1 text-white shadow-xl"
        >
          {items.map((it) => (
            <button
              key={it.value}
              type="button"
              role="option"
              aria-selected={it.value === value}
              data-slot="select-item"
              onClick={() => {
                onValueChange(it.value);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-1.5 rounded-md py-1.5 pr-2 pl-1.5 text-left text-sm outline-none hover:bg-[#8B5CF6]/25",
                it.value === value && "bg-[#8B5CF6]/15",
              )}
            >
              <span className="flex-1 truncate">{it.label}</span>
              {it.value === value && <CheckIcon className="size-4 text-[#FDE68A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Les pages passent un rendu personnalisé via <SelectValue>{fn}</SelectValue> :
// on l'ignore (la valeur affichée vient des SelectItem), ce qui garde le même rendu.
function SelectTrigger({ children, ...props }: React.ComponentProps<"div">) {
  return <div {...props}>{children}</div>;
}
function SelectValue(_: { children?: unknown }) {
  return null;
}
function SelectContent({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}
function SelectItem({ children, value }: { children?: React.ReactNode; value: string }) {
  return <>{children}</>;
}

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
