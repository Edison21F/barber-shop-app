"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  TrendingUp,
  CheckCircle2,
  Target,
  Calendar,
  Users,
  ArrowLeft,
  ShoppingCart,
  AlertCircle,
} from "lucide-react"
import { cursosApi, carritoApi, type Curso, type Periodo, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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

const estadoColors = {
  planificado: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  inscripciones_abiertas: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  en_curso: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  finalizado: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

const estadoLabels = {
  planificado: "Planificado",
  inscripciones_abiertas: "Inscripciones Abiertas",
  en_curso: "En Curso",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
}

export default function CursoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [curso, setCurso] = useState<Curso | null>(null)
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const isAuthenticated = typeof window !== "undefined" && getAuthToken() !== null

  useEffect(() => {
    if (params.id) {
      loadCursoDetails(params.id as string)
    }
  }, [params.id])

  const loadCursoDetails = async (id: string) => {
    try {
      const [cursoData, periodosData] = await Promise.all([cursosApi.getById(id), cursosApi.getPeriodosByCurso(id)])

      setCurso(cursoData)
      setPeriodos(periodosData)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del curso.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnroll = (periodoId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para inscribirte en un curso.",
      })
      router.push("/login")
      return
    }

    // Navigate to enrollment page or add to cart
    router.push(`/matricula?cursoId=${curso?._id}&periodoId=${periodoId}`)
  }

  const handleAddToCart = async (periodoId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para agregar cursos al carrito.",
      })
      router.push("/login")
      return
    }

    if (!curso) return

    setAddingToCart(periodoId)
    try {
      await carritoApi.addItem({
        cursoId: curso._id,
        periodoId,
      })
      toast({
        title: "Agregado al carrito",
        description: "El curso ha sido agregado a tu carrito de compras.",
      })
      router.push("/carrito")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el curso al carrito.",
        variant: "destructive",
      })
    } finally {
      setAddingToCart(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-32 rounded bg-muted" />
            <div className="h-12 w-3/4 rounded bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h1 className="mb-2 text-2xl font-bold">Curso no encontrado</h1>
          <p className="mb-6 text-muted-foreground">El curso que buscas no existe o ha sido eliminado.</p>
          <Link href="/cursos">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a cursos
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Back button */}
        <Link
          href="/cursos"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a cursos
        </Link>

        {/* Course Header */}
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Badge className={nivelColors[curso.nivel]}>{nivelLabels[curso.nivel]}</Badge>
            <span className="text-sm text-muted-foreground">{curso.codigo}</span>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-balance">{curso.nombre}</h1>
          <p className="text-xl text-muted-foreground text-pretty">{curso.descripcion}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Course Image */}
            {curso.imagen && (
              <div className="overflow-hidden rounded-lg">
                <img src={curso.imagen || "/placeholder.svg"} alt={curso.nombre} className="h-64 w-full object-cover" />
              </div>
            )}

            {/* Objetivos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Objetivos del Curso
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {curso.objetivos.map((objetivo, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span>{objetivo}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Requisitos */}
            {curso.requisitos.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Requisitos</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {curso.requisitos.map((requisito, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground" />
                        <span>{requisito}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Periodos Disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Períodos Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {periodos.length > 0 ? (
                  <div className="space-y-4">
                    {periodos.map((periodo) => (
                      <div key={periodo._id} className="rounded-lg border p-4">
                        <div className="mb-3 flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{periodo.nombre}</h4>
                            <p className="text-sm text-muted-foreground">{periodo.codigo}</p>
                          </div>
                          <Badge className={estadoColors[periodo.estado]}>{estadoLabels[periodo.estado]}</Badge>
                        </div>

                        <div className="mb-3 space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Inicio:</span>{" "}
                            {new Date(periodo.fechaInicio).toLocaleDateString("es-ES")}
                          </p>
                          <p>
                            <span className="font-medium">Fin:</span>{" "}
                            {new Date(periodo.fechaFin).toLocaleDateString("es-ES")}
                          </p>
                          <p>
                            <span className="font-medium">Horario:</span> {periodo.horario}
                          </p>
                          <p>
                            <span className="font-medium">Cupos disponibles:</span> {periodo.cuposDisponibles}
                          </p>
                        </div>

                        {periodo.observaciones && (
                          <p className="mb-3 text-sm text-muted-foreground">{periodo.observaciones}</p>
                        )}

                        {periodo.estado === "inscripciones_abiertas" && periodo.cuposDisponibles > 0 && (
                          <Button
                            onClick={() => handleAddToCart(periodo._id)}
                            disabled={addingToCart === periodo._id}
                            className="w-full"
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {addingToCart === periodo._id ? "Agregando..." : "Agregar al Carrito"}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    No hay períodos disponibles en este momento. Vuelve pronto para ver nuevas fechas.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información del Curso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-primary">${curso.precio.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">Precio del curso</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{curso.duracionSemanas} semanas</p>
                      <p className="text-sm text-muted-foreground">Duración</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{curso.cupoMaximo} estudiantes</p>
                      <p className="text-sm text-muted-foreground">Cupo máximo</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <TrendingUp className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{nivelLabels[curso.nivel]}</p>
                      <p className="text-sm text-muted-foreground">Nivel</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!isAuthenticated && (
              <Card className="border-primary/50 bg-primary/5">
                <CardContent className="pt-6">
                  <p className="mb-4 text-sm">
                    Inicia sesión para inscribirte en este curso y acceder a más beneficios.
                  </p>
                  <Link href="/login">
                    <Button className="w-full">Iniciar Sesión</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
