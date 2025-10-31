import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.96] disabled:pointer-events-none disabled:opacity-50 will-change-transform [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-[0_1px_3px_hsl(var(--primary)/0.4),0_2px_6px_hsl(var(--primary)/0.25),0_8px_16px_-4px_hsl(var(--primary)/0.15)] hover:shadow-[0_4px_16px_hsl(var(--primary)/0.5),0_8px_24px_hsl(var(--primary)/0.35),0_12px_32px_-8px_hsl(var(--primary)/0.2)] hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]",
        destructive:
          "bg-gradient-to-br from-destructive to-destructive/90 text-destructive-foreground shadow-[0_2px_8px_hsl(var(--destructive)/0.3)] hover:shadow-[0_4px_16px_hsl(var(--destructive)/0.4)] hover:scale-[1.02]",
        outline:
          "border border-input bg-background/50 backdrop-blur-sm hover:bg-accent/80 hover:text-accent-foreground hover:shadow-[0_2px_8px_hsl(var(--foreground)/0.08)] hover:border-primary/30 hover:scale-[1.01]",
        secondary:
          "bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground shadow-sm hover:shadow-[0_4px_12px_hsl(var(--foreground)/0.1)] hover:scale-[1.02]",
        ghost: "hover:bg-accent/60 hover:text-accent-foreground hover:scale-[1.01]",
        link: "text-primary underline-offset-4 hover:underline hover:brightness-110",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
