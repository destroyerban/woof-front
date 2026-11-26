// Ventana "Desglosar con IA": el usuario escribe una meta, la IA (Ollama en el
// backend) sugiere subtareas, y el usuario elige cuáles agregar al tablero.
import React, { ReactNode, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { desglosarMeta, SubtareaIA } from "../../API/ia";

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Crea las subtareas elegidas. Si lanza error, la ventana sigue abierta. */
  onAgregar: (subtareas: SubtareaIA[]) => Promise<void>;
  /** Contenido extra que se muestra antes del botón de agregar (por ejemplo, elegir responsable). */
  children?: ReactNode;
  /** Permite bloquear el botón de agregar (por ejemplo, si falta el responsable). */
  puedeAgregar?: boolean;
  textoAyuda?: string;
}

export default function ModalDesglosarIA({
  visible,
  onClose,
  onAgregar,
  children,
  puedeAgregar = true,
  textoAyuda = "Las tareas se agregarán en BACKLOG.",
}: Props) {
  const [meta, setMeta] = useState("");
  const [sugerencias, setSugerencias] = useState<SubtareaIA[]>([]);
  const [elegidas, setElegidas] = useState<boolean[]>([]);
  const [pensando, setPensando] = useState(false);
  const [agregando, setAgregando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cantidadElegidas = elegidas.filter(Boolean).length;

  const reset = () => {
    setMeta("");
    setSugerencias([]);
    setElegidas([]);
    setError(null);
    setPensando(false);
    setAgregando(false);
  };

  const cerrar = () => {
    if (pensando || agregando) return;
    reset();
    onClose();
  };

  const generar = async () => {
    if (meta.trim().length < 3) {
      setError("Escribe una meta un poco más larga.");
      return;
    }
    setError(null);
    setPensando(true);
    setSugerencias([]);
    try {
      const resultado = await desglosarMeta(meta.trim());
      setSugerencias(resultado);
      setElegidas(resultado.map(() => true));
      if (resultado.length === 0) setError("La IA no sugirió tareas. Prueba escribiendo la meta de otra forma.");
    } catch (e: any) {
      setError(e?.message ?? "No se pudo usar la IA.");
    } finally {
      setPensando(false);
    }
  };

  const agregar = async () => {
    const seleccion = sugerencias.filter((_, i) => elegidas[i]);
    if (seleccion.length === 0) return;
    setAgregando(true);
    setError(null);
    try {
      await onAgregar(seleccion);
      reset();
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "No se pudieron agregar las tareas.");
      setAgregando(false);
    }
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={cerrar}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center items-center bg-black/60"
      >
        <View className="bg-white w-11/12 p-5 rounded-2xl shadow-lg max-h-[90%]">
          <Text className="text-2xl font-bold text-blue-900 mb-1 text-center">🪄 Desglosar con IA</Text>
          <Text className="text-gray-500 text-center mb-4">
            Escribe una meta grande y te sugiero las tareas para lograrla 🐾
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled">
            <TextInput
              placeholder="Ej: Preparar la exposición de Cálculo"
              placeholderTextColor="#6b7280"
              value={meta}
              onChangeText={setMeta}
              editable={!pensando && !agregando}
              maxLength={300}
              multiline
              className="border-2 border-blue-300 rounded-lg p-3 text-base text-gray-800 mb-3"
            />

            <TouchableOpacity
              onPress={generar}
              disabled={pensando || agregando}
              className={`rounded-lg py-3 items-center mb-3 ${pensando ? "bg-blue-300" : "bg-blue-600"}`}
            >
              <Text className="text-white font-bold text-base">
                {sugerencias.length > 0 ? "🔄 Generar otra vez" : "🪄 Generar tareas"}
              </Text>
            </TouchableOpacity>

            {pensando && (
              <View className="items-center my-3">
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text className="text-blue-800 mt-2 text-center">
                  El perrito está pensando... 🐶{"\n"}
                  <Text className="text-gray-500 text-xs">Puede tardar unos segundos.</Text>
                </Text>
              </View>
            )}

            {error && <Text className="text-red-600 text-center mb-3">{error}</Text>}

            {sugerencias.map((s, i) => (
              <TouchableOpacity
                key={`${i}-${s.nombre}`}
                onPress={() => setElegidas((prev) => prev.map((v, j) => (j === i ? !v : v)))}
                disabled={agregando}
                className={`flex-row items-start p-3 mb-2 rounded-xl border ${
                  elegidas[i] ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                }`}
              >
                <Text className="text-lg mr-2">{elegidas[i] ? "☑️" : "⬜"}</Text>
                <View className="flex-1">
                  <Text className={`font-semibold ${elegidas[i] ? "text-blue-900" : "text-gray-400"}`}>{s.nombre}</Text>
                  <Text className={elegidas[i] ? "text-gray-600" : "text-gray-400"}>{s.descripcion}</Text>
                </View>
              </TouchableOpacity>
            ))}

            {sugerencias.length > 0 && (
              <>
                {children}
                <Text className="text-gray-500 text-xs text-center mt-1 mb-2">{textoAyuda}</Text>
                <TouchableOpacity
                  onPress={agregar}
                  disabled={agregando || cantidadElegidas === 0 || !puedeAgregar}
                  className={`rounded-lg py-3 items-center ${
                    agregando || cantidadElegidas === 0 || !puedeAgregar ? "bg-green-300" : "bg-green-600"
                  }`}
                >
                  {agregando ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-base">Agregar {cantidadElegidas} tareas</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          <TouchableOpacity onPress={cerrar} disabled={pensando || agregando} className="mt-3 py-2 items-center">
            <Text className="text-gray-500 font-semibold">Cerrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
