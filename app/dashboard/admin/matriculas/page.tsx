"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { matriculaApi, adminApi, type Usuario, type Periodo } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminMatriculasPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [estudiantes, setEstudiantes] = useState<any[]>([])
  const [periodos, setPeriodos] = useState<Periodo[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ estudianteId:"", periodoId:"", metodoPago:"efectivo", montoPagado:0, descuento:0, observaciones:"" })

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const [matriculas, estudiantesResp, periodosResp] = await Promise.all([
        matriculaApi.getAll(),
        adminApi.getEstudiantes().catch(()=>[]),
        adminApi.getPeriodos().catch(()=>[]),
      ])
      setItems(matriculas)
      setEstudiantes(estudiantesResp as any[])
      setPeriodos(periodosResp as Periodo[])
    } catch { toast({ title:'No se pudieron cargar las matrículas', variant:'destructive' }) } finally { setLoading(false) }
  }

  const resetForm = () => { setEditing(null); setForm({ estudianteId:"", periodoId:"", metodoPago:"efectivo", montoPagado:0, descuento:0, observaciones:"" }) }
  const onCreate = () => { resetForm(); setOpen(true) }
  const onEdit = (m:any) => { setEditing(m); setForm({ estudianteId:m.estudianteId, periodoId:m.periodoId, metodoPago:m.metodoPago||'efectivo', montoPagado:m.montoPagado||0, descuento:m.descuento||0, observaciones:m.observaciones||'' }); setOpen(true)}
  const onDelete = async (m:any) => { if(!confirm(`Eliminar matrícula ${m._id}?`)) return; try{ await matriculaApi.delete(m._id); setItems(prev=>prev.filter(x=>x._id!==m._id)); toast({ title:'Matrícula eliminada' }) } catch { toast({ title:'Error eliminando', variant:'destructive' }) } }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editing) {
        const updated = await matriculaApi.update(editing._id, { observaciones: form.observaciones })
        setItems(prev => prev.map(x=>x._id===updated._id?updated:x))
        toast({ title:'Matrícula actualizada' })
      } else {
        const periodoSel = periodos.find(p => p._id === form.periodoId)
        const cursoId = (periodoSel && (periodoSel as any).cursoId) ? ((periodoSel as any).cursoId._id || (periodoSel as any).cursoId) : undefined
        const created = await matriculaApi.create({ 
          estudianteId: form.estudianteId, 
          periodoId: form.periodoId, 
          metodoPago: form.metodoPago, 
          montoPagado: Number(form.montoPagado), 
          descuento: Number(form.descuento)||undefined, 
          observaciones: form.observaciones||undefined,
          // @ts-expect-error backend requiere cursoId
          cursoId: cursoId,
        } as any)
        setItems(prev => [created, ...prev])
        toast({ title:'Matrícula creada' })
      }
      setOpen(false); resetForm()
    } catch { toast({ title:'Error guardando', variant:'destructive' }) }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Matrículas</h1>
          <Button onClick={onCreate}>Nueva Matrícula</Button>
        </div>
        <Card>
          <CardHeader><CardTitle>Listado</CardTitle></CardHeader>
          <CardContent>
            {loading ? <div className="text-muted-foreground">Cargando...</div> : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Correo</TableHead>
                      <TableHead>Curso</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead>Monto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(m => (
                      <TableRow key={m._id}>
                        <TableCell className="font-medium">{m?.estudianteId?.usuarioId ? `${m.estudianteId.usuarioId.nombres} ${m.estudianteId.usuarioId.apellidos}` : '-'}</TableCell>
                        <TableCell>{m?.estudianteId?.usuarioId?.email || '-'}</TableCell>
                        <TableCell>{m?.cursoId?.nombre || '-'}</TableCell>
                        <TableCell>{m?.periodoId ? `${m.periodoId.nombre}${m.periodoId.codigo ? ' · '+m.periodoId.codigo : ''}` : '-'}</TableCell>
                        <TableCell>${m.montoPagado}</TableCell>
                        <TableCell className="capitalize">{m.estado}</TableCell>
                        <TableCell className="space-x-2 text-right">
                          <Button size="sm" variant="outline" onClick={()=>onEdit(m)}>Editar</Button>
                          <Button size="sm" variant="destructive" onClick={()=>onDelete(m)}>Eliminar</Button>
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
            <DialogHeader><DialogTitle>{editing?'Editar Matrícula':'Nueva Matrícula'}</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Estudiante</Label>
                  <Select disabled={!!editing} value={form.estudianteId} onValueChange={(v)=>setForm({...form, estudianteId: v})}>
                    <SelectTrigger><SelectValue placeholder={estudiantes.length? 'Selecciona un estudiante':'Sin estudiantes'} /></SelectTrigger>
                    <SelectContent>
                      {estudiantes.map(es => (
                        <SelectItem key={es._id} value={es._id}>{es.usuarioId?.nombres} {es.usuarioId?.apellidos} ({es.usuarioId?.email})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Periodo</Label>
                  <Select disabled={!!editing} value={form.periodoId} onValueChange={(v)=>setForm({...form, periodoId: v})}>
                    <SelectTrigger><SelectValue placeholder={periodos.length? 'Selecciona un periodo':'Sin periodos'} /></SelectTrigger>
                    <SelectContent>
                      {periodos.map(p => (
                        <SelectItem key={p._id} value={p._id}>{p.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!editing && (
                  <>
                    <div className="space-y-1"><Label>Método Pago</Label><Input value={form.metodoPago} onChange={e=>setForm({...form,metodoPago:e.target.value})} /></div>
                    <div className="space-y-1"><Label>Monto Pagado</Label><Input type="number" min={0} value={form.montoPagado} onChange={e=>setForm({...form,montoPagado:Number(e.target.value)})} required/></div>
                    <div className="space-y-1"><Label>Descuento</Label><Input type="number" min={0} value={form.descuento} onChange={e=>setForm({...form,descuento:Number(e.target.value)})} /></div>
                  </>
                )}
                <div className="space-y-1 md:col-span-2"><Label>Observaciones</Label><Input value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})} /></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button>
                <Button type="submit">{editing?'Guardar':'Crear'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
