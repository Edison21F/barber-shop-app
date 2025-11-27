"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { adminApi, type Periodo, type Usuario } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function AdminClasesPage() {
  const { toast } = useToast()
  const [clases, setClases] = useState<any[]>([])
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [modulos, setModulos] = useState<any[]>([])
  const [profesores, setProfesores] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({
    periodoId: "", moduloId: "", docenteId: "", titulo: "", descripcion: "",
    fecha: "", horaInicio: "08:00", horaFin: "10:00", ubicacion: "",
    modalidad: "presencial" as "presencial" | "virtual" | "hibrida",
    enlaceVirtual: ""
  })

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const [clasesResp, periodosResp, modulosResp, profResp] = await Promise.all([
        adminApi.getClases(),
        adminApi.getPeriodos().catch(() => []),
        adminApi.getModulos().catch(() => []),
        adminApi.getProfesores().catch(() => []),
      ])
      setClases(clasesResp)
      setPeriodos(periodosResp as Periodo[])
      setModulos(modulosResp as any[])
      setProfesores(profResp as Usuario[])
    } catch { toast({ title: 'No se pudieron cargar las clases', variant: 'destructive' }) } finally { setLoading(false) }
  }

  const resetForm = () => {
    setEditing(null)
    setForm({ periodoId: "", moduloId: "", docenteId: "", titulo: "", descripcion: "", fecha: "", horaInicio: "08:00", horaFin: "10:00", ubicacion: "", modalidad: "presencial", enlaceVirtual: "" })
  }
  const onCreate = () => { resetForm(); setOpen(true) }
  const onEdit = (c: any) => {
    setEditing(c);
    setForm({
      periodoId: c.periodoId?._id || c.periodoId || "",
      moduloId: c.moduloId?._id || c.moduloId || "",
      docenteId: c.docenteId?._id || c.docenteId || "",
      titulo: c.titulo,
      descripcion: c.descripcion,
      fecha: c.fecha?.substring(0, 10) || "",
      horaInicio: c.horaInicio,
      horaFin: c.horaFin,
      ubicacion: c.ubicacion,
      modalidad: c.modalidad || 'presencial',
      enlaceVirtual: c.enlaceVirtual || ''
    });
    setOpen(true)
  }
  const onDelete = async (c: any) => { if (!confirm(`Eliminar clase ${c.titulo}?`)) return; try { await adminApi.deleteClase(c._id); setClases(prev => prev.filter(x => x._id !== c._id)); toast({ title: 'Clase eliminada' }) } catch { toast({ title: 'Error eliminando', variant: 'destructive' }) } }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // calcular duración en horas a partir de horaInicio y horaFin (HH:MM)
      const toMinutes = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + (m || 0) }
      const start = toMinutes(form.horaInicio)
      let end = toMinutes(form.horaFin)
      if (end <= start) end += 24 * 60
      const durationHours = Math.max(1, Math.round(((end - start) / 60) * 100) / 100)

      const payload: any = { ...form, fecha: form.fecha ? new Date(form.fecha).toISOString() : undefined, duracion: durationHours }
      if (form.modalidad !== 'virtual') delete payload.enlaceVirtual
      const saved = editing ? await adminApi.updateClase(editing._id, payload) : await adminApi.createClase(payload)
      setClases(prev => editing ? prev.map(x => x._id === saved._id ? saved : x) : [saved, ...prev])
      setOpen(false); resetForm(); toast({ title: editing ? 'Clase actualizada' : 'Clase creada' })
    } catch { toast({ title: 'Error guardando', variant: 'destructive' }) }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Clases</h1>
          <Button onClick={onCreate}>Nueva Clase</Button>
        </div>

        <Card>
          <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-muted-foreground">Cargando...</div> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead>Ubicación</TableHead>
                      <TableHead>Modalidad</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clases.map(c => (
                      <TableRow key={c._id}>
                        <TableCell className="font-medium">{c.titulo}</TableCell>
                        <TableCell>{c.fecha ? new Date(c.fecha).toLocaleDateString('es-ES') : '-'}</TableCell>
                        <TableCell>{c.horaInicio} - {c.horaFin}</TableCell>
                        <TableCell>{c.ubicacion}</TableCell>
                        <TableCell className="capitalize">{c.modalidad || 'presencial'}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => onEdit(c)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(c)}>Eliminar</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? 'Editar Clase' : 'Nueva Clase'}</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Título</Label>
                  <Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} required placeholder="Ej: Introducción a la Barbería" />
                </div>

                <div className="space-y-2">
                  <Label>Periodo</Label>
                  <Select value={form.periodoId} onValueChange={(v) => setForm({ ...form, periodoId: v })}>
                    <SelectTrigger><SelectValue placeholder={periodos.length ? 'Selecciona un periodo' : 'Sin periodos'} /></SelectTrigger>
                    <SelectContent>
                      {periodos.map(p => (
                        <SelectItem key={p._id} value={p._id}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Módulo</Label>
                  <Select value={form.moduloId} onValueChange={(v) => setForm({ ...form, moduloId: v })}>
                    <SelectTrigger><SelectValue placeholder={modulos.length ? 'Selecciona un módulo' : 'Sin módulos'} /></SelectTrigger>
                    <SelectContent>
                      {modulos.map(m => (
                        <SelectItem key={m._id} value={m._id}>{m.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Docente</Label>
                  <Select value={form.docenteId} onValueChange={(v) => setForm({ ...form, docenteId: v })}>
                    <SelectTrigger><SelectValue placeholder={profesores.length ? 'Selecciona un docente' : 'Sin docentes'} /></SelectTrigger>
                    <SelectContent>
                      {profesores.map(d => (
                        <SelectItem key={d._id} value={d._id}>{d.nombres} {d.apellidos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2"><Label>Fecha</Label><Input type="date" value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Ubicación</Label><Input value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} required /></div>

                <div className="space-y-2"><Label>Hora Inicio</Label><Input type="time" value={form.horaInicio} onChange={e => setForm({ ...form, horaInicio: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Hora Fin</Label><Input type="time" value={form.horaFin} onChange={e => setForm({ ...form, horaFin: e.target.value })} required /></div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Modalidad</Label>
                  <Select value={form.modalidad} onValueChange={(v: any) => setForm({ ...form, modalidad: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="virtual">Virtual</SelectItem>
                      <SelectItem value="hibrida">Híbrida</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.modalidad === 'virtual' && (
                  <div className="space-y-2 md:col-span-2"><Label>Enlace Virtual</Label><Input value={form.enlaceVirtual} onChange={e => setForm({ ...form, enlaceVirtual: e.target.value })} placeholder="https://zoom.us/..." /></div>
                )}

                <div className="space-y-2 md:col-span-2">
                  <Label>Descripción</Label>
                  <Input value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} required />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editing ? 'Guardar Cambios' : 'Crear Clase'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
