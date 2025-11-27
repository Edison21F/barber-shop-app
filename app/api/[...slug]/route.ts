import { NextRequest, NextResponse } from 'next/server'

// Cambia esto según donde está tu backend
// Si está en Docker: 'http://host.docker.internal:4000'
// Si está en otra máquina: 'http://IP:4000'
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `${BACKEND_URL}/api/${path}`

  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl

    console.log(`[GET] Proxying to: ${fullUrl}`)

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')

    const authHeader = request.headers.get('Authorization')
    if (authHeader) headers.set('Authorization', authHeader)

    const cookie = request.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
    })

    const resContentType = response.headers.get('content-type')

    if (!resContentType || !resContentType.includes('application/json')) {
      const text = await response.text()
      console.error(`[GET] Non-JSON response from backend: ${text}`)
      return NextResponse.json(
        { error: 'Invalid response from backend', details: text },
        { status: 500 }
      )
    }

    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })

    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)

    return res
  } catch (error) {
    console.error('[GET] Proxy error:', error)
    return NextResponse.json(
      {
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        backend: BACKEND_URL,
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `${BACKEND_URL}/api/${path}`

  try {
    const reqContentType = request.headers.get('content-type') || ''
    const headers = new Headers()

    const authHeader = request.headers.get('Authorization')
    if (authHeader) headers.set('Authorization', authHeader)

    const cookie = request.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    let body: any
    if (reqContentType.includes('application/json')) {
      const json = await request.json()
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(json)
    } else if (reqContentType.includes('multipart/form-data')) {
      // No establecer Content-Type manualmente para preservar el boundary
      body = await request.formData()
    } else {
      // Passthrough para otros tipos
      headers.set('Content-Type', reqContentType)
      const arrayBuffer = await request.arrayBuffer()
      body = arrayBuffer as any
    }

    console.log(`[POST] Proxying to: ${backendUrl} (Content-Type: ${reqContentType})`)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body,
    })

    const resContentType = response.headers.get('content-type')

    if (!resContentType || !resContentType.includes('application/json')) {
      const text = await response.text()
      console.error(`[POST] Non-JSON response from backend. Content-Type: ${resContentType}`)
      console.error(`[POST] Response preview: ${text.substring(0, 200)}...`)
      return NextResponse.json(
        {
          error: 'El backend no está devolviendo JSON',
          message:
            'El servidor backend está devolviendo HTML en lugar de JSON. Verifica que el endpoint esté configurado correctamente.',
          contentType: resContentType,
          preview: text.substring(0, 200),
        },
        { status: 500 }
      )
    }

    const data = await response.json()
    console.log(`[POST] Backend response:`, { status: response.status, data })

    const res = NextResponse.json(data, { status: response.status })

    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)

    return res
  } catch (error) {
    console.error('[POST] Proxy error:', error)
    return NextResponse.json(
      {
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        backend: BACKEND_URL,
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `${BACKEND_URL}/api/${path}`

  try {
    const reqContentType = request.headers.get('content-type') || ''
    const headers = new Headers()

    const authHeader = request.headers.get('Authorization')
    if (authHeader) headers.set('Authorization', authHeader)

    const cookie = request.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    let body: any
    if (reqContentType.includes('application/json')) {
      const json = await request.json()
      headers.set('Content-Type', 'application/json')
      body = JSON.stringify(json)
    } else if (reqContentType.includes('multipart/form-data')) {
      body = await request.formData()
    } else {
      headers.set('Content-Type', reqContentType)
      const arrayBuffer = await request.arrayBuffer()
      body = arrayBuffer as any
    }

    console.log(`[PUT] Proxying to: ${backendUrl} (Content-Type: ${reqContentType})`)

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body,
    })

    const resContentType = response.headers.get('content-type')

    if (!resContentType || !resContentType.includes('application/json')) {
      const text = await response.text()
      console.error(`[PUT] Non-JSON response from backend: ${text}`)
      return NextResponse.json(
        { error: 'Invalid response from backend', details: text },
        { status: 500 }
      )
    }

    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })

    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)

    return res
  } catch (error) {
    console.error('[PUT] Proxy error:', error)
    return NextResponse.json(
      {
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        backend: BACKEND_URL,
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `${BACKEND_URL}/api/${path}`

  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl

    console.log(`[DELETE] Proxying to: ${fullUrl}`)

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')

    const authHeader = request.headers.get('Authorization')
    if (authHeader) headers.set('Authorization', authHeader)

    const cookie = request.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    const response = await fetch(fullUrl, {
      method: 'DELETE',
      headers,
    })

    const resContentType = response.headers.get('content-type')

    if (!resContentType || !resContentType.includes('application/json')) {
      const text = await response.text()
      console.error(`[DELETE] Non-JSON response from backend: ${text}`)
      return NextResponse.json(
        { error: 'Invalid response from backend', details: text },
        { status: 500 }
      )
    }

    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })

    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)

    return res
  } catch (error) {
    console.error('[DELETE] Proxy error:', error)
    return NextResponse.json(
      {
        error: 'Failed to connect to backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        backend: BACKEND_URL,
      },
      { status: 500 }
    )
  }
}

