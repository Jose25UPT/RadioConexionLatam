// src/types/Noticia.ts
export interface AutorInfo {
  nombre?: string;
  titulo?: string;
  descripcion?: string;
  avatar?: string;
  nivel?: number;
  experiencia_años?: number;
  articulos_total?: number;
  seguidores?: number;
  precision?: number;
  especialidades?: string[];
  logros?: string[];
  top_anime?: string[];
  redes_sociales?: { [key: string]: string };
  frase?: string;
}

export interface Noticia {
  id: number;
  titulo: string;
  slug?: string;
  resumen: string;
  contenido: string;
  fecha: string;
  fecha_creacion?: string;
  fecha_actualizacion?: string;
  imagen: string;
  categoria: string;
  programa?: string;
  tags: string[];
  vistas: number;
  likes: number;
  comentarios: number;
  compartidos: number;
  destacada: boolean;
  tiempo_lectura?: number; // minutos estimados
  
  // Datos del autor
  autor_info?: AutorInfo;
  
  // Audio relacionado
  audio_url?: string;
  audio_titulo?: string;
  
  // Configuración de comentarios
  permitir_comentarios?: boolean;
  permitir_anonimos?: boolean;
  
  // Artículos relacionados
  articulos_relacionados?: number[];
}

export interface NoticiaCrear {
  titulo: string;
  resumen: string;
  contenido: string;
  fecha?: string; // opcional, backend pone date.today si falta
  imagen: string;
  categoria: string;
  programa?: string;
  tags: string[];
  destacada: boolean;
  
  // Datos del autor
  autor_info?: AutorInfo;
  
  // Audio relacionado
  audio_url?: string;
  audio_titulo?: string;
  
  // Configuración
  permitir_comentarios?: boolean;
  permitir_anonimos?: boolean;
  
  // Artículos relacionados
  articulos_relacionados?: number[];
  // Opcional para previsualizar antes de respuesta del backend
  tiempo_lectura?: number;
}

export interface NoticiaActualizar {
  titulo?: string;
  resumen?: string;
  contenido?: string;
  autor?: string;
  fecha?: string;
  imagen?: string;
  categoria?: string;
  programa?: string;
  tags?: string[];
  destacada?: boolean;
}
