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

export default function AdminModulosPage() {
  const { toast } = useToast()
  const [items, setItems] = useState<any[]>([])
  const [cursos, setCursos] = useState<Curso[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  const [form, setForm] = useState({ cursoId:"", nombre:"", numeroModulo:1, descripcion:"", duracionHoras:1, objetivos:"", orden:1 })

  useEffect(() => { load() }, [])
  const load = async () => {
    try {
      const [mods, cursosResp] = await Promise.all([
        adminApi.getModulos(),
        adminApi.getCursos().catch(()=>[]),
      ])
      setItems(mods)
      setCursos(cursosResp as Curso[])
    } catch {
      toast({ title:'No se pudieron cargar los módulos', variant:'destructive' })
    } finally { setLoading(false) }
  }

  const resetForm = () => { setEditing(null); setForm({ cursoId:"", nombre:"", numeroModulo:1, descripcion:"", duracionHoras:1, objetivos:"", orden:1 }) }
  const onCreate = () => { resetForm(); setOpen(true) }
  const onEdit = (m:any) => { setEditing(m); setForm({ cursoId: m.cursoId?._id || m.cursoId, nombre:m.nombre, numeroModulo:m.numeroModulo, descripcion:m.descripcion, duracionHoras:m.duracionHoras, objetivos: Array.isArray(m.objetivos)? m.objetivos.join(', '):"", orden:m.orden }); setOpen(true) }
  const onDelete = async (m:any) => { if(!confirm(`Eliminar módulo ${m.nombre}?`)) return; try{ await adminApi.deleteModulo(m._id); setItems(prev=>prev.filter(x=>x._id!==m._id)); toast({ title:'Módulo eliminado' }) } catch { toast({ title:'Error eliminando', variant:'destructive' }) } }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        cursoId: form.cursoId,
        nombre: form.nombre,
        numeroModulo: Number(form.numeroModulo),
        descripcion: form.descripcion,
        duracionHoras: Number(form.duracionHoras),
        objetivos: form.objetivos.split(',').map(s=>s.trim()).filter(Boolean),
        orden: Number(form.orden),
      }
      const saved = editing ? await adminApi.updateModulo(editing._id, payload) : await adminApi.createModulo(payload)
      setItems(prev => editing ? prev.map(x=>x._id===saved._id?saved:x) : [saved, ...prev])
      setOpen(false); resetForm(); toast({ title: editing?'Módulo actualizado':'Módulo creado' })
    } catch { toast({ title:'Error guardando', variant:'destructive' }) }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Módulos</h1>
          <Button onClick={onCreate}>Nuevo Módulo</Button>
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
                      <TableHead>#</TableHead>
                      <TableHead>Duración</TableHead>
                      <TableHead>Orden</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map(m => (
                      <TableRow key={m._id}>
                        <TableCell className="font-medium">{m.nombre}</TableCell>
                        <TableCell>{m.numeroModulo}</TableCell>
                        <TableCell>{m.duracionHoras}h</TableCell>
                        <TableCell>{m.orden}</TableCell>
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
            <DialogHeader><DialogTitle>{editing?'Editar Módulo':'Nuevo Módulo'}</DialogTitle></DialogHeader>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Curso</Label>
                  <Select value={form.cursoId} onValueChange={(v)=>setForm({...form, cursoId: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder={cursos.length ? 'Selecciona un curso' : 'Sin cursos disponibles'} />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.map(c => (
                        <SelectItem key={c._id} value={c._id}>{c.nombre} ({c.codigo})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1"><Label>Nombre</Label><Input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} required/></div>
                <div className="space-y-1"><Label>Número Módulo</Label><Input type="number" min={1} value={form.numeroModulo} onChange={e=>setForm({...form,numeroModulo:Number(e.target.value)})} required/></div>
                <div className="space-y-1"><Label>Duración Horas</Label><Input type="number" min={1} value={form.duracionHoras} onChange={e=>setForm({...form,duracionHoras:Number(e.target.value)})} required/></div>
                <div className="space-y-1 md:col-span-2"><Label>Descripción</Label><Input value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})} required/></div>
                <div className="space-y-1 md:col-span-2"><Label>Objetivos (coma)</Label><Input value={form.objetivos} onChange={e=>setForm({...form,objetivos:e.target.value})} /></div>
                <div className="space-y-1"><Label>Orden</Label><Input type="number" min={1} value={form.orden} onChange={e=>setForm({...form,orden:Number(e.target.value)})} required/></div>
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
