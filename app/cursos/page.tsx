"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { CourseCard } from "@/components/course-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter } from "lucide-react"
import { cursosApi, type Curso } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function CursosPage() {
  const { toast } = useToast()
  const [cursos, setCursos] = useState<Curso[]>([])
  const [filteredCursos, setFilteredCursos] = useState<Curso[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [nivelFilter, setNivelFilter] = useState<string>("todos")

  useEffect(() => {
    loadCursos()
  }, [])

  useEffect(() => {
    filterCursos()
  }, [searchTerm, nivelFilter, cursos])

  const loadCursos = async () => {
    try {
      const data = await cursosApi.getAll()
      setCursos(data)
      setFilteredCursos(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los cursos. Verifica tu conexión.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterCursos = () => {
    let filtered = cursos

    if (searchTerm) {
      filtered = filtered.filter(
        (curso) =>
          curso.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          curso.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          curso.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (nivelFilter !== "todos") {
      filtered = filtered.filter((curso) => curso.nivel === nivelFilter)
    }

    setFilteredCursos(filtered)
  }

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />

      {/* Header Section */}
      <section className="relative overflow-hidden bg-muted/30 pt-24 pb-16 md:pt-32 md:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            Explora Nuestros <span className="text-primary">Cursos</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            Descubre nuestra amplia variedad de programas diseñados para llevarte desde principiante hasta profesional de la barbería.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-10 rounded-xl border bg-card p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar cursos por nombre, código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <div className="flex items-center gap-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={nivelFilter} onValueChange={setNivelFilter}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los niveles</SelectItem>
                  <SelectItem value="basico">Básico</SelectItem>
                  <SelectItem value="intermedio">Intermedio</SelectItem>
                  <SelectItem value="avanzado">Avanzado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <p>
              Mostrando <span className="font-medium text-foreground">{filteredCursos.length}</span> resultados
            </p>
            {(searchTerm || nivelFilter !== "todos") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setNivelFilter("todos")
                }}
                className="h-auto p-0 text-muted-foreground hover:text-foreground"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[450px] animate-pulse rounded-xl bg-muted/50" />
            ))}
          </div>
        ) : filteredCursos.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredCursos.map((curso, index) => (
              <div
                key={curso._id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-backwards"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CourseCard curso={curso} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
            <div className="mb-4 rounded-full bg-muted p-6">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron cursos</h3>
            <p className="text-muted-foreground max-w-md mb-6">
              No hay resultados que coincidan con tus filtros. Intenta con otros términos o limpia los filtros.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("")
                setNivelFilter("todos")
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
