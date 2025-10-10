import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { Scissors, GraduationCap, Calendar, Users } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-5xl font-bold leading-tight text-balance">
              Aprende el Arte de la Barbería Profesional
            </h1>
            <p className="mb-8 text-xl text-muted-foreground text-pretty">
              Domina las técnicas clásicas y modernas con nuestros cursos especializados. Instructores expertos,
              horarios flexibles y certificación profesional.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/register">
                <Button size="lg" className="text-lg">
                  Comenzar Ahora
                </Button>
              </Link>
              <Link href="/cursos">
                <Button size="lg" variant="outline" className="text-lg bg-transparent">
                  Ver Cursos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">¿Por qué elegir Barber Shop?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Cursos Profesionales</h3>
                <p className="text-muted-foreground">
                  Programas diseñados por expertos con años de experiencia en la industria.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Users className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Instructores Expertos</h3>
                <p className="text-muted-foreground">
                  Aprende de barberos certificados con amplia trayectoria profesional.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Horarios Flexibles</h3>
                <p className="text-muted-foreground">Clases presenciales y virtuales adaptadas a tu disponibilidad.</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                  <Scissors className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Práctica Real</h3>
                <p className="text-muted-foreground">
                  Equipamiento profesional y práctica con modelos reales desde el inicio.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-balance">Comienza tu carrera en la barbería hoy</h2>
          <p className="mb-8 text-lg opacity-90 text-pretty">
            Únete a cientos de estudiantes que ya están transformando su futuro profesional.
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="text-lg">
              Inscríbete Ahora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Barber Shop. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
