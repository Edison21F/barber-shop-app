"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Scissors } from "lucide-react"
import { authApi, setAuthToken, setUserData, ApiError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await authApi.login(formData)
      setAuthToken(response.token)
      setUserData(response.usuario)

      toast({
        title: "Bienvenido",
        description: `Hola ${response.usuario.nombres}, has iniciado sesión correctamente.`,
      })

      // Redirect based on role
      if (response.usuario.rol === "estudiante") {
        router.push("/dashboard/estudiante")
      } else if (response.usuario.rol === "docente") {
        router.push("/dashboard/docente")
      } else {
        router.push("/dashboard/admin")
      }
    } catch (error) {
      if (error instanceof ApiError) {
        toast({
          title: "Error al iniciar sesión",
          description: error.message,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo conectar con el servidor. Verifica que la API esté corriendo en localhost:4000",
          variant: "destructive",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-primary">
            <Scissors className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder a tu cuenta</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">¿No tienes una cuenta? </span>
            <Link href="/register" className="font-medium text-primary hover:underline">
              Regístrate aquí
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
