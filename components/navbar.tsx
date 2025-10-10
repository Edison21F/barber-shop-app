"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Scissors, User, LogOut, LayoutDashboard, ShoppingCart } from "lucide-react"
import { getUserData, removeAuthToken } from "@/lib/api"
import { useEffect, useState } from "react"

export function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getUserData>>(null)

  useEffect(() => {
    setUser(getUserData())
  }, [])

  const handleLogout = () => {
    removeAuthToken()
    setUser(null)
    router.push("/")
  }

  return (
    <nav className="border-b border-border bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Barber Shop</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/cursos" className="text-sm font-medium hover:text-primary">
              Cursos
            </Link>

            {user && (
              <Link href="/carrito">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.nombres}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/${user.rol}`)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link href="/register">
                  <Button>Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
