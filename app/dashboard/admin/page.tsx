"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { adminApi, matriculaApi, type Curso, type Periodo, type Clase, type Usuario } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, BookOpen, GraduationCap, Users } from "lucide-react"

export default function AdminHomePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{
    cursos: number
    profesores: number
    estudiantes: number
    periodos: number
    clases: number
    matriculas: number
  } | null>(null)
  const [recentCursos, setRecentCursos] = useState<Curso[]>([])
  const [recentPeriodos, setRecentPeriodos] = useState<Periodo[]>([])
  const [upcomingClases, setUpcomingClases] = useState<Clase[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [cursos, profesores, estudiantes, periodos, clases, matriculas] = await Promise.all([
          adminApi.getCursos().catch(() => []),
          adminApi.getProfesores().catch(() => []),
          adminApi.getUsuarios('estudiante').catch(() => []),
          adminApi.getPeriodos().catch(() => []),
          adminApi.getClases().catch(() => []),
          matriculaApi.getAll().catch(() => []),
        ])

        setStats({
          cursos: (cursos as Curso[]).length,
          profesores: (profesores as Usuario[]).length,
          estudiantes: (estudiantes as Usuario[]).length,
          periodos: (periodos as Periodo[]).length,
          clases: (clases as Clase[]).length,
          matriculas: (matriculas as any[]).length,
        })

        setRecentCursos((cursos as Curso[]).slice(0, 5))
        setRecentPeriodos((periodos as Periodo[]).slice(0, 5))
        setUpcomingClases((clases as Clase[])
          .filter(c => c.fecha ? new Date(c.fecha).getTime() >= Date.now() : true)
          .slice(0, 5))
      } catch (error) {
        toast({ title: "No se pudieron cargar las estadísticas", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [toast])

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Panel de Administrador</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Cursos" value={stats?.cursos} icon={<BookOpen className="h-5 w-5" />} href="/dashboard/admin/cursos" />
          <StatCard title="Profesores" value={stats?.profesores} icon={<Users className="h-5 w-5" />} href="/dashboard/admin/usuarios" />
          <StatCard title="Estudiantes" value={stats?.estudiantes} icon={<GraduationCap className="h-5 w-5" />} href="/dashboard/admin/usuarios" />
          <StatCard title="Periodos" value={stats?.periodos} icon={<Calendar className="h-5 w-5" />} href="/dashboard/admin/periodos" />
          <StatCard title="Clases" value={stats?.clases} icon={<Calendar className="h-5 w-5" />} href="/dashboard/admin/clases" />
          <StatCard title="Matrículas" value={stats?.matriculas} icon={<GraduationCap className="h-5 w-5" />} href="/dashboard/admin/matriculas" />
        </div>

        {/* Lists */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Últimos Cursos</CardTitle>
                <Link href="/dashboard/admin/cursos"><Button variant="outline" size="sm">Ver todos</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Cargando...</div>
              ) : recentCursos.length ? (
                <div className="space-y-3">
                  {recentCursos.map((c) => (
                    <div key={c._id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{c.nombre}</div>
                          <div className="text-xs text-muted-foreground">{c.codigo} · {c.nivel}</div>
                        </div>
                        <Link href="/dashboard/admin/cursos"><Button size="sm" variant="outline">Gestionar</Button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sin cursos recientes</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Próximas Clases</CardTitle>
                <Link href="/dashboard/admin/clases"><Button variant="outline" size="sm">Ver todas</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Cargando...</div>
              ) : upcomingClases.length ? (
                <div className="space-y-3">
                  {upcomingClases.map((a) => (
                    <div key={a._id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{a.titulo}</div>
                          <div className="text-xs text-muted-foreground">{a.fecha ? new Date(a.fecha).toLocaleDateString('es-ES') : 'Sin fecha'} · {a.horaInicio} - {a.horaFin}</div>
                        </div>
                        <Link href="/dashboard/admin/clases"><Button size="sm" variant="outline">Gestionar</Button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sin clases programadas</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Periodos Recientes</CardTitle>
                <Link href="/dashboard/admin/periodos"><Button variant="outline" size="sm">Ver todos</Button></Link>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Cargando...</div>
              ) : recentPeriodos.length ? (
                <div className="space-y-3">
                  {recentPeriodos.map((p) => (
                    <div key={p._id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{p.nombre}</div>
                          <div className="text-xs text-muted-foreground">{new Date(p.fechaInicio).toLocaleDateString('es-ES')} - {new Date(p.fechaFin).toLocaleDateString('es-ES')}</div>
                        </div>
                        <Link href="/dashboard/admin/periodos"><Button size="sm" variant="outline">Gestionar</Button></Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Sin periodos recientes</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}

function StatCard({ title, value, icon, href }: { title: string; value?: number; icon: React.ReactNode; href: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{title}</span>
          <span className="text-primary">{icon}</span>
        </div>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-3xl font-bold">{value ?? '-'}</div>
        <Link href={href}><Button variant="outline" size="sm">Ver</Button></Link>
      </CardContent>
    </Card>
  )
}

