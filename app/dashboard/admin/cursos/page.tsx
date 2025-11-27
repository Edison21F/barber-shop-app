"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminApi, type Curso } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

const WEEK_IN_MS = 1000 * 60 * 60 * 24 * 7

function calculateWeeksBetweenDates(start: string, end: string) {
  if (!start || !end) return null
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return null
  const diff = endDate.getTime() - startDate.getTime()
  if (diff <= 0) return null
  return Math.max(1, Math.ceil(diff / WEEK_IN_MS))
}

export default function AdminCursosPage() {
  const { toast } = useToast()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Curso | null>(null)
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    duracionSemanas: 4,
    fechaInicio: "",
    fechaFin: "",
    nivel: "basico" as "basico" | "intermedio" | "avanzado",
    precio: 0,
    cupoMaximo: 10,
    requisitos: "",
    objetivos: "",
  })

  useEffect(() => {
    const load = async () => {
      try {
        const data = await adminApi.getCursos()
        setCursos(data)
      } catch (error) {
        toast({ title: "Error", description: "No se pudieron cargar los cursos", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  const resetForm = () => {
    setEditing(null)
    setImagenFile(null)
    setForm({
      nombre: "",
      codigo: "",
      descripcion: "",
      duracionSemanas: 4,
      fechaInicio: "",
      fechaFin: "",
      nivel: "basico",
      precio: 0,
      cupoMaximo: 10,
      requisitos: "",
      objetivos: "",
    })
  }

  const onCreate = () => {
    resetForm()
    setOpen(true)
  }

  const onEdit = (c: Curso) => {
    setEditing(c)
    setImagenFile(null)
    setForm({
      nombre: c.nombre,
      codigo: c.codigo,
      descripcion: c.descripcion,
      duracionSemanas: c.duracionSemanas,
      fechaInicio: (c as any).fechaInicio ? (c as any).fechaInicio.substring(0, 10) : "",
      fechaFin: (c as any).fechaFin ? (c as any).fechaFin.substring(0, 10) : "",
      nivel: c.nivel,
      precio: c.precio,
      cupoMaximo: c.cupoMaximo,
      requisitos: Array.isArray((c as any).requisitos) ? (c as any).requisitos.join(', ') : "",
      objetivos: Array.isArray((c as any).objetivos) ? (c as any).objetivos.join(', ') : "",
    })
    setOpen(true)
  }

  const onDelete = async (c: Curso) => {
    if (!confirm(`¿Eliminar curso "${c.nombre}"?`)) return
    try {
      await adminApi.deleteCurso(c._id)
      setCursos((prev) => prev.filter((x) => x._id !== c._id))
      toast({ title: "Curso desactivado" })
    } catch (error) {
      toast({ title: "Error eliminando curso", variant: "destructive" })
    }
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const calculatedWeeks = calculateWeeksBetweenDates(form.fechaInicio, form.fechaFin)
    if (form.fechaInicio && form.fechaFin && !calculatedWeeks) {
      toast({ title: "Fechas inválidas", description: "La fecha de fin debe ser mayor que la fecha de inicio", variant: "destructive" })
      return
    }
    if (!editing && !calculatedWeeks) {
      toast({ title: "Faltan fechas", description: "Selecciona una fecha de inicio y fin para calcular la duración", variant: "destructive" })
      return
    }
    const durationToSend = calculatedWeeks ?? Number(form.duracionSemanas)
    const payload = {
      nombre: form.nombre,
      codigo: form.codigo,
      descripcion: form.descripcion,
      duracionSemanas: durationToSend,
      nivel: form.nivel,
      precio: Number(form.precio),
      cupoMaximo: Number(form.cupoMaximo),
      requisitos: form.requisitos.split(',').map(s => s.trim()).filter(Boolean),
      objetivos: form.objetivos.split(',').map(s => s.trim()).filter(Boolean),
      imagenFile: imagenFile,
    }
    try {
      if (editing) {
        const updated = await adminApi.updateCurso(editing._id, payload)
        setCursos((prev) => prev.map((x) => x._id === updated._id ? updated : x))
        toast({ title: "Curso actualizado" })
      } else {
        const created = await adminApi.createCurso(payload)
        setCursos((prev) => [created, ...prev])
        toast({ title: "Curso creado" })
      }
      setOpen(false)
      resetForm()
    } catch (error) {
      toast({ title: "Error guardando curso", variant: "destructive" })
    }
  }

  const calculatedWeeks = calculateWeeksBetweenDates(form.fechaInicio, form.fechaFin)
  const durationLabel = calculatedWeeks ?? form.duracionSemanas
  const showInvalidDates = Boolean(form.fechaInicio && form.fechaFin && !calculatedWeeks)

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Cursos</h1>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Listado de cursos</CardTitle>
              <Button onClick={onCreate}>Nuevo Curso</Button>
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
                      <TableHead>Código</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Activo</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cursos.map((c) => (
                      <TableRow key={c._id}>
                        <TableCell className="font-medium">{c.nombre}</TableCell>
                        <TableCell>{c.codigo}</TableCell>
                        <TableCell className="capitalize">{c.nivel}</TableCell>
                        <TableCell>${c.precio}</TableCell>
                        <TableCell>{(c as any).activo === false ? "No" : "Sí"}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => onEdit(c)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(c)}>Eliminar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {cursos.length === 0 && (
                  <div className="p-4 text-sm text-muted-foreground">No hay cursos</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editing ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input id="nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código</Label>
                  <Input id="codigo" value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea id="descripcion" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} required />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fechaInicio">Fecha de inicio</Label>
                  <Input
                    id="fechaInicio"
                    type="date"
                    value={form.fechaInicio}
                    onChange={(e) => setForm({ ...form, fechaInicio: e.target.value })}
                    required={!editing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFin">Fecha de fin</Label>
                  <Input
                    id="fechaFin"
                    type="date"
                    min={form.fechaInicio || undefined}
                    value={form.fechaFin}
                    onChange={(e) => setForm({ ...form, fechaFin: e.target.value })}
                    required={!editing}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duración (automática)</Label>
                  <div className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground">
                    {durationLabel ? `${durationLabel} semanas` : 'Selecciona las fechas'}
                  </div>
                </div>
              </div>
              {showInvalidDates && (
                <p className="text-sm text-destructive">La fecha fin debe ser mayor que la fecha inicio.</p>
              )}

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nivel</Label>
                  <Select value={form.nivel} onValueChange={(v: 'basico'|'intermedio'|'avanzado') => setForm({ ...form, nivel: v })}>
                    <SelectTrigger id="nivel"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="intermedio">Intermedio</SelectItem>
                      <SelectItem value="avanzado">Avanzado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="precio">Precio</Label>
                  <Input id="precio" type="number" min={0} step="0.01" value={form.precio} onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })} required />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cupo">Cupo Máximo</Label>
                  <Input id="cupo" type="number" min={1} value={form.cupoMaximo} onChange={(e) => setForm({ ...form, cupoMaximo: Number(e.target.value) })} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imagen">Imagen (opcional)</Label>
                  <Input id="imagen" type="file" accept="image/*" onChange={(e) => setImagenFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="requisitos">Requisitos (separados por coma)</Label>
                  <Input id="requisitos" value={form.requisitos} onChange={(e) => setForm({ ...form, requisitos: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="objetivos">Objetivos (separados por coma)</Label>
                  <Input id="objetivos" value={form.objetivos} onChange={(e) => setForm({ ...form, objetivos: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editing ? 'Guardar cambios' : 'Crear curso'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
