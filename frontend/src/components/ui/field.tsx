import * as React from "react"
import { cn } from "../../lib/utils"

const FieldGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
    />
))
FieldGroup.displayName = "FieldGroup"

const Field = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "vertical", ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex gap-3",
            orientation === "vertical" ? "flex-col" : "flex-row items-center",
            className
        )}
        {...props}
    />
))
Field.displayName = "Field"

const FieldLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none text-[var(--text-main)] peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    />
))
FieldLabel.displayName = "FieldLabel"

export { Field, FieldGroup, FieldLabel }
