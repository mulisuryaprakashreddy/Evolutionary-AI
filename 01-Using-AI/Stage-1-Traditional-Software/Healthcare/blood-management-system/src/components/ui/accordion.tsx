import React from "react"
import { cn } from "@/lib/utils"

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: 'single' | 'multiple'
  collapsible?: boolean
}

const Accordion: React.FC<AccordionProps> = ({ children, className }) => {
  return <div className={cn("w-full", className)}>{children}</div>
}
Accordion.displayName = "Accordion"

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const AccordionItem: React.FC<AccordionItemProps> = ({ value, className, children }) => {
  return <div className={cn("border-b", className)} data-value={value}>{children}</div>
}
AccordionItem.displayName = "AccordionItem"

interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

const AccordionTrigger: React.FC<AccordionTriggerProps> = ({ className, children, ...props }) => {
  return (
    <button
      className={cn("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180", className)}
      {...props}
    >
      {children}
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 transition-transform duration-200">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
  )
}
AccordionTrigger.displayName = "AccordionTrigger"

interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const AccordionContent: React.FC<AccordionContentProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("overflow-hidden text-sm transition-all", className)} {...props}>
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
}
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
