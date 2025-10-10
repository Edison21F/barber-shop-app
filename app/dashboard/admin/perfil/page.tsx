"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Calendar, Shield } from "lucide-react"
import { profileApi, getUserData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

type ProfileData = Awaited<ReturnType<typeof profileApi.get>>

export default function AdminPerfilPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const user = getUserData()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await profileApi.get()
      setProfile(data)
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

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="space-y-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-64 animate-pulse rounded-lg bg-muted" />
        </div>
      </DashboardLayout>
    )
  }

  const rolLabels = {
    estudiante: "Estudiante",
    docente: "Docente",
    admin: "Administrador",
    administrador: "Administrador",
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Información de tu cuenta</p>
        </div>

        {/* Profile Card */}
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
                <h3 className="text-xl font-semibold">{`${profile?.nombres} ${profile?.apellidos}`}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                <div className="mt-2 flex gap-2">
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {rolLabels[profile?.rol as keyof typeof rolLabels] || profile?.rol}
                  </Badge>
                  <Badge variant={profile?.activo ? "default" : "secondary"}>
                    {profile?.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile?.email}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile?.cedula}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{profile?.telefono}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Registrado: {profile?.fechaRegistro ? new Date(profile.fechaRegistro).toLocaleDateString("es-ES") : "N/A"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Último acceso: {profile?.ultimoAcceso ? new Date(profile.ultimoAcceso).toLocaleDateString("es-ES") : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}