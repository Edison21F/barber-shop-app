"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi, type Usuario } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminUsuariosPage() {
  const { toast } = useToast()
  const [profesores, setProfesores] = useState<Usuario[]>([])
  const [estudiantes, setEstudiantes] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [openProfesor, setOpenProfesor] = useState(false)
  const [openEstudiante, setOpenEstudiante] = useState(false)
  const [editing, setEditing] = useState<Usuario | null>(null)
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    email: "",
    cedula: "",
    telefono: "",
    password: "",
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [profes, alumnos] = await Promise.all([
          adminApi.getProfesores(),
          adminApi.getUsuarios('estudiante'),
        ])
        setProfesores(profes)
        setEstudiantes(alumnos)
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los profesores", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const resetForm = () => {
    setEditing(null)
    setAvatarFile(null)
    setForm({ nombres: "", apellidos: "", email: "", cedula: "", telefono: "", password: "" })
  }

  const openCreateProfesor = () => { resetForm(); setOpenProfesor(true) }
  const openCreateEstudiante = () => { resetForm(); setOpenEstudiante(true) }

  const onEditUser = (u: Usuario) => {
    setEditing(u)
    setForm({ nombres: u.nombres, apellidos: u.apellidos, email: u.email, cedula: u.cedula || "", telefono: u.telefono || "", password: "" })
    setOpenProfesor(u.rol === 'docente')
    setOpenEstudiante(u.rol === 'estudiante')
  }

  const onDeleteUser = async (u: Usuario) => {
    if (!confirm(`¿Desactivar usuario ${u.nombres} ${u.apellidos}?`)) return
    try {
      await adminApi.deleteUsuario(u._id)
      if (u.rol === 'docente') setProfesores(prev => prev.filter(x => x._id !== u._id))
      else setEstudiantes(prev => prev.filter(x => x._id !== u._id))
      toast({ title: 'Usuario desactivado' })
    } catch {
      toast({ title: 'Error al desactivar usuario', variant: 'destructive' })
    }
  }

  const submitProfesor = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        const updated = await adminApi.updateUsuario(editing._id, { ...form })
        setProfesores(prev => prev.map(p => p._id === updated._id ? updated : p))
        toast({ title: 'Profesor actualizado' })
      } else {
        const { user } = await adminApi.createUsuario({ ...form, rol: 'docente', avatarFile })
        setProfesores(prev => [user, ...prev])
        toast({ title: 'Profesor creado' })
      }
      setOpenProfesor(false)
      resetForm()
    } catch (err) {
      toast({ title: 'Error guardando profesor', variant: 'destructive' })
    }
  }

  const submitEstudiante = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        const updated = await adminApi.updateUsuario(editing._id, { ...form })
        setEstudiantes(prev => prev.map(s => s._id === updated._id ? updated : s))
        toast({ title: 'Alumno actualizado' })
      } else {
        const { user } = await adminApi.createUsuario({ ...form, rol: 'estudiante', avatarFile: null })
        setEstudiantes(prev => [user, ...prev])
        toast({ title: 'Alumno creado' })
      }
      setOpenEstudiante(false)
      resetForm()
    } catch (err) {
      toast({ title: 'Error guardando alumno', variant: 'destructive' })
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Usuarios</h1>

        <Tabs defaultValue="profesores">
          <TabsList>
            <TabsTrigger value="profesores">Profesores</TabsTrigger>
            <TabsTrigger value="estudiantes">Estudiantes</TabsTrigger>
          </TabsList>

          <TabsContent value="profesores">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Profesores</CardTitle>
                  <Button onClick={openCreateProfesor}>Nuevo Profesor</Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-muted-foreground">Cargando...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Cédula</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Activo</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {profesores.map((p) => (
                          <TableRow key={p._id}>
                            <TableCell className="font-medium">{p.nombres} {p.apellidos}</TableCell>
                            <TableCell>{p.email}</TableCell>
                            <TableCell>{p.cedula ?? '-'}</TableCell>
                            <TableCell>{p.telefono ?? '-'}</TableCell>
                            <TableCell>{p.activo === false ? 'No' : 'Sí'}</TableCell>
                            <TableCell className="space-x-2 text-right">
                              <Button size="sm" variant="outline" onClick={() => onEditUser(p)}>Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => onDeleteUser(p)}>Eliminar</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {profesores.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground">No hay profesores</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="estudiantes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Estudiantes</CardTitle>
                  <Button onClick={openCreateEstudiante}>Nuevo Alumno</Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-muted-foreground">Cargando...</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Cédula</TableHead>
                          <TableHead>Teléfono</TableHead>
                          <TableHead>Activo</TableHead>
                          <TableHead></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estudiantes.map((s) => (
                          <TableRow key={s._id}>
                            <TableCell className="font-medium">{s.nombres} {s.apellidos}</TableCell>
                            <TableCell>{s.email}</TableCell>
                            <TableCell>{s.cedula ?? '-'}</TableCell>
                            <TableCell>{s.telefono ?? '-'}</TableCell>
                            <TableCell>{s.activo === false ? 'No' : 'Sí'}</TableCell>
                            <TableCell className="space-x-2 text-right">
                              <Button size="sm" variant="outline" onClick={() => onEditUser(s)}>Editar</Button>
                              <Button size="sm" variant="destructive" onClick={() => onDeleteUser(s)}>Eliminar</Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {estudiantes.length === 0 && (
                      <div className="p-4 text-sm text-muted-foreground">No hay estudiantes</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog Profesor */}
        <Dialog open={openProfesor} onOpenChange={setOpenProfesor}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Profesor' : 'Nuevo Profesor'}</DialogTitle></DialogHeader>
            <form onSubmit={submitProfesor} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1"><Label>Nombres</Label><Input value={form.nombres} onChange={e=>setForm({...form,nombres:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Apellidos</Label><Input value={form.apellidos} onChange={e=>setForm({...form,apellidos:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Cédula</Label><Input value={form.cedula} onChange={e=>setForm({...form,cedula:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Teléfono</Label><Input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div>
                {!editing && (<div className="space-y-1"><Label>Contraseña</Label><Input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>)}
                <div className="space-y-1 md:col-span-2"><Label>Avatar (opcional)</Label><Input type="file" accept="image/*" onChange={e=>setAvatarFile(e.target.files?.[0]||null)} /></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={()=>setOpenProfesor(false)}>Cancelar</Button>
                <Button type="submit">{editing ? 'Guardar' : 'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Estudiante */}
        <Dialog open={openEstudiante} onOpenChange={setOpenEstudiante}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Alumno' : 'Nuevo Alumno'}</DialogTitle></DialogHeader>
            <form onSubmit={submitEstudiante} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1"><Label>Nombres</Label><Input value={form.nombres} onChange={e=>setForm({...form,nombres:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Apellidos</Label><Input value={form.apellidos} onChange={e=>setForm({...form,apellidos:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Cédula</Label><Input value={form.cedula} onChange={e=>setForm({...form,cedula:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Teléfono</Label><Input value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div>
                {!editing && (<div className="space-y-1"><Label>Contraseña</Label><Input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/></div>)}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={()=>setOpenEstudiante(false)}>Cancelar</Button>
                <Button type="submit">{editing ? 'Guardar' : 'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
