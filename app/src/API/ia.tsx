import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { BASE_URL, PET } from "../utils/constans.jsx";

const AI = `${BASE_URL}/ai`;

export interface SubtareaIA {
  nombre: string;
  descripcion: string;
}

async function authHeaders() {
  const token = await AsyncStorage.getItem("token");
  if (!token) throw new Error("No hay sesión iniciada.");
  return { Authorization: `${token}` };
}

/** Mensaje de error legible a partir de una respuesta del backend. */
function mensajeDeError(error: any): string {
  const msg = error?.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (error?.code === "ECONNABORTED") return "La IA tardó demasiado. Intenta de nuevo.";
  return "No se pudo conectar con el servidor.";
}

/**
 * Pide a la IA (Ollama en el backend) que divida una meta en subtareas.
 * No crea tareas: solo devuelve sugerencias. Lanza Error con un mensaje legible.
 */
export const desglosarMeta = async (meta: string, cantidad = 5): Promise<SubtareaIA[]> => {
  try {
    const response = await axios.post(
      `${AI}/desglosar`,
      { meta, cantidad },
      // El modelo local puede tardar, sobre todo la primera vez que se carga.
      { headers: await authHeaders(), timeout: 130_000 }
    );
    return response.data?.subtareas ?? [];
  } catch (error: any) {
    console.log("❌ Error al desglosar con IA:", error?.response?.data || error?.message);
    throw new Error(mensajeDeError(error));
  }
};

export interface MensajePerro {
  mensaje: string;
  fuente: "ia" | "plantilla";
  estado: string;
}

/** Mensaje del perro según las tareas del usuario. Devuelve null si falla. */
export const getMensajePerro = async (): Promise<MensajePerro | null> => {
  try {
    const response = await axios.get(`${PET}/mensaje`, {
      headers: await authHeaders(),
      timeout: 60_000,
    });
    return response.data;
  } catch (error: any) {
    console.log("❌ Error al obtener el mensaje del perro:", error?.response?.data || error?.message);
    return null;
  }
};
