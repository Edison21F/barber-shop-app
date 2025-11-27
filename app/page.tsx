"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Scissors, GraduationCap, Calendar, Users, Clock, BookOpen, Star, ChevronRight, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"
import { cursosApi, type Curso } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const [cursos, setCursos] = useState<Curso[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const data = await cursosApi.getAll()
        setCursos(data)
      } catch (error) {
        console.error("Error fetching courses:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCursos()
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary/20">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
              <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm border-primary/30 bg-primary/5 text-primary backdrop-blur-sm">
                <Star className="mr-2 h-3.5 w-3.5 fill-primary" />
                Formando a la próxima generación de barberos
              </Badge>
            </div>

            <h1 className="mb-6 max-w-4xl text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 ease-out text-balance">
              Domina el Arte de la <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Barbería Moderna</span>
            </h1>

            <p className="mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 ease-out text-pretty">
              Únete a la academia líder y transforma tu pasión en una carrera exitosa. Aprende de expertos, practica con modelos reales y obtén tu certificación profesional.
            </p>

            <div className="flex flex-wrap justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 ease-out">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8 text-lg shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/40">
                  Comenzar Ahora
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/cursos">
                <Button size="lg" variant="outline" className="h-12 px-8 text-lg backdrop-blur-sm transition-all hover:bg-secondary/10 hover:text-secondary hover:border-secondary/50">
                  Explorar Cursos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-24 bg-muted/30 relative">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 view-timeline-name:--section-title">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">Nuestros Cursos Destacados</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Programas diseñados meticulosamente para llevarte desde los fundamentos hasta las técnicas más avanzadas.
            </p>
          </div>

          {isLoading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse border-none shadow-none bg-background/50">
                  <div className="h-56 bg-muted rounded-t-xl" />
                  <CardContent className="pt-6">
                    <div className="h-6 w-3/4 bg-muted rounded mb-4" />
                    <div className="h-4 w-full bg-muted rounded mb-2" />
                    <div className="h-4 w-2/3 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : cursos.length > 0 ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {cursos.slice(0, 3).map((curso, index) => (
                <Card
                  key={curso._id}
                  className="group relative flex flex-col overflow-hidden border-border/50 bg-background transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 transition-opacity group-hover:opacity-40" />
                    <Badge className="absolute top-4 right-4 z-20 bg-background/90 text-foreground backdrop-blur-md shadow-sm hover:bg-background">
                      {curso.nivel.charAt(0).toUpperCase() + curso.nivel.slice(1)}
                    </Badge>
                    {curso.imagen ? (
                      <img
                        src={curso.imagen}
                        alt={curso.nombre}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-secondary/5">
                        <Scissors className="h-16 w-16 text-secondary/40" />
                      </div>
                    )}
                  </div>

                  <CardHeader className="relative z-10 -mt-12 pb-2">
                    <div className="rounded-lg bg-background/95 p-4 shadow-sm backdrop-blur-sm border border-border/50">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{curso.duracionSemanas} semanas</span>
                        </div>
                        <span className="text-lg font-bold text-primary">${curso.precio}</span>
                      </div>
                      <CardTitle className="line-clamp-1 text-xl">{curso.nombre}</CardTitle>
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1 pt-4">
                    <p className="mb-6 line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {curso.descripcion}
                    </p>

                    <div className="space-y-3">
                      {(curso.objetivos || []).slice(0, 2).map((obj, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground/80">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <CardFooter className="pt-2 pb-6">
                    <Link href={`/cursos/${curso._id}`} className="w-full">
                      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" variant="secondary">
                        Ver Detalles del Curso
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 rounded-full bg-muted p-6">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">Próximamente</h3>
              <p className="text-muted-foreground">Estamos preparando nuevos cursos para ti.</p>
            </div>
          )}

          <div className="mt-16 text-center">
            <Link href="/cursos">
              <Button variant="outline" size="lg" className="px-8 border-primary/20 hover:bg-primary/5 hover:text-primary hover:border-primary/50 transition-all">
                Ver Catálogo Completo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  ¿Por qué elegir <span className="text-primary">Barber Shop</span>?
                </h2>
                <p className="text-lg text-muted-foreground">
                  No solo enseñamos a cortar cabello, formamos profesionales integrales listos para el éxito en la industria.
                </p>
              </div>

              <div className="grid gap-6">
                {[
                  {
                    icon: GraduationCap,
                    title: "Certificación Profesional",
                    desc: "Títulos reconocidos que avalan tus habilidades y conocimientos."
                  },
                  {
                    icon: Users,
                    title: "Instructores Expertos",
                    desc: "Aprende directamente de barberos con años de trayectoria exitosa."
                  },
                  {
                    icon: Calendar,
                    title: "Horarios Flexibles",
                    desc: "Adapta tu aprendizaje a tu ritmo de vida con opciones presenciales y virtuales."
                  },
                  {
                    icon: Scissors,
                    title: "Práctica Real",
                    desc: "Gana experiencia trabajando con modelos reales desde las primeras semanas."
                  }
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors duration-300">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 lg:order-last order-first">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 mix-blend-overlay z-10" />
              {/* Placeholder for a real image - using a colored div for now */}
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <Scissors className="h-32 w-32 text-muted-foreground/20" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent z-20 text-white">
                <blockquote className="text-lg font-medium italic mb-4">
                  "La mejor decisión profesional que he tomado. La calidad de la enseñanza y el ambiente son inigualables."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="font-bold">JD</span>
                  </div>
                  <div>
                    <div className="font-semibold">Juan Diego</div>
                    <div className="text-sm text-white/80">Graduado 2024</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-primary z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold text-primary-foreground md:text-5xl tracking-tight">
            Tu Futuro Empieza Hoy
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/90 md:text-xl">
            No dejes pasar la oportunidad de convertirte en el profesional que siempre soñaste. Cupos limitados para el próximo ciclo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                Inscríbete Ahora
              </Button>
            </Link>
            <Link href="/contacto">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                Contáctanos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold mb-4">Barber Shop</h3>
              <p className="text-muted-foreground max-w-xs">
                La academia de barbería líder en formación de profesionales de alto nivel.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/cursos" className="hover:text-primary transition-colors">Cursos</Link></li>
                <li><Link href="/nosotros" className="hover:text-primary transition-colors">Nosotros</Link></li>
                <li><Link href="/contacto" className="hover:text-primary transition-colors">Contacto</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacidad" className="hover:text-primary transition-colors">Privacidad</Link></li>
                <li><Link href="/terminos" className="hover:text-primary transition-colors">Términos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Barber Shop. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
