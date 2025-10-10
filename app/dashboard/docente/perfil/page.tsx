"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Award, Calendar, Edit2, Save, X, Plus, Trash2 } from "lucide-react"
import { docenteApi, getUserData, type DocenteProfile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function DocentePerfilPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<DocenteProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const user = getUserData()

  const [formData, setFormData] = useState({
    especialidad: "",
    añosExperiencia: 0,
    certificaciones: [] as DocenteProfile["certificaciones"],
    horarioDisponible: [] as DocenteProfile["horarioDisponible"],
    activo: true,
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await docenteApi.getProfile()
      setProfile(data)
      setFormData({
        especialidad: data.especialidad,
        añosExperiencia: data.añosExperiencia,
        certificaciones: data.certificaciones,
        horarioDisponible: data.horarioDisponible,
        activo: data.activo,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el perfil.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await docenteApi.updateProfile(formData)
      toast({
        title: "Perfil actualizado",
        description: "Tus datos han sido guardados correctamente.",
      })
      setIsEditing(false)
      loadProfile()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        especialidad: profile.especialidad,
        añosExperiencia: profile.añosExperiencia,
        certificaciones: profile.certificaciones,
        horarioDisponible: profile.horarioDisponible,
        activo: profile.activo,
      })
    }
    setIsEditing(false)
  }

  const addCertificacion = () => {
    setFormData({
      ...formData,
      certificaciones: [
        ...formData.certificaciones,
        {
          nombre: "",
          institucion: "",
          fechaObtencion: new Date().toISOString().split("T")[0],
        },
      ],
    })
  }

  const removeCertificacion = (index: number) => {
    setFormData({
      ...formData,
      certificaciones: formData.certificaciones.filter((_, i) => i !== index),
    })
  }

  const updateCertificacion = (index: number, field: string, value: string) => {
    const newCertificaciones = [...formData.certificaciones]
    newCertificaciones[index] = { ...newCertificaciones[index], [field]: value }
    setFormData({ ...formData, certificaciones: newCertificaciones })
  }

  const addHorario = () => {
    setFormData({
      ...formData,
      horarioDisponible: [
        ...formData.horarioDisponible,
        {
          diaSemana: "Lunes",
          horaInicio: "09:00",
          horaFin: "17:00",
        },
      ],
    })
  }

  const removeHorario = (index: number) => {
    setFormData({
      ...formData,
      horarioDisponible: formData.horarioDisponible.filter((_, i) => i !== index),
    })
  }

  const updateHorario = (index: number, field: string, value: string) => {
    const newHorarios = [...formData.horarioDisponible]
    newHorarios[index] = { ...newHorarios[index], [field]: value }
    setFormData({ ...formData, horarioDisponible: newHorarios })
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

  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  return (
    <DashboardLayout role="docente">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información profesional</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="bg-transparent">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Award className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{`${user?.nombres} ${user?.apellidos}`}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile && (
                  <Badge className="mt-2" variant={profile.activo ? "default" : "secondary"}>
                    {profile.activo ? "Activo" : "Inactivo"}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="especialidad">Especialidad</Label>
                {isEditing ? (
                  <Input
                    id="especialidad"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                    placeholder="Ej: Cortes Clásicos"
                  />
                ) : (
                  <div className="rounded-md border bg-muted px-3 py-2">
                    <span className="text-sm">{profile?.especialidad}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experiencia">Años de Experiencia</Label>
                {isEditing ? (
                  <Input
                    id="experiencia"
                    type="number"
                    value={formData.añosExperiencia}
                    onChange={(e) =>
                      setFormData({ ...formData, añosExperiencia: Number.parseInt(e.target.value) || 0 })
                    }
                    min="0"
                  />
                ) : (
                  <div className="rounded-md border bg-muted px-3 py-2">
                    <span className="text-sm">{profile?.añosExperiencia} años</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Calificación Promedio</Label>
                <div className="rounded-md border bg-muted px-3 py-2">
                  <span className="text-sm">{profile?.calificacionPromedio?.toFixed(1) || "Sin calificaciones"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificaciones */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Certificaciones</CardTitle>
              {isEditing && (
                <Button onClick={addCertificacion} size="sm" variant="outline" className="bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {formData.certificaciones.length > 0 ? (
              <div className="space-y-4">
                {formData.certificaciones.map((cert, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="grid flex-1 gap-3">
                            <Input
                              placeholder="Nombre de la certificación"
                              value={cert.nombre}
                              onChange={(e) => updateCertificacion(index, "nombre", e.target.value)}
                            />
                            <Input
                              placeholder="Institución"
                              value={cert.institucion}
                              onChange={(e) => updateCertificacion(index, "institucion", e.target.value)}
                            />
                            <Input
                              type="date"
                              value={cert.fechaObtencion.split("T")[0]}
                              onChange={(e) => updateCertificacion(index, "fechaObtencion", e.target.value)}
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCertificacion(index)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-semibold">{cert.nombre}</h4>
                        <p className="text-sm text-muted-foreground">{cert.institucion}</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(cert.fechaObtencion).toLocaleDateString("es-ES")}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {isEditing ? "Agrega tus certificaciones profesionales" : "No hay certificaciones registradas"}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Horario Disponible */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Horario Disponible</CardTitle>
              {isEditing && (
                <Button onClick={addHorario} size="sm" variant="outline" className="bg-transparent">
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {formData.horarioDisponible.length > 0 ? (
              <div className="space-y-4">
                {formData.horarioDisponible.map((horario, index) => (
                  <div key={index} className="rounded-lg border p-4">
                    {isEditing ? (
                      <div className="flex items-center gap-3">
                        <select
                          value={horario.diaSemana}
                          onChange={(e) => updateHorario(index, "diaSemana", e.target.value)}
                          className="rounded-md border bg-background px-3 py-2"
                        >
                          {diasSemana.map((dia) => (
                            <option key={dia} value={dia}>
                              {dia}
                            </option>
                          ))}
                        </select>
                        <Input
                          type="time"
                          value={horario.horaInicio}
                          onChange={(e) => updateHorario(index, "horaInicio", e.target.value)}
                        />
                        <span>-</span>
                        <Input
                          type="time"
                          value={horario.horaFin}
                          onChange={(e) => updateHorario(index, "horaFin", e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHorario(index)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{horario.diaSemana}</span>
                        <span className="text-sm text-muted-foreground">
                          {horario.horaInicio} - {horario.horaFin}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                {isEditing ? "Agrega tu disponibilidad horaria" : "No hay horarios disponibles registrados"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
