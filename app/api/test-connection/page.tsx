"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestAuthPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testBackendDirect = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'leonardoedi1979@gmail.com',
          password: '123456'
        }),
      })
      
      const data = await response.json()
      setResult({
        type: 'Direct to Backend',
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setResult({
        type: 'Direct to Backend',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testViaProxy = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'leonardoedi1979@gmail.com',
          password: '123456'
        }),
      })
      
      const data = await response.json()
      setResult({
        type: 'Via Next.js Proxy',
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setResult({
        type: 'Via Next.js Proxy',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnectionEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-connection')
      const data = await response.json()
      setResult({
        type: 'Connection Test',
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setResult({
        type: 'Connection Test',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  const testLoginEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-login', {
        method: 'POST'
      })
      const data = await response.json()
      setResult({
        type: 'Login Test Endpoint',
        status: response.status,
        ok: response.ok,
        data
      })
    } catch (error) {
      setResult({
        type: 'Login Test Endpoint',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <Card>
        <CardHeader>
          <CardTitle>Test Authentication Endpoints</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button 
              onClick={testConnectionEndpoint} 
              disabled={loading}
              variant="outline"
            >
              1. Test Connection
            </Button>
            
            <Button 
              onClick={testLoginEndpoint} 
              disabled={loading}
              variant="outline"
            >
              2. Test Login Endpoint
            </Button>

            <Button 
              onClick={testBackendDirect} 
              disabled={loading}
              variant="secondary"
            >
              3. Direct to Backend
            </Button>

            <Button 
              onClick={testViaProxy} 
              disabled={loading}
            >
              4. Via Next.js Proxy
            </Button>
          </div>

          {loading && (
            <div className="text-center text-muted-foreground">
              Testing...
            </div>
          )}

          {result && (
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-lg">{result.type}</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-auto rounded bg-background p-4 text-sm">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950">
            <h3 className="mb-2 font-semibold">Instrucciones:</h3>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Haz clic en "1. Test Connection" - debe decir success: true</li>
              <li>Haz clic en "2. Test Login Endpoint" - verás qué responde</li>
              <li>Haz clic en "3. Direct to Backend" - puede dar error CORS (es normal)</li>
              <li>Haz clic en "4. Via Next.js Proxy" - debe funcionar igual que el #2</li>
            </ol>
          </div>

          <div className="rounded-lg border p-4 text-sm">
            <h3 className="mb-2 font-semibold">Credenciales de prueba:</h3>
            <p>Email: test@test.com</p>
            <p>Password: test123</p>
            <p className="mt-2 text-muted-foreground">
              (Estas son solo para prueba, crea un usuario real en tu backend si no existe)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}