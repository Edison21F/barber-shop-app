"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X } from "lucide-react"
import { estudianteApi, getUserData, type EstudianteProfile } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function EstudiantePerfilPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<EstudianteProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const user = getUserData()

  const [formData, setFormData] = useState({
    direccion: "",
    fechaNacimiento: "",
    contactoEmergencia: {
      nombre: "",
      telefono: "",
      relacion: "",
    },
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await estudianteApi.getProfile()
      setProfile(data)
      setFormData({
        direccion: data.direccion || "",
        fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split("T")[0] : "",
        contactoEmergencia: data.contactoEmergencia || {
          nombre: "",
          telefono: "",
          relacion: "",
        },
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
      await estudianteApi.updateProfile(formData)
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
        direccion: profile.direccion || "",
        fechaNacimiento: profile.fechaNacimiento ? profile.fechaNacimiento.split("T")[0] : "",
        contactoEmergencia: profile.contactoEmergencia || {
          nombre: "",
          telefono: "",
          relacion: "",
        },
      })
    }
    setIsEditing(false)
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
            <h1 className="text-3xl font-bold">Mi Perfil</h1>
            <p className="text-muted-foreground">Gestiona tu información personal</p>
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

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <User className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{`${user?.nombres} ${user?.apellidos}`}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {profile && (
                  <Badge className={`mt-2 ${estadoColors[profile.estado]}`}>{estadoLabels[profile.estado]}</Badge>
                )}
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                {isEditing ? (
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                    placeholder="Tu dirección"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.direccion || "No especificada"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                {isEditing ? (
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {profile?.fechaNacimiento
                        ? new Date(profile.fechaNacimiento).toLocaleDateString("es-ES")
                        : "No especificada"}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Fecha de Matrícula</Label>
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {profile?.fechaMatricula
                      ? new Date(profile.fechaMatricula).toLocaleDateString("es-ES")
                      : "No disponible"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Contacto de Emergencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="emergenciaNombre">Nombre</Label>
                {isEditing ? (
                  <Input
                    id="emergenciaNombre"
                    value={formData.contactoEmergencia.nombre}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactoEmergencia: { ...formData.contactoEmergencia, nombre: e.target.value },
                      })
                    }
                    placeholder="Nombre del contacto"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.contactoEmergencia?.nombre || "No especificado"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergenciaTelefono">Teléfono</Label>
                {isEditing ? (
                  <Input
                    id="emergenciaTelefono"
                    value={formData.contactoEmergencia.telefono}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactoEmergencia: { ...formData.contactoEmergencia, telefono: e.target.value },
                      })
                    }
                    placeholder="Teléfono del contacto"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.contactoEmergencia?.telefono || "No especificado"}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergenciaRelacion">Relación</Label>
                {isEditing ? (
                  <Input
                    id="emergenciaRelacion"
                    value={formData.contactoEmergencia.relacion}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactoEmergencia: { ...formData.contactoEmergencia, relacion: e.target.value },
                      })
                    }
                    placeholder="Relación (ej: Madre, Padre)"
                  />
                ) : (
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{profile?.contactoEmergencia?.relacion || "No especificada"}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course History */}
        {profile && profile.historialCursos && profile.historialCursos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cursos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.historialCursos.map((curso, index) => (
                  <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium">Curso ID: {curso.cursoId}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(curso.fechaInicio).toLocaleDateString("es-ES")} -{" "}
                        {new Date(curso.fechaFin).toLocaleDateString("es-ES")}
                      </p>
                    </div>
                    <Badge>{curso.estado}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
