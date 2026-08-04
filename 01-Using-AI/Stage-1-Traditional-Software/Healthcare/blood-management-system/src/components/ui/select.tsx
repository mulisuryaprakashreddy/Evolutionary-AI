import React from "react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
}

const Select: React.FC<SelectProps> = ({ className, children, onValueChange, ...props }) => {
  return (
    <select
      className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)}
      onChange={(e) => onValueChange?.(e.target.value)}
      {...props}
    >
      {children}
    </select>
  )
}
Select.displayName = "Select"

const SelectContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children }) => <>{children}</>
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {}

const SelectItem: React.FC<SelectItemProps> = ({ children, ...props }) => (
  <option {...props}>{children}</option>
)
SelectItem.displayName = "SelectItem"

const SelectTrigger: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children }) => <>{children}</>
SelectTrigger.displayName = "SelectTrigger"

const SelectValue: React.FC = () => null
SelectValue.displayName = "SelectValue"

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
