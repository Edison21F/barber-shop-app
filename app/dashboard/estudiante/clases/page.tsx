"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Video, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { estudianteApi, type Clase } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function EstudianteClasesPage() {
  const { toast } = useToast()
  const [clases, setClases] = useState<Clase[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadClases()
  }, [])

  const loadClases = async () => {
    try {
      const data = await estudianteApi.getClases()
      setClases(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las clases.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const now = new Date()
  now.setHours(0, 0, 0, 0) // Normalizar 'ahora' al inicio del día

  const proximasClases = clases
    .filter((clase) => {
      const fechaClase = new Date(clase.fecha)
      // Ajustar fechaClase para compensar zona horaria si es necesario, 
      // pero por ahora asumimos que la fecha viene correcta o usamos UTC
      // Mejor enfoque: comparar strings de fecha local o timestamps normalizados

      // Normalizar fecha de clase al inicio del día (local)
      const fechaClaseLocal = new Date(fechaClase.getFullYear(), fechaClase.getMonth(), fechaClase.getDate())

      return fechaClaseLocal >= now && clase.estado === "programada"
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())

  const clasesFinalizadas = clases
    .filter((clase) => clase.estado === "finalizada")
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const todasClases = [...clases].sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

  const estadoColors = {
    programada: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    en_curso: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    finalizada: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const estadoLabels = {
    programada: "Programada",
    en_curso: "En Curso",
    finalizada: "Finalizada",
    cancelada: "Cancelada",
  }

  const modalidadColors = {
    presencial: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    virtual: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
    hibrida: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  }

  const modalidadLabels = {
    presencial: "Presencial",
    virtual: "Virtual",
    hibrida: "Híbrida",
  }

  if (isLoading) {
    return (
      <DashboardLayout role="estudiante">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </DashboardLayout>
    )
  }

  const ClaseCard = ({ clase }: { clase: Clase }) => {
    const fechaClase = new Date(clase.fecha)
    const esHoy = fechaClase.toDateString() === now.toDateString()
    const esPasada = fechaClase < now

    return (
      <Card className={esHoy ? "border-primary" : ""}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="mb-2">{clase.titulo}</CardTitle>
              <p className="text-sm text-muted-foreground">{clase.descripcion}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={estadoColors[clase.estado]}>{estadoLabels[clase.estado]}</Badge>
              <Badge className={modalidadColors[clase.modalidad]}>{modalidadLabels[clase.modalidad]}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={esHoy ? "font-semibold text-primary" : ""}>
                {fechaClase.toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {clase.horaInicio} - {clase.horaFin}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{clase.ubicacion}</span>
            </div>

            {clase.modalidad === "virtual" && clase.enlaceVirtual && (
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <a
                  href={clase.enlaceVirtual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Unirse a la clase
                </a>
              </div>
            )}
          </div>

          {clase.materialesClase.length > 0 && (
            <div className="rounded-lg bg-muted p-3">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Materiales necesarios:</span>
              </div>
              <ul className="ml-6 list-disc text-sm text-muted-foreground">
                {clase.materialesClase.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
          )}

          {clase.observaciones && (
            <div className="rounded-lg bg-muted p-3">
              <div className="mb-1 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Observaciones:</span>
              </div>
              <p className="text-sm text-muted-foreground">{clase.observaciones}</p>
            </div>
          )}

          {clase.estado === "finalizada" && clase.asistencia.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Asistencia registrada</span>
            </div>
          )}

          {esHoy && clase.estado === "programada" && (
            <div className="rounded-lg bg-primary/10 p-3 text-center">
              <p className="text-sm font-medium text-primary">Esta clase es hoy</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <DashboardLayout role="estudiante">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Clases</h1>
          <p className="text-muted-foreground">Consulta tu horario y próximas clases</p>
        </div>

        <Tabs defaultValue="proximas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="proximas">
              Próximas
              {proximasClases.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {proximasClases.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="finalizadas">
              Finalizadas
              {clasesFinalizadas.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {clasesFinalizadas.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="todas">Todas</TabsTrigger>
          </TabsList>

          <TabsContent value="proximas" className="space-y-4">
            {proximasClases.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {proximasClases.map((clase) => (
                  <ClaseCard key={clase._id} clase={clase} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No hay clases próximas</h3>
                  <p className="text-sm text-muted-foreground">
                    No tienes clases programadas en este momento. Revisa más tarde para ver nuevas clases.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="finalizadas" className="space-y-4">
            {clasesFinalizadas.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {clasesFinalizadas.map((clase) => (
                  <ClaseCard key={clase._id} clase={clase} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No hay clases finalizadas</h3>
                  <p className="text-sm text-muted-foreground">Aún no has completado ninguna clase.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="todas" className="space-y-4">
            {todasClases.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {todasClases.map((clase) => (
                  <ClaseCard key={clase._id} clase={clase} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No hay clases</h3>
                  <p className="text-sm text-muted-foreground">
                    No tienes clases registradas. Inscríbete en un curso para comenzar.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Calendar View */}
        <Card>
          <CardHeader>
            <CardTitle>Vista de Calendario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proximasClases.slice(0, 7).map((clase) => {
                const fechaClase = new Date(clase.fecha)
                const esHoy = fechaClase.toDateString() === now.toDateString()

                return (
                  <div
                    key={clase._id}
                    className={`flex items-center gap-4 rounded-lg border p-4 ${esHoy ? "border-primary bg-primary/5" : ""}`}
                  >
                    <div className="flex flex-col items-center rounded-lg bg-muted px-4 py-2">
                      <span className="text-2xl font-bold">
                        {fechaClase.toLocaleDateString("es-ES", { day: "numeric" })}
                      </span>
                      <span className="text-xs uppercase text-muted-foreground">
                        {fechaClase.toLocaleDateString("es-ES", { month: "short" })}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h4 className="font-semibold">{clase.titulo}</h4>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        <span>
                          {clase.horaInicio} - {clase.horaFin}
                        </span>
                        <span>•</span>
                        <span>{clase.ubicacion}</span>
                      </div>
                    </div>

                    <Badge className={modalidadColors[clase.modalidad]}>{modalidadLabels[clase.modalidad]}</Badge>
                  </div>
                )
              })}

              {proximasClases.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No hay clases programadas para mostrar en el calendario.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
