"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Clase } from "@/lib/api"

interface ClassCalendarProps {
  clases: Clase[]
}

export function ClassCalendar({ clases }: ClassCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getClassesForDay = (date: Date | null) => {
    if (!date) return []
    return clases.filter((clase) => {
      const claseDate = new Date(clase.fecha)
      return (
        claseDate.getDate() === date.getDate() &&
        claseDate.getMonth() === date.getMonth() &&
        claseDate.getFullYear() === date.getFullYear()
      )
    })
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = getDaysInMonth(currentDate)
  const today = new Date()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={previousMonth} className="bg-transparent">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth} className="bg-transparent">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => {
            const dayClases = getClassesForDay(date)
            const isToday =
              date &&
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()

            return (
              <div
                key={index}
                className={`min-h-[80px] rounded-lg border p-2 ${
                  !date ? "bg-muted/50" : isToday ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                }`}
              >
                {date && (
                  <>
                    <div className={`mb-1 text-sm font-medium ${isToday ? "text-primary" : ""}`}>{date.getDate()}</div>
                    <div className="space-y-1">
                      {dayClases.slice(0, 2).map((clase) => (
                        <div
                          key={clase._id}
                          className="truncate rounded bg-primary/10 px-1 py-0.5 text-xs text-primary"
                          title={clase.titulo}
                        >
                          {clase.horaInicio} {clase.titulo}
                        </div>
                      ))}
                      {dayClases.length > 2 && (
                        <div className="text-xs text-muted-foreground">+{dayClases.length - 2} más</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 border-t pt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Clases programadas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full border-2 border-primary" />
            <span className="text-muted-foreground">Día actual</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
