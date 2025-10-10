"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Trash2, ArrowLeft, CreditCard, AlertCircle } from "lucide-react"
import { carritoApi, cursosApi, getUserData, type CarritoItem, type Curso, type Periodo, getAuthToken } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface CarritoItemWithDetails extends CarritoItem {
  curso?: Curso
  periodo?: Periodo
}

export default function CarritoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [items, setItems] = useState<CarritoItemWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "tarjeta">("efectivo")
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false)
  const user = getUserData()
  const isAuthenticated = getAuthToken() !== null

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    loadCarrito()
  }, [isAuthenticated])

  const loadCarrito = async () => {
    try {
      const carritoItems = await carritoApi.getItems()

      // Load details for each item
      const itemsWithDetails = await Promise.all(
        carritoItems.map(async (item) => {
          try {
            const [curso, periodos] = await Promise.all([
              cursosApi.getById(item.cursoId),
              cursosApi.getPeriodosByCurso(item.cursoId),
            ])
            const periodo = periodos.find((p) => p._id === item.periodoId)
            return { ...item, curso, periodo }
          } catch (error) {
            return item
          }
        }),
      )

      setItems(itemsWithDetails)
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar el carrito.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = async (cursoId: string, periodoId: string) => {
    try {
      await carritoApi.removeItem(cursoId, periodoId)
      toast({
        title: "Eliminado",
        description: "El curso ha sido eliminado del carrito.",
      })
      loadCarrito()
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el curso del carrito.",
        variant: "destructive",
      })
    }
  }

  const handleCheckout = async () => {
    setIsProcessing(true)
    try {
      const result = await carritoApi.checkout({ metodoPago })
      toast({
        title: "Matrícula exitosa",
        description: result.message,
      })
      setShowCheckoutDialog(false)
      router.push("/dashboard/estudiante/cursos")
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo completar la matrícula.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const total = items.reduce((sum, item) => sum + (item.curso?.precio || 0), 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-muted" />
            <div className="h-64 rounded-lg bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-12">
        <Link
          href="/cursos"
          className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Seguir comprando
        </Link>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Carrito de Compras</h1>
          <p className="text-muted-foreground">Revisa tus cursos antes de completar la matrícula</p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-xl font-semibold">Tu carrito está vacío</h3>
              <p className="mb-6 text-muted-foreground">Explora nuestros cursos y comienza tu formación profesional.</p>
              <Link href="/cursos">
                <Button>Ver Cursos</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="space-y-4 lg:col-span-2">
              {items.map((item) => (
                <Card key={`${item.cursoId}-${item.periodoId}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="mb-2 text-xl font-semibold">{item.curso?.nombre || "Curso"}</h3>
                        <p className="mb-3 text-sm text-muted-foreground">{item.curso?.codigo}</p>

                        {item.periodo && (
                          <div className="space-y-1 text-sm">
                            <p>
                              <span className="font-medium">Período:</span> {item.periodo.nombre}
                            </p>
                            <p>
                              <span className="font-medium">Inicio:</span>{" "}
                              {new Date(item.periodo.fechaInicio).toLocaleDateString("es-ES")}
                            </p>
                            <p>
                              <span className="font-medium">Horario:</span> {item.periodo.horario}
                            </p>
                          </div>
                        )}

                        <div className="mt-4">
                          <Badge>{item.curso?.nivel}</Badge>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="mb-4 text-2xl font-bold text-primary">${item.curso?.precio.toFixed(2)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.cursoId, item.periodoId)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumen de Compra</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Descuento</span>
                      <span>$0.00</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Dialog open={showCheckoutDialog} onOpenChange={setShowCheckoutDialog}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <CreditCard className="mr-2 h-5 w-5" />
                        Proceder al Pago
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Completar Matrícula</DialogTitle>
                        <DialogDescription>
                          Selecciona tu método de pago para finalizar la inscripción.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="metodoPago">Método de Pago</Label>
                          <Select value={metodoPago} onValueChange={(value: any) => setMetodoPago(value)}>
                            <SelectTrigger id="metodoPago">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="efectivo">Efectivo</SelectItem>
                              <SelectItem value="transferencia">Transferencia Bancaria</SelectItem>
                              <SelectItem value="tarjeta">Tarjeta de Crédito/Débito</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="rounded-lg bg-muted p-4">
                          <div className="mb-2 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Total a pagar</span>
                          </div>
                          <p className="text-2xl font-bold text-primary">${total.toFixed(2)}</p>
                        </div>

                        <Button onClick={handleCheckout} disabled={isProcessing} className="w-full" size="lg">
                          {isProcessing ? "Procesando..." : "Confirmar Matrícula"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="mb-2 font-medium">Incluye:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Acceso completo al curso</li>
                      <li>• Material didáctico</li>
                      <li>• Certificado al finalizar</li>
                      <li>• Soporte de instructores</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
