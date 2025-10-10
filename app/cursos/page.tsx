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
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-balance">Nuestros Cursos</h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground text-pretty">
            Descubre nuestra amplia variedad de cursos diseñados para llevarte desde principiante hasta profesional de
            la barbería.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar cursos por nombre, código o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={nivelFilter} onValueChange={setNivelFilter}>
              <SelectTrigger className="w-[180px]">
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

        {/* Results count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Mostrando {filteredCursos.length} de {cursos.length} cursos
          </p>
        </div>

        {/* Course Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[500px] animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : filteredCursos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCursos.map((curso) => (
              <CourseCard key={curso._id} curso={curso} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-muted-foreground">No se encontraron cursos con los filtros seleccionados.</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
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
