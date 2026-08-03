import React from "react"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date | undefined) => void
  className?: string
}

const Calendar: React.FC<CalendarProps> = ({ selected, onSelect, className }) => {
  const daysInMonth = new Date(selected?.getFullYear() || new Date().getFullYear(), (selected?.getMonth() || new Date().getMonth()) + 1, 0).getDate()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  return (
    <div className={cn("p-3", className)}>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
          <div key={d} className="text-muted-foreground">{d}</div>
        ))}
        {days.map((day) => {
          const isSelected = selected && selected.getDate() === day
          return (
            <button
              key={day}
              className={cn(
                "h-9 w-9 rounded-md flex items-center justify-center hover:bg-accent hover:text-accent-foreground",
                isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
              )}
              onClick={() => {
                const date = new Date(selected || new Date())
                date.setDate(day)
                onSelect?.(date)
              }}
            >
              {day}
            </button>
          )
        })}
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
