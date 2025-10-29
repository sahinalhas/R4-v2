import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:scale-105",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary via-primary to-primary/90 text-primary-foreground shadow-[0_2px_8px_hsl(var(--primary)/0.3)] hover:shadow-[0_4px_12px_hsl(var(--primary)/0.4)] hover:brightness-110",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground shadow-sm hover:shadow-md hover:brightness-105",
        destructive:
          "border-transparent bg-gradient-to-r from-destructive to-destructive/90 text-destructive-foreground shadow-[0_2px_8px_hsl(var(--destructive)/0.25)] hover:shadow-[0_4px_12px_hsl(var(--destructive)/0.35)]",
        outline: "text-foreground border-border/60 bg-background/50 backdrop-blur-sm hover:bg-accent/70 hover:border-primary/40",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
