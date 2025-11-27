"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Phone, Calendar, Shield, Camera } from "lucide-react"
import { profileApi, getUserData, setUserData } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type ProfileData = Awaited<ReturnType<typeof profileApi.get>>

export default function AdminPerfilPage() {
  const { toast } = useToast()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ nombres: "", apellidos: "", telefono: "", password: "" })
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const user = getUserData()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await profileApi.get()
      setProfile(data)
      setForm({ nombres: data.nombres, apellidos: data.apellidos, telefono: data.telefono || "", password: "" })
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const updated = await profileApi.update({
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono,
        password: form.password || undefined,
      })
      setProfile(updated)
      setUserData({
        id: updated.id,
        nombres: updated.nombres,
        apellidos: updated.apellidos,
        email: updated.email,
        rol: updated.rol,
        avatar: updated.avatar,
      })
      setEditing(false)
      setForm(prev => ({ ...prev, password: "" }))
      toast({ title: 'Perfil actualizado' })
    } catch {
      toast({ title: 'No se pudo guardar', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    try {
      const res = await profileApi.updateAvatar(file)
      await loadProfile()
      setUserData({
        id: res.user.id,
        nombres: res.user.nombres,
        apellidos: res.user.apellidos,
        email: res.user.email,
        rol: user?.rol || 'admin',
        avatar: res.user.avatar,
      })
      toast({ title: 'Foto actualizada' })
    } catch {
      toast({ title: 'No se pudo actualizar la foto', variant: 'destructive' })
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
        <div>
          <h1 className="text-3xl font-bold">Mi Perfil</h1>
          <p className="text-muted-foreground">Información de tu cuenta</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información Personal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarPreview || profile?.avatar || ''} />
                  <AvatarFallback><User className="h-10 w-10" /></AvatarFallback>
                </Avatar>
                <label className="absolute -bottom-2 -right-2 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border bg-background shadow" title="Cambiar foto">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
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

            {!editing ? (
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
                    <span className="text-sm">Registrado: {profile?.fechaRegistro ? new Date(profile.fechaRegistro).toLocaleDateString("es-ES") : "N/A"}</span>
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Último acceso: {profile?.ultimoAcceso ? new Date(profile.ultimoAcceso).toLocaleDateString("es-ES") : "N/A"}</span>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setEditing(true)}>Editar Perfil</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nombres</Label>
                    <Input value={form.nombres} onChange={(e)=>setForm({...form,nombres:e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellidos</Label>
                    <Input value={form.apellidos} onChange={(e)=>setForm({...form,apellidos:e.target.value})} required />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={form.telefono} onChange={(e)=>setForm({...form,telefono:e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Nueva contraseña (opcional)</Label>
                    <Input type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={()=>{setEditing(false); setForm(prev => ({...prev, password: ''}))}}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving}>{isSaving ? 'Guardando...' : 'Guardar cambios'}</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

