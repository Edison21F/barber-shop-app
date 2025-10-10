"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Video, Users, CheckCircle2, AlertCircle } from "lucide-react"
import { docenteApi, type Clase } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function DocenteClasesPage() {
  const { toast } = useToast()
  const [clases, setClases] = useState<Clase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedClase, setSelectedClase] = useState<Clase | null>(null)
  const [showAsistenciaDialog, setShowAsistenciaDialog] = useState(false)

  useEffect(() => {
    loadClases()
  }, [])

  const loadClases = async () => {
    try {
      const data = await docenteApi.getClases()
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

  const handleMarcarAsistencia = (clase: Clase) => {
    setSelectedClase(clase)
    setShowAsistenciaDialog(true)
  }

  const handleSaveAsistencia = async () => {
    if (!selectedClase) return

    try {
      await docenteApi.updateClase(selectedClase._id, {
        asistencia: selectedClase.asistencia,
        estado: "finalizada",
      })
      toast({
        title: "Asistencia guardada",
        description: "La asistencia ha sido registrada correctamente.",
      })
      setShowAsistenciaDialog(false)
      loadClases()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar la asistencia.",
        variant: "destructive",
      })
    }
  }

  const toggleAsistencia = (estudianteId: string) => {
    if (!selectedClase) return

    const newAsistencia = selectedClase.asistencia.map((a) =>
      a.estudianteId === estudianteId ? { ...a, presente: !a.presente } : a,
    )

    setSelectedClase({
      ...selectedClase,
      asistencia: newAsistencia,
    })
  }

  const now = new Date()
  const proximasClases = clases
    .filter((clase) => new Date(clase.fecha) >= now && clase.estado === "programada")
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
      <DashboardLayout role="docente">
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

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{clase.asistencia.length} estudiantes</span>
            </div>
          </div>

          {clase.modalidad === "virtual" && clase.enlaceVirtual && (
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-2">
                <Video className="h-4 w-4 text-muted-foreground" />
                <a
                  href={clase.enlaceVirtual}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Enlace de la clase virtual
                </a>
              </div>
            </div>
          )}

          {clase.estado === "programada" && esPasada && (
            <Button onClick={() => handleMarcarAsistencia(clase)} className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Marcar Asistencia
            </Button>
          )}

          {clase.estado === "finalizada" && (
            <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Asistencia registrada: {clase.asistencia.filter((a) => a.presente).length}/{clase.asistencia.length}
              </span>
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
    <DashboardLayout role="docente">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Clases</h1>
          <p className="text-muted-foreground">Gestiona tus clases y asistencia</p>
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
                  <p className="text-sm text-muted-foreground">No tienes clases programadas en este momento.</p>
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
                  <p className="text-sm text-muted-foreground">No tienes clases asignadas.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Asistencia Dialog */}
        <Dialog open={showAsistenciaDialog} onOpenChange={setShowAsistenciaDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Marcar Asistencia</DialogTitle>
              <DialogDescription>
                {selectedClase?.titulo} - {selectedClase && new Date(selectedClase.fecha).toLocaleDateString("es-ES")}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[400px] space-y-4 overflow-y-auto py-4">
              {selectedClase?.asistencia.map((asistencia, index) => (
                <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`estudiante-${index}`}
                      checked={asistencia.presente}
                      onCheckedChange={() => toggleAsistencia(asistencia.estudianteId)}
                    />
                    <Label htmlFor={`estudiante-${index}`} className="cursor-pointer">
                      Estudiante {asistencia.estudianteId.slice(-6)}
                    </Label>
                  </div>
                  {asistencia.presente && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20">
                      Presente
                    </Badge>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAsistenciaDialog(false)} className="bg-transparent">
                Cancelar
              </Button>
              <Button onClick={handleSaveAsistencia}>Guardar Asistencia</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
