import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary-glow)/0.5)] hover:scale-[1.02] border border-primary/20",
        destructive:
          "bg-gradient-to-r from-destructive to-red-400 text-destructive-foreground hover:shadow-[0_0_30px_hsl(var(--destructive)/0.5)] hover:scale-[1.02] border border-destructive/20",
        outline:
          "border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-accent/20 hover:text-accent-foreground hover:border-accent/50 hover:shadow-[0_0_20px_hsl(var(--accent)/0.3)]",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary-glow text-secondary-foreground hover:shadow-[0_0_30px_hsl(var(--secondary-glow)/0.5)] hover:scale-[1.02] border border-secondary/20",
        ghost: "hover:bg-accent/20 hover:text-accent-foreground hover:shadow-[0_0_15px_hsl(var(--accent)/0.2)]",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        premium: "bg-gradient-to-r from-accent to-accent-glow text-accent-foreground hover:shadow-[0_0_30px_hsl(var(--accent-glow)/0.5)] hover:scale-[1.02] border border-accent/20",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-md px-4",
        lg: "h-13 rounded-lg px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
