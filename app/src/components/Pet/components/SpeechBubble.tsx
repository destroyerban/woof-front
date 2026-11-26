// Globo de diálogo del perro: muestra el mensaje que arma el backend con tus
// tareas reales (con IA si Ollama está encendido, o con frases de plantilla).
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { getMensajePerro } from "../../../API/ia";

export default function SpeechBubble({ refreshKey }: { refreshKey: string | number }) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    getMensajePerro().then((r) => {
      if (!activo) return;
      if (r?.mensaje) setMensaje(r.mensaje);
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [refreshKey]);

  if (!mensaje && !cargando) return null;

  return (
    <View className="items-center">
      <View className="bg-white rounded-2xl px-4 py-3 border-2 border-blue-200 shadow-md max-w-full">
        {mensaje ? (
          <Text className="text-blue-900 text-base text-center">{mensaje}</Text>
        ) : (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#1D4ED8" />
            <Text className="text-gray-500 ml-2">Tu perrito está pensando... 🐾</Text>
          </View>
        )}
        {mensaje && cargando && <ActivityIndicator size="small" color="#93C5FD" className="mt-1" />}
      </View>
      {/* Piquito del globo apuntando al perro */}
      <View
        style={{
          width: 0,
          height: 0,
          borderLeftWidth: 10,
          borderRightWidth: 10,
          borderTopWidth: 12,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: "#BFDBFE",
        }}
      />
    </View>
  );
}
