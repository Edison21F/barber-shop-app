const API_BASE_URL = "/api"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  nombres: string
  apellidos: string
  email: string
  cedula: string
  telefono: string
  password: string
  rol: "estudiante" | "docente" | "admin"
  avatar?: string
}

export interface AuthResponse {
  token: string
  usuario: {
    id: string
    nombres: string
    apellidos: string
    email: string
    rol: string
    avatar?: string
  }
}

export interface Curso {
  _id: string
  nombre: string
  codigo: string
  descripcion: string
  duracionSemanas: number
  nivel: "basico" | "intermedio" | "avanzado"
  precio: number
  imagen?: string
  cupoMaximo: number
  objetivos: string[]
  requisitos: string[]
}

export interface Periodo {
  _id: string
  cursoId: string
  nombre: string
  codigo: string
  fechaInicio: string
  fechaFin: string
  cuposDisponibles: number
  estado: "planificado" | "inscripciones_abiertas" | "en_curso" | "finalizado" | "cancelado"
  docentesPrincipales: string[]
  horario: string
  observaciones?: string
}

export interface EstudianteProfile {
  _id: string
  usuarioId: string
  direccion?: string
  fechaNacimiento?: string
  contactoEmergencia?: {
    nombre: string
    telefono: string
    relacion: string
  }
  cursoActual?: string
  periodoActual?: string
  estado: "activo" | "inactivo" | "graduado" | "retirado"
  fechaMatricula?: string
  historialCursos?: {
    cursoId: string
    periodoId: string
    fechaInicio: string
    fechaFin: string
    estado: string
    calificacion?: number
  }[]
}

export interface Matricula {
  _id: string
  estudianteId: string
  periodoId: string
  estado: "pendiente" | "pagada" | "completada" | "cancelada"
  metodoPago?: string
  montoPagado: number
  montoPendiente: number
  descuento?: number
  observaciones?: string
  documentos: {
    tipo: string
    url: string
  }[]
  historialPagos: {
    monto: number
    fecha: string
    metodoPago: string
    comprobante?: string
  }[]
  createdAt: string
}

export interface Clase {
  _id: string
  periodoId: string
  moduloId: string
  docenteId: string
  titulo: string
  descripcion: string
  fecha: string
  horaInicio: string
  horaFin: string
  ubicacion: string
  modalidad: "presencial" | "virtual" | "hibrida"
  enlaceVirtual?: string
  materialesClase: string[]
  estado: "programada" | "en_curso" | "finalizada" | "cancelada"
  asistencia: {
    estudianteId: string
    presente: boolean
    observaciones?: string
  }[]
  observaciones?: string
}

export interface CarritoItem {
  cursoId: string
  periodoId: string
}

export interface CheckoutData {
  metodoPago: "efectivo" | "transferencia" | "tarjeta"
}

export interface DocenteProfile {
  _id: string
  usuarioId: string
  especialidad: string
  añosExperiencia: number
  certificaciones: {
    nombre: string
    institucion: string
    fechaObtencion: string
  }[]
  horarioDisponible: {
    diaSemana: string
    horaInicio: string
    horaFin: string
  }[]
  activo: boolean
  calificacionPromedio?: number
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type")
  
  // Si no es JSON, intentar leer como texto para mejor debugging
  if (!contentType || !contentType.includes("application/json")) {
    const text = await response.text()
    console.error("Response is not JSON:", text)
    throw new ApiError(response.status, "La respuesta del servidor no es JSON válido")
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error desconocido" }))
    throw new ApiError(response.status, error.message || error.error || "Error en la solicitud")
  }
  
  return response.json()
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login to:', `${API_BASE_URL}/login`)
      
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      })

      console.log('Login response status:', response.status)
      return handleResponse<AuthResponse>(response)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Attempting register to:', `${API_BASE_URL}/register`)
      
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      })

      console.log('Register response status:', response.status)
      return handleResponse<AuthResponse>(response)
    } catch (error) {
      console.error('Register error:', error)
      throw error
    }
  },
}

