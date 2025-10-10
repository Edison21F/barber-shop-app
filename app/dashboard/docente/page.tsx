"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Star, Clock } from "lucide-react"
import { docenteApi, type DocenteProfile, type Clase } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DocenteDashboard() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<DocenteProfile | null>(null)
  const [clases, setClases] = useState<Clase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [profileData, clasesData] = await Promise.all([docenteApi.getProfile(), docenteApi.getClases()])

      setProfile(profileData)
      setClases(clasesData)
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
      <DashboardLayout role="docente">
        <div className="space-y-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const now = new Date()
  const proximasClases = clases
    .filter((clase) => new Date(clase.fecha) >= now && clase.estado === "programada")
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  const clasesHoy = proximasClases.filter((clase) => {
    const claseDate = new Date(clase.fecha)
    return claseDate.toDateString() === now.toDateString()
  })

  const totalEstudiantes = clases.reduce((sum, clase) => sum + clase.asistencia.length, 0)

  return (
    <DashboardLayout role="docente">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Docente</h1>
            <p className="text-muted-foreground">Gestiona tus clases y estudiantes</p>
          </div>
          {profile && (
            <Badge variant={profile.activo ? "default" : "secondary"}>{profile.activo ? "Activo" : "Inactivo"}</Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clases Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clasesHoy.length}</div>
              <p className="text-xs text-muted-foreground">Programadas para hoy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Próximas Clases</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{proximasClases.length}</div>
              <p className="text-xs text-muted-foreground">Clases programadas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Estudiantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEstudiantes}</div>
              <p className="text-xs text-muted-foreground">En todas las clases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Calificación</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.calificacionPromedio?.toFixed(1) || "N/A"}</div>
              <p className="text-xs text-muted-foreground">Promedio</p>
            </CardContent>
          </Card>
        </div>

        {/* Profile Summary */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil Profesional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-semibold">Especialidad</h4>
                  <p className="text-muted-foreground">{profile.especialidad}</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Experiencia</h4>
                  <p className="text-muted-foreground">{profile.añosExperiencia} años</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Certificaciones</h4>
                  <p className="text-muted-foreground">{profile.certificaciones.length} certificaciones</p>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold">Horarios Disponibles</h4>
                  <p className="text-muted-foreground">{profile.horarioDisponible.length} bloques</p>
                </div>
              </div>
              <div className="mt-4">
                <Link href="/dashboard/docente/perfil">
                  <Button variant="outline" className="bg-transparent">
                    Ver Perfil Completo
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Classes */}
        {clasesHoy.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Clases de Hoy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clasesHoy.map((clase) => (
                  <div key={clase._id} className="flex items-start justify-between rounded-lg border p-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{clase.titulo}</h4>
                      <p className="text-sm text-muted-foreground">{clase.descripcion}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {clase.horaInicio} - {clase.horaFin}
                          </span>
                        </div>
                        <Badge variant="outline">{clase.modalidad}</Badge>
                        <span className="text-muted-foreground">{clase.asistencia.length} estudiantes</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Classes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Próximas Clases</CardTitle>
              <Link href="/dashboard/docente/clases">
                <Button variant="outline" size="sm" className="bg-transparent">
                  Ver Todas
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {proximasClases.length > 0 ? (
              <div className="space-y-4">
                {proximasClases.slice(0, 5).map((clase) => (
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
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No tienes clases programadas próximamente.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
