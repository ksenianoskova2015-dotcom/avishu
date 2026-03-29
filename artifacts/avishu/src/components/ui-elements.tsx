import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "outline" | "ghost", isLoading?: boolean }
>(({ className, variant = "default", isLoading, children, disabled, ...props }, ref) => {
  return (
    <button
      ref={ref}
      disabled={isLoading || disabled}
      className={cn(
        "inline-flex items-center justify-center font-display tracking-[0.2em] uppercase text-sm transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white disabled:pointer-events-none disabled:opacity-50",
        "h-14 px-8 border border-transparent",
        variant === "default" && "bg-white text-black hover:bg-zinc-200 active:bg-zinc-300",
        variant === "outline" && "bg-transparent border-zinc-700 text-white hover:border-white",
        variant === "ghost" && "bg-transparent text-white hover:bg-zinc-900",
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
Button.displayName = "Button";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-14 w-full border-b border-zinc-800 bg-transparent px-0 py-2 text-base font-sans text-white transition-colors",
        "placeholder:text-zinc-600 focus-visible:outline-none focus-visible:border-white disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});
Input.displayName = "Input";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-xs font-display tracking-[0.15em] uppercase text-zinc-500", className)}
    {...props}
  />
));
Label.displayName = "Label";

export const Badge = ({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "outline" | "success" | "warning", className?: string }) => {
  return (
    <div className={cn(
      "inline-flex items-center px-2.5 py-1 text-[10px] font-display uppercase tracking-widest",
      variant === "default" && "bg-white text-black",
      variant === "outline" && "border border-zinc-700 text-zinc-300",
      variant === "success" && "bg-emerald-950 text-emerald-400 border border-emerald-900",
      variant === "warning" && "bg-amber-950 text-amber-400 border border-amber-900",
      className
    )}>
      {children}
    </div>
  );
};

export const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <div className={cn("bg-card border border-card-border p-6", className)}>
    {children}
  </div>
);

export const Spinner = () => (
  <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
  </div>
);
