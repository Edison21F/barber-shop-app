"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Scissors, User, LogOut, LayoutDashboard, BookOpen, Calendar, Menu } from "lucide-react"
import { getUserData, removeAuthToken } from "@/lib/api"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface DashboardLayoutProps {
  children: React.ReactNode
  role: "estudiante" | "docente" | "admin"
}

export function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getUserData>>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const userData = getUserData()
    if (!userData) {
      router.push("/login")
      return
    }
    if (userData.rol !== role) {
      router.push(`/dashboard/${userData.rol}`)
      return
    }
    setUser(userData)
  }, [role, router])

  const handleLogout = () => {
    removeAuthToken()
    router.push("/")
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  const navigation = {
    estudiante: [
      { name: "Dashboard", href: "/dashboard/estudiante", icon: LayoutDashboard },
      { name: "Mis Cursos", href: "/dashboard/estudiante/cursos", icon: BookOpen },
      { name: "Clases", href: "/dashboard/estudiante/clases", icon: Calendar },
      { name: "Perfil", href: "/dashboard/estudiante/perfil", icon: User },
    ],
    docente: [
      { name: "Dashboard", href: "/dashboard/docente", icon: LayoutDashboard },
      { name: "Mis Clases", href: "/dashboard/docente/clases", icon: Calendar },
      { name: "Estudiantes", href: "/dashboard/docente/estudiantes", icon: User },
      { name: "Perfil", href: "/dashboard/docente/perfil", icon: User },
    ],
    admin: [
      { name: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
      { name: "Cursos", href: "/dashboard/admin/cursos", icon: BookOpen },
      { name: "Usuarios", href: "/dashboard/admin/usuarios", icon: User },
      { name: "Perfil", href: "/dashboard/admin/perfil", icon: User },
    ],
  }

  const navItems = navigation[role]

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => setIsOpen(false)}
        >
          <item.icon className="h-5 w-5" />
          {item.name}
        </Link>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                      <Scissors className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold">Barber Shop</span>
                  </div>
                  <nav className="space-y-1">
                    <NavLinks />
                  </nav>
                </SheetContent>
              </Sheet>

              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Scissors className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">Barber Shop</span>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/cursos">
                <Button variant="ghost" size="sm">
                  Ver Cursos
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.nombres}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="px-2 py-1.5 text-sm">
                    <p className="font-medium">{`${user.nombres} ${user.apellidos}`}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Desktop */}
          <aside className="hidden w-64 flex-shrink-0 lg:block">
            <nav className="space-y-1">
              <NavLinks />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  )
}
