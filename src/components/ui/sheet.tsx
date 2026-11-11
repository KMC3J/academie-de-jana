import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
};

function Sheet({ open, onOpenChange, children }: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      {children}
    </div>,
    document.body,
  );
}

type SheetContentProps = React.ComponentProps<"div"> & { side?: "left" | "right" };

function SheetContent({ className, children, side = "right", ...props }: SheetContentProps) {
  return (
    <div
      data-slot="sheet-content"
      className={cn(
        "fixed inset-y-0 z-50 flex w-3/4 max-w-sm flex-col overflow-y-auto border-[#8B5CF6]/25 bg-[#120F22] p-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]",
        side === "left" ? "left-0 border-r" : "right-0 border-l",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/** Le déclencheur d'origine (base-ui) acceptait un `render` : on le conserve par simple onClick. */
function SheetTrigger({
  render,
  onClick,
}: {
  render?: React.ReactElement;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  if (!render) return null;
  const el = render as React.ReactElement<{ onClick?: () => void }>;
  return React.cloneElement(el, { onClick });
}

function SheetTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="sheet-title" className={cn("font-heading text-lg font-bold text-white", className)} {...props} />;
}

export { Sheet, SheetContent, SheetTitle, SheetTrigger };
