import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp } from "lucide-react"
import type { Curso } from "@/lib/api"

interface CourseCardProps {
  curso: Curso
}

const nivelColors = {
  basico: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  intermedio: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  avanzado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const nivelLabels = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
}

export function CourseCard({ curso }: CourseCardProps) {
  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
        {curso.imagen ? (
          <img
            src={curso.imagen.startsWith('http') ? curso.imagen : `/api${curso.imagen}`}
            alt={curso.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-6xl font-bold text-muted-foreground/20">{curso.codigo}</span>
          </div>
        )}
        <div className="absolute right-2 top-2">
          <Badge className={nivelColors[curso.nivel]}>{nivelLabels[curso.nivel]}</Badge>
        </div>
      </div>

      <CardHeader>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-xl font-semibold leading-tight text-balance">{curso.nombre}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{curso.codigo}</p>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">{curso.descripcion}</p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{curso.duracionSemanas} semanas</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span>Cupo máximo: {curso.cupoMaximo} estudiantes</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-4">
        <div>
          <p className="text-2xl font-bold text-primary">${curso.precio.toFixed(2)}</p>
        </div>
        <Link href={`/cursos/${curso._id}`}>
          <Button>Ver Detalles</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
