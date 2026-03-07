import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const switchVariants = cva(
  "peer group relative inline-flex h-[24px] w-[44px] min-w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 flex-none",
  {
    variants: {
      variant: {
        default: "data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-800",
        brand: "data-[state=checked]:bg-[var(--primary-fixed)] data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-800",
        success: "data-[state=checked]:bg-[#22C55E] data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-800",
      },
      size: {
        sm: "h-[20px] w-[36px] min-w-[36px]",
        default: "h-[24px] w-[44px] min-w-[44px]",
        lg: "h-[28px] w-[48px] min-w-[48px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const thumbVariants = cva(
  "pointer-events-none block rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out border border-black/5",
  {
    variants: {
      size: {
        sm: "h-[16px] w-[16px] data-[state=checked]:translate-x-[16px] data-[state=unchecked]:translate-x-0",
        default: "h-[20px] w-[20px] data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0",
        lg: "h-[24px] w-[24px] data-[state=checked]:translate-x-[20px] data-[state=unchecked]:translate-x-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>,
  VariantProps<typeof switchVariants> { }

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, variant, size, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(switchVariants({ variant, size, className }))}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(thumbVariants({ size }))}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
