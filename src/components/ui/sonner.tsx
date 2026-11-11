import { useEffect, useState } from "react";
import { CircleCheckIcon, InfoIcon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster as SonnerToaster } from "sonner";

/**
 * Toaster sonner accordé au thème sombre du château.
 * Les props passées par les pages (richColors, position…) sont acceptées telles quelles.
 */
const Toaster = (props: React.ComponentProps<typeof SonnerToaster>) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
      }}
      {...props}
    />
  );
};

export { Toaster };
