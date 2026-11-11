import React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-[#F59E0B] text-[#1A1202] hover:bg-[#FBBF24]",
        outline: "border-[#8B5CF6]/50 bg-transparent text-[#EDE9FE] hover:bg-[#8B5CF6]/20",
        secondary: "bg-[#8B5CF6]/30 text-white hover:bg-[#8B5CF6]/45",
        ghost: "text-[#EDE9FE] hover:bg-white/10 hover:text-white",
        destructive: "bg-[#F87171]/15 text-[#FCA5A5] hover:bg-[#F87171]/25",
        link: "text-[#FDE68A] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4",
        xs: "h-6 gap-1 rounded-md px-2 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1 rounded-md px-3 text-[0.8rem] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-11 gap-2 px-6 text-base",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    /** Élément à rendre à la place du <button> (ex. un <Link/> de react-router). */
    render?: React.ReactElement;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, render, ...props }, ref) => {
    const classes = cn(buttonVariants({ variant, size }), className);
    if (render) {
      const el = render as React.ReactElement<{ className?: string }>;
      return React.cloneElement(el, {
        ...(el.props as object),
        ...(props as object),
        className: cn(classes, el.props.className),
      } as never);
    }
    return <button ref={ref} data-slot="button" className={classes} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
