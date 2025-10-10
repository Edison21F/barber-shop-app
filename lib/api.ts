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
  historialCursos: {
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
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Error desconocido" }))
    throw new ApiError(response.status, error.message || "Error en la solicitud")
  }
  return response.json()
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(credentials),
    })
    return handleResponse<AuthResponse>(response)
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    })
    return handleResponse<AuthResponse>(response)
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
    const response = await fetch(`${API_BASE_URL}/curso/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/estudiante/profile`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<EstudianteProfile>(response)
  },

  async updateProfile(data: Partial<EstudianteProfile>): Promise<EstudianteProfile> {
    const response = await fetch(`${API_BASE_URL}/estudiante/profile`, {
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
    const response = await fetch(`${API_BASE_URL}/matricula`, {
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
    const response = await fetch(`${API_BASE_URL}/matricula`, {
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
    const response = await fetch(`${API_BASE_URL}/matricula`, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
      },
      credentials: "include",
    })
    return handleResponse<Matricula[]>(response)
  },

  async getById(id: string): Promise<Matricula> {
    const response = await fetch(`${API_BASE_URL}/matricula/${id}`, {
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
    const response = await fetch(`${API_BASE_URL}/matricula/${id}`, {
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
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token)
  }
}

export function getAuthToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth_token")
  }
  return null
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
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
