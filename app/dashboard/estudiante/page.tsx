"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { estudianteApi, cursosApi, type EstudianteProfile, type Matricula, type Clase, type Curso } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ClassCalendar } from "@/components/class-calendar"

export default function EstudianteDashboard() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<EstudianteProfile | null>(null)
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [proximasClases, setProximasClases] = useState<Clase[]>([])
  const [todasClases, setTodasClases] = useState<Clase[]>([])
  const [cursoActual, setCursoActual] = useState<Curso | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [profileData, matriculasData, clasesData] = await Promise.all([
        estudianteApi.getProfile(),
        estudianteApi.getMatriculas(),
        estudianteApi.getClases(),
      ])

      setProfile(profileData)
      setMatriculas(matriculasData)
      setTodasClases(clasesData)

      // Filter upcoming classes
      const now = new Date()
      const upcoming = clasesData
        .filter((clase) => new Date(clase.fecha) >= now && clase.estado === "programada")
        .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
        .slice(0, 5)
      setProximasClases(upcoming)

      // Load current course if exists
      if (profileData.cursoActual) {
        const curso = await cursosApi.getById(profileData.cursoActual)
        setCursoActual(curso)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del dashboard.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout role="estudiante">
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const estadoColors = {
    activo: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    inactivo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    graduado: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    retirado: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const estadoLabels = {
    activo: "Activo",
    inactivo: "Inactivo",
    graduado: "Graduado",
    retirado: "Retirado",
  }

  return (
    <DashboardLayout role="estudiante">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mi Dashboard</h1>
            <p className="text-muted-foreground">Bienvenido a tu panel de estudiante</p>
          </div>
          {profile && <Badge className={estadoColors[profile.estado]}>{estadoLabels[profile.estado]}</Badge>}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Curso Actual</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {cursoActual ? (
                <>
                  <div className="text-2xl font-bold">{cursoActual.nombre}</div>
                  <p className="text-xs text-muted-foreground">{cursoActual.codigo}</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No estás inscrito en ningún curso</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximas Clases</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proximasClases.length}</div>
              <p className="text-xs text-muted-foreground">Clases programadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Cursos Completados</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.historialCursos.filter((c) => c.estado === "completado").length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Total completados</p>
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
        <ClassCalendar clases={todasClases} />

        {/* Current Course */}
        {cursoActual && (
          <Card>
            <CardHeader>
              <CardTitle>Curso en Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-semibold">{cursoActual.nombre}</h3>
                  <p className="mb-4 text-sm text-muted-foreground">{cursoActual.descripcion}</p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{cursoActual.duracionSemanas} semanas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Nivel {cursoActual.nivel}</span>
                    </div>
                  </div>
                </div>
                <Link href={`/cursos/${cursoActual._id}`}>
                  <Button variant="outline" className="bg-transparent">
                    Ver Detalles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Clases</CardTitle>
          </CardHeader>
          <CardContent>
            {proximasClases.length > 0 ? (
              <div className="space-y-4">
                {proximasClases.map((clase) => (
                  <div key={clase._id} className="flex items-start justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{clase.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{clase.descripcion}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(clase.fecha).toLocaleDateString("es-ES")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {clase.horaInicio} - {clase.horaFin}
                          </span>
                        </div>
                        <Badge variant="outline">{clase.modalidad}</Badge>
                      </div>
                    </div>
                  </div>
                ))}
                <Link href="/dashboard/estudiante/clases">
                  <Button variant="outline" className="w-full bg-transparent">
                    Ver Todas las Clases
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No tienes clases programadas próximamente.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {!cursoActual && (
          <Card className="border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <h3 className="mb-2 font-semibold">¿Listo para comenzar?</h3>
              <p className="mb-4 text-sm text-muted-foreground">
                Explora nuestros cursos y comienza tu camino en la barbería profesional.
              </p>
              <Link href="/cursos">
                <Button>Explorar Cursos</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
