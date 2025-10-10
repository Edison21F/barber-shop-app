import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `http://localhost:4000/api/${path}`

  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl

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

    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })
    // Forward set-cookie if any
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)
    return res
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `http://localhost:4000/api/${path}`

  try {
    const body = await request.json()

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    const authHeader = request.headers.get('Authorization')
    if (authHeader) headers.set('Authorization', authHeader)
    const cookie = request.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)
    return res
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `http://localhost:4000/api/${path}`

  try {
    const body = await request.json()

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    const authHeader = request.headers.get('Authorization')
    if (authHeader) headers.set('Authorization', authHeader)
    const cookie = request.headers.get('cookie')
    if (cookie) headers.set('cookie', cookie)

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    })

    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)
    return res
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const path = slug.join('/')
  const backendUrl = `http://localhost:4000/api/${path}`

  try {
    const url = new URL(request.url)
    const searchParams = url.searchParams.toString()
    const fullUrl = searchParams ? `${backendUrl}?${searchParams}` : backendUrl

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

    const data = await response.json()
    const res = NextResponse.json(data, { status: response.status })
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) res.headers.set('set-cookie', setCookie)
    return res
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch from backend' }, { status: 500 })
  }
}