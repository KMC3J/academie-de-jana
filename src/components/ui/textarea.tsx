import * as React from "react";

import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        "flex min-h-16 w-full rounded-lg border border-[#8B5CF6]/30 bg-[#0D0B18] px-2.5 py-2 text-base text-white transition-colors outline-none placeholder:text-[#A7A1C8]/60 focus-visible:border-[#F59E0B] focus-visible:ring-2 focus-visible:ring-[#F59E0B]/30 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
