import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-sm px-3.5 py-2 text-sm ring-offset-background transition-all duration-300 ease-out file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 hover:border-primary/30 hover:bg-background/90 hover:shadow-[0_0_0_3px_hsl(var(--primary)/0.05)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 focus-visible:border-primary/50 focus-visible:shadow-[0_0_0_4px_hsl(var(--primary)/0.08)] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