export const cursosApi = {
  async getAll(): Promise<Curso[]> {
    const response = await fetch(`${API_BASE_URL}/cursos/activos`, {
      credentials: "include",
    })
    return handleResponse<Curso[]>(response)
  },

  async getById(id: string): Promise<Curso> {
    const response = await fetch(`${API_BASE_URL}/cursos/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Curso>(response)
  },

  async getPeriodosByCurso(cursoId: string): Promise<Periodo[]> {
    const response = await fetch(`${API_BASE_URL}/periodo?cursoId=${cursoId}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Periodo[]>(response)
  },
}

export const estudianteApi = {
  async getProfile(): Promise<EstudianteProfile> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<EstudianteProfile>(response)
  },

  async updateProfile(data: Partial<EstudianteProfile>): Promise<EstudianteProfile> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    return handleResponse<EstudianteProfile>(response)
  },

  async getMatriculas(): Promise<Matricula[]> {
    const response = await fetch(`${API_BASE_URL}/matriculas/estudiante`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Matricula[]>(response)
  },

  async getClases(): Promise<Clase[]> {
    const response = await fetch(`${API_BASE_URL}/clase`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Clase[]>(response)
  },
}

export const carritoApi = {
  async addItem(item: CarritoItem): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/carrito/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(item),
    })
    return handleResponse<{ message: string }>(response)
  },

  async getItems(): Promise<CarritoItem[]> {
    const response = await fetch(`${API_BASE_URL}/carrito/items`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<CarritoItem[]>(response)
  },

  async removeItem(cursoId: string, periodoId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/carrito/items/${cursoId}/${periodoId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<{ message: string }>(response)
  },

  async checkout(data: CheckoutData): Promise<{ message: string; matriculas: Matricula[] }> {
    const response = await fetch(`${API_BASE_URL}/carrito/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    return handleResponse<{ message: string; matriculas: Matricula[] }>(response)
  },
}

export const matriculaApi = {
  async create(data: {
    estudianteId: string
    periodoId: string
    metodoPago: string
    montoPagado: number
    descuento?: number
    observaciones?: string
  }): Promise<Matricula> {
    const response = await fetch(`${API_BASE_URL}/matriculas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    return handleResponse<Matricula>(response)
  },

  async getAll(): Promise<Matricula[]> {
    const response = await fetch(`${API_BASE_URL}/matriculas`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Matricula[]>(response)
  },

  async getById(id: string): Promise<Matricula> {
    const response = await fetch(`${API_BASE_URL}/matriculas/${id}`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Matricula>(response)
  },

  async update(
    id: string,
    data: {
      estado?: string
      montoPendiente?: number
      observaciones?: string
    },
  ): Promise<Matricula> {
    const response = await fetch(`${API_BASE_URL}/matriculas/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    return handleResponse<Matricula>(response)
  },
}

export const profileApi = {
  async get(): Promise<AuthResponse["usuario"] & { cedula: string; telefono: string; activo: boolean; fechaRegistro: string; ultimoAcceso: string }> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      credentials: "include",
    })
    return handleResponse<AuthResponse["usuario"] & { cedula: string; telefono: string; activo: boolean; fechaRegistro: string; ultimoAcceso: string }>(response)
  },
}

export const docenteApi = {
  async getProfile(): Promise<DocenteProfile> {
    const response = await fetch(`${API_BASE_URL}/docente/profile`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<DocenteProfile>(response)
  },

  async updateProfile(data: Partial<DocenteProfile>): Promise<DocenteProfile> {
    const response = await fetch(`${API_BASE_URL}/docente/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    return handleResponse<DocenteProfile>(response)
  },

  async getClases(): Promise<Clase[]> {
    const response = await fetch(`${API_BASE_URL}/clase`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Clase[]>(response)
  },

  async updateClase(id: string, data: Partial<Clase>): Promise<Clase> {
    const response = await fetch(`${API_BASE_URL}/clase/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
    return handleResponse<Clase>(response)
  },
}

export function setAuthToken(token: string) {
  // The backend sets the cookie, so we don't need to set it here
  // But we can store the token in localStorage for backup
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    // First try to read from cookie set by backend
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'auth_token') {
        return value
      }
    }
    // Fallback to localStorage
    return localStorage.getItem("auth_token")
  }
  return null
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    document.cookie = 'auth_token=; path=/; max-age=0'
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
  }
}

export function setUserData(user: AuthResponse["usuario"]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("user_data", JSON.stringify(user))
  }
}

export function getUserData(): AuthResponse["usuario"] | null {
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("user_data")
    if (data) {
      try {
        return JSON.parse(data)
      } catch {
        return null
      }
    }
  }
  return null
}