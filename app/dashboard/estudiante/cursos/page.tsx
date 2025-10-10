"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Calendar, Clock, DollarSign, FileText, AlertCircle } from "lucide-react"
import { estudianteApi, cursosApi, type Matricula, type Curso, type Periodo } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

interface MatriculaWithDetails extends Matricula {
  curso?: Curso
  periodo?: Periodo
}

export default function EstudianteCursosPage() {
  const { toast } = useToast()
  const [matriculas, setMatriculas] = useState<MatriculaWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadMatriculas()
  }, [])

  const loadMatriculas = async () => {
    try {
      const matriculasData = await estudianteApi.getMatriculas()

      // Load details for each matricula
      const matriculasWithDetails = await Promise.all(
        matriculasData.map(async (matricula) => {
          try {
            const periodo = await cursosApi.getById(matricula.periodoId)
            const curso = await cursosApi.getById(periodo._id)
            return { ...matricula, curso, periodo }
          } catch (error) {
            return matricula
          }
        }),
      )

      setMatriculas(matriculasWithDetails)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las matrículas.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const estadoColors = {
    pendiente: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    pagada: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    completada: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    cancelada: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  }

  const estadoLabels = {
    pendiente: "Pendiente",
    pagada: "Pagada",
    completada: "Completada",
    cancelada: "Cancelada",
  }

  const activas = matriculas.filter((m) => m.estado === "pagada" || m.estado === "completada")
  const pendientes = matriculas.filter((m) => m.estado === "pendiente")
  const historial = matriculas.filter((m) => m.estado === "cancelada")

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

  const MatriculaCard = ({ matricula }: { matricula: MatriculaWithDetails }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="mb-2">{matricula.curso?.nombre || "Curso"}</CardTitle>
            <p className="text-sm text-muted-foreground">{matricula.curso?.codigo}</p>
          </div>
          <Badge className={estadoColors[matricula.estado]}>{estadoLabels[matricula.estado]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {matricula.periodo && (
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {new Date(matricula.periodo.fechaInicio).toLocaleDateString("es-ES")} -{" "}
                {new Date(matricula.periodo.fechaFin).toLocaleDateString("es-ES")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{matricula.periodo.horario}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg bg-muted p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Total pagado:</span>
          </div>
          <span className="font-bold text-primary">${matricula.montoPagado.toFixed(2)}</span>
        </div>

        {matricula.montoPendiente > 0 && (
          <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-3 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <span className="text-sm font-medium">Pendiente:</span>
            </div>
            <span className="font-bold text-yellow-600 dark:text-yellow-400">
              ${matricula.montoPendiente.toFixed(2)}
            </span>
          </div>
        )}

        {matricula.observaciones && (
          <div className="rounded-lg bg-muted p-3">
            <div className="mb-1 flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Observaciones:</span>
            </div>
            <p className="text-sm text-muted-foreground">{matricula.observaciones}</p>
          </div>
        )}

        {matricula.curso && (
          <Link href={`/cursos/${matricula.curso._id}`}>
            <Button variant="outline" className="w-full bg-transparent">
              Ver Detalles del Curso
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout role="estudiante">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mis Cursos</h1>
          <p className="text-muted-foreground">Gestiona tus matrículas y cursos activos</p>
        </div>

        <Tabs defaultValue="activas" className="space-y-6">
          <TabsList>
            <TabsTrigger value="activas">
              Activas
              {activas.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activas.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="pendientes">
              Pendientes
              {pendientes.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendientes.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="historial">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="activas" className="space-y-4">
            {activas.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {activas.map((matricula) => (
                  <MatriculaCard key={matricula._id} matricula={matricula} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No tienes cursos activos</h3>
                  <p className="mb-6 text-sm text-muted-foreground">
                    Explora nuestro catálogo y comienza tu formación.
                  </p>
                  <Link href="/cursos">
                    <Button>Ver Cursos Disponibles</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="pendientes" className="space-y-4">
            {pendientes.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {pendientes.map((matricula) => (
                  <MatriculaCard key={matricula._id} matricula={matricula} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">No tienes matrículas pendientes</h3>
                  <p className="text-sm text-muted-foreground">Todas tus matrículas están al día.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="historial" className="space-y-4">
            {historial.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2">
                {historial.map((matricula) => (
                  <MatriculaCard key={matricula._id} matricula={matricula} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-lg font-semibold">Sin historial</h3>
                  <p className="text-sm text-muted-foreground">No hay matrículas canceladas o finalizadas.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
