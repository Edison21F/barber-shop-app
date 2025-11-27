import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, CheckCircle2, Scissors } from "lucide-react"
import type { Curso } from "@/lib/api"

interface CourseCardProps {
  curso: Curso
}

const nivelColors = {
  basico: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
  intermedio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  avanzado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
}

const nivelLabels = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
}

export function CourseCard({ curso }: CourseCardProps) {
  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-border/50 bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-40" />

        <Badge className={`absolute top-4 right-4 z-20 backdrop-blur-md shadow-sm ${nivelColors[curso.nivel]}`}>
          {nivelLabels[curso.nivel]}
        </Badge>

        {curso.imagen ? (
          <img
            src={curso.imagen}
            alt={curso.nombre}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary/5">
            <Scissors className="h-16 w-16 text-secondary/40" />
          </div>
        )}
      </div>

      <CardHeader className="relative z-10 -mt-12 pb-2">
        <div className="rounded-lg bg-background/95 p-4 shadow-sm backdrop-blur-sm border border-border/50">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
              <Clock className="h-3.5 w-3.5" />
              <span>{curso.duracionSemanas} semanas</span>
            </div>
            <span className="text-lg font-bold text-primary">${curso.precio}</span>
          </div>
          <CardTitle className="line-clamp-1 text-xl">{curso.nombre}</CardTitle>
          <p className="text-xs text-muted-foreground mt-1 font-mono">{curso.codigo}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-4">
        <p className="mb-6 line-clamp-3 text-sm text-muted-foreground leading-relaxed">
          {curso.descripcion}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground/80">
            <TrendingUp className="h-4 w-4 text-primary/70 shrink-0" />
            <span>Cupo máximo: {curso.cupoMaximo} estudiantes</span>
          </div>
          {(curso.objetivos || []).slice(0, 1).map((obj, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground/80">
              <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{obj}</span>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Link href={`/cursos/${curso._id}`} className="w-full">
          <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="secondary">
            Ver Detalles
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
