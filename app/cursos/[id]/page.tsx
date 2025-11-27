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
  Share2,
  Award,
  BookOpen
} from "lucide-react"
import { cursosApi, carritoApi, type Curso, type Periodo, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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

const estadoColors = {
  planificado: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  inscripciones_abiertas: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
  en_curso: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  finalizado: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  cancelado: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
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
            <div className="h-96 w-full rounded-xl bg-muted" />
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-12 w-3/4 rounded bg-muted" />
                <div className="h-64 rounded-lg bg-muted" />
              </div>
              <div className="h-96 rounded-lg bg-muted" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!curso) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="mb-2 text-3xl font-bold">Curso no encontrado</h1>
          <p className="mb-8 text-muted-foreground max-w-md mx-auto">El curso que buscas no existe o ha sido eliminado.</p>
          <Link href="/cursos">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />

      {/* Hero Section with Background Image */}
      <div className="relative w-full bg-muted/30">
        <div className="absolute inset-0 overflow-hidden">
          {curso.imagen && (
            <>
              <div className="absolute inset-0 bg-black/60 z-10" />
              <img
                src={curso.imagen}
                alt={curso.nombre}
                className="h-full w-full object-cover blur-sm scale-105"
              />
            </>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-20" />
        </div>

        <div className="container relative z-30 mx-auto px-4 pt-32 pb-12">
          <Link
            href="/cursos"
            className="mb-8 inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a cursos
          </Link>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <Badge className={`backdrop-blur-md shadow-sm ${nivelColors[curso.nivel]}`}>
                  {nivelLabels[curso.nivel]}
                </Badge>
                <Badge variant="outline" className="bg-background/50 backdrop-blur-sm">
                  {curso.codigo}
                </Badge>
              </div>

              <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl text-balance">
                {curso.nombre}
              </h1>

              <p className="text-xl text-muted-foreground text-pretty max-w-3xl leading-relaxed">
                {curso.descripcion}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-10 lg:col-span-2 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">

            {/* Image (if not used in hero, or as main visual) */}
            <div className="overflow-hidden rounded-2xl border border-border/50 shadow-xl shadow-primary/5">
              {curso.imagen ? (
                <img
                  src={curso.imagen}
                  alt={curso.nombre}
                  className="h-full w-full object-cover aspect-video"
                />
              ) : (
                <div className="aspect-video w-full bg-muted flex items-center justify-center">
                  <BookOpen className="h-20 w-20 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Objetivos */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                Lo que aprenderás
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {curso.objetivos.map((objetivo, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-muted/30 border border-border/50 hover:bg-muted/50 transition-colors">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                    <span className="text-sm leading-relaxed">{objetivo}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Requisitos */}
            {curso.requisitos.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Award className="h-6 w-6 text-primary" />
                  Requisitos previos
                </h2>
                <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                  <ul className="space-y-4">
                    {curso.requisitos.map((requisito, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{requisito}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Periodos Disponibles */}
            <div className="space-y-6" id="periodos">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Calendar className="h-6 w-6 text-primary" />
                Fechas y Horarios Disponibles
              </h2>

              {periodos.length > 0 ? (
                <div className="grid gap-6">
                  {periodos.map((periodo) => (
                    <Card key={periodo._id} className="overflow-hidden border-border/50 transition-all hover:border-primary/30 hover:shadow-md">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-1 p-6">
                          <div className="mb-4 flex items-start justify-between">
                            <div>
                              <h4 className="font-bold text-lg mb-1">{periodo.nombre}</h4>
                              <p className="text-sm text-muted-foreground font-mono">{periodo.codigo}</p>
                            </div>
                            <Badge className={estadoColors[periodo.estado]}>{estadoLabels[periodo.estado]}</Badge>
                          </div>

                          <div className="grid gap-y-2 gap-x-8 sm:grid-cols-2 text-sm mb-4">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Inicio: <span className="text-foreground font-medium">{new Date(periodo.fechaInicio).toLocaleDateString("es-ES")}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>Fin: <span className="text-foreground font-medium">{new Date(periodo.fechaFin).toLocaleDateString("es-ES")}</span></span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                              <Clock className="h-4 w-4" />
                              <span>Horario: <span className="text-foreground font-medium">{periodo.horario}</span></span>
                            </div>
                          </div>

                          {periodo.observaciones && (
                            <div className="mt-4 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground italic">
                              "{periodo.observaciones}"
                            </div>
                          )}
                        </div>

                        <div className="bg-muted/30 p-6 flex flex-col justify-center items-center gap-3 border-t md:border-t-0 md:border-l border-border/50 md:w-64">
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground mb-1">Cupos disponibles</p>
                            <p className="text-2xl font-bold text-primary">{periodo.cuposDisponibles}</p>
                          </div>

                          {(periodo.estado === "inscripciones_abiertas" || periodo.estado === "planificado" || periodo.estado === "en_curso") && periodo.cuposDisponibles > 0 ? (
                            <Button
                              onClick={() => handleAddToCart(periodo._id)}
                              disabled={addingToCart === periodo._id}
                              className="w-full shadow-lg shadow-primary/20"
                              size="lg"
                            >
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              {addingToCart === periodo._id ? "Agregando..." : "Inscribirse"}
                            </Button>
                          ) : (
                            <Button disabled variant="secondary" className="w-full opacity-50">
                              No disponible
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay períodos disponibles</h3>
                  <p className="text-muted-foreground">
                    Actualmente no hay fechas programadas para este curso. Vuelve pronto para ver nuevas aperturas.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              <Card className="border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
                <div className="bg-primary/5 p-6 border-b border-border/50 text-center">
                  <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Precio del Curso</p>
                  <p className="text-4xl font-extrabold text-primary">${curso.precio.toFixed(2)}</p>
                </div>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Clock className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Duración</span>
                      </div>
                      <span className="font-bold">{curso.duracionSemanas} semanas</span>
                    </div>

                    <div className="flex items-center justify-between pb-4 border-b border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                          <Users className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Cupo máximo</span>
                      </div>
                      <span className="font-bold">{curso.cupoMaximo} alumnos</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">Nivel</span>
                      </div>
                      <span className="font-bold capitalize">{nivelLabels[curso.nivel]}</span>
                    </div>
                  </div>

                  <Button className="w-full h-12 text-lg font-semibold" onClick={() => {
                    document.getElementById('periodos')?.scrollIntoView({ behavior: 'smooth' });
                  }}>
                    Ver Fechas Disponibles
                  </Button>

                  <div className="text-center">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartir curso
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {!isAuthenticated && (
                <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                    <h3 className="mb-2 font-semibold">¿Ya tienes cuenta?</h3>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Inicia sesión para inscribirte en este curso, gestionar tus pagos y acceder al material de estudio.
                    </p>
                    <Link href="/login">
                      <Button variant="outline" className="w-full bg-background/50 backdrop-blur-sm">Iniciar Sesión</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
