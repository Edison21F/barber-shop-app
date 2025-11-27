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
import { adminApi, type Curso } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function AdminPeriodosPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ cursoId: "", nombre: "", codigo: "", fechaInicio: "", fechaFin: "", cuposDisponibles: 0, horario: "", estado: "planificado" as any })

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const [periodos, cursosResp] = await Promise.all([
        adminApi.getPeriodos(),
        adminApi.getCursos().catch(() => []),
      ])
      setItems(periodos)
      setCursos(cursosResp as Curso[])
    } catch {
      toast({ title: 'No se pudieron cargar los periodos', variant: 'destructive' })
    } finally { setLoading(false) }
  }

  const resetForm = () => { setEditing(null); setForm({ cursoId: "", nombre: "", codigo: "", fechaInicio: "", fechaFin: "", cuposDisponibles: 0, horario: "", estado: "planificado" }) }
  const onCreate = () => { resetForm(); setOpen(true) }
  const onEdit = (p: any) => { setEditing(p); setForm({ cursoId: p.cursoId?._id || p.cursoId, nombre: p.nombre, codigo: p.codigo, fechaInicio: p.fechaInicio?.substring(0, 10) || "", fechaFin: p.fechaFin?.substring(0, 10) || "", cuposDisponibles: p.cuposDisponibles, horario: p.horario || "", estado: p.estado || 'planificado' }); setOpen(true) }
  const onDelete = async (p: any) => { if (!confirm(`Eliminar periodo ${p.nombre}?`)) return; try { await adminApi.deletePeriodo(p._id); setItems(prev => prev.filter(x => x._id !== p._id)); toast({ title: 'Periodo eliminado' }) } catch { toast({ title: 'Error eliminando', variant: 'destructive' }) } }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload: any = { ...form, fechaInicio: new Date(form.fechaInicio).toISOString(), fechaFin: new Date(form.fechaFin).toISOString(), cuposDisponibles: Number(form.cuposDisponibles) }
      const saved = editing ? await adminApi.updatePeriodo(editing._id, payload) : await adminApi.createPeriodo(payload)
      setItems(prev => editing ? prev.map(x => x._id === saved._id ? saved : x) : [saved, ...prev])
      setOpen(false); resetForm(); toast({ title: editing ? 'Periodo actualizado' : 'Periodo creado' })
    } catch { toast({ title: 'Error guardando', variant: 'destructive' }) }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Periodos</h1>
          <Button onClick={onCreate}>Nuevo Periodo</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-muted-foreground">Cargando...</div> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Fechas</TableHead>
                      <TableHead>Cupos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(p => (
                      <TableRow key={p._id}>
                        <TableCell className="font-medium">{p.nombre}</TableCell>
                        <TableCell>{p.codigo}</TableCell>
                        <TableCell>{new Date(p.fechaInicio).toLocaleDateString('es-ES')} - {new Date(p.fechaFin).toLocaleDateString('es-ES')}</TableCell>
                        <TableCell>{p.cuposDisponibles}</TableCell>
                        <TableCell className="capitalize">{p.estado || 'planificado'}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button size="sm" variant="outline" onClick={() => onEdit(p)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={() => onDelete(p)}>Eliminar</Button>
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
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Editar Periodo' : 'Nuevo Periodo'}</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Curso</Label>
                  <Select value={form.cursoId} onValueChange={(v) => setForm({ ...form, cursoId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder={cursos.length ? 'Selecciona un curso' : 'Sin cursos'} />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.nombre} ({c.codigo})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Nombre</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Código</Label><Input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Fecha Inicio</Label><Input type="date" value={form.fechaInicio} onChange={e => setForm({ ...form, fechaInicio: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Fecha Fin</Label><Input type="date" value={form.fechaFin} onChange={e => setForm({ ...form, fechaFin: e.target.value })} required /></div>
                <div className="space-y-1"><Label>Cupos Disponibles</Label><Input type="number" min={0} value={form.cuposDisponibles} onChange={e => setForm({ ...form, cuposDisponibles: Number(e.target.value) })} required /></div>
                <div className="space-y-1 md:col-span-2"><Label>Horario</Label><Input value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} required /></div>
                <div className="space-y-1 md:col-span-2">
                  <Label>Estado</Label>
                  <Select value={form.estado} onValueChange={(v: any) => setForm({ ...form, estado: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planificado">Planificado</SelectItem>
                      <SelectItem value="en_curso">En Curso</SelectItem>
                      <SelectItem value="finalizado">Finalizado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editing ? 'Guardar' : 'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
