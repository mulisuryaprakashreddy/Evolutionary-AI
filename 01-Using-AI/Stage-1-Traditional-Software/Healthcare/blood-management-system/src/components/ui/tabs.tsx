import React from "react"
import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, value, onValueChange, children, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const activeValue = value !== undefined ? value : internalValue

  const handleValueChange = (newValue: string) => {
    if (onValueChange) onValueChange(newValue)
    setInternalValue(newValue)
  }

  return (
    <div className={cn("", className)} data-value={activeValue}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            activeValue,
            onValueChange: handleValueChange,
          })
        }
        return child
      })}
    </div>
  )
}
Tabs.displayName = "Tabs"

const TabsList: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  activeValue?: string
  onValueChange?: (value: string) => void
}

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, activeValue, onValueChange, className, children, ...props }) => {
  const isActive = activeValue === value
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        isActive ? "bg-background text-foreground shadow-sm" : "",
        className
      )}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => onValueChange?.(value)}
      {...props}
    >
      {children}
    </button>
  )
}
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  activeValue?: string
}

const TabsContent: React.FC<TabsContentProps> = ({ value, activeValue, className, children, ...props }) => {
  if (activeValue !== value) return null
  return (
    <div className={cn("mt-2", className)} {...props}>
      {children}
    </div>
  )
}
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
