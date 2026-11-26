import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import ModalDesglosarIA from "../../../ia/modalDesglosarIA";
import ModalCreateTaskPersonal from "./modalCreateTaskPersonal";

type NuevaTarea = { nombre: string; descripcion?: string; estado: string };

export default function CreateTaskPersonalBtn({
  onTaskCreated,
}: {
  onTaskCreated?: (payload: NuevaTarea) => Promise<void> | void;
}) {

  const [modalVisible, setModalVisible] = useState(false);
  const [modalIAVisible, setModalIAVisible] = useState(false);

  // Crea en BACKLOG las subtareas que el usuario eligió de la IA.
  const agregarDesdeIA = async (subtareas: { nombre: string; descripcion: string }[]) => {
    for (const s of subtareas) {
      await onTaskCreated?.({ nombre: s.nombre, descripcion: s.descripcion, estado: "Back Log" });
    }
    Alert.alert("¡Listo! 🐾", `Se agregaron ${subtareas.length} tareas a tu BACKLOG.`);
  };

  return (
    <>
      <View className="mt-4 mb-2 items-center gap-2">
        <TouchableOpacity
          className="bg-blue-600 rounded-2xl py-3 px-8 items-center shadow-md shadow-blue-300/30 active:scale-95 transition-all duration-150"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white font-semibold text-base tracking-wide">
            Crear Tarea Personal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-white border-2 border-blue-600 rounded-2xl py-2 px-6 items-center active:scale-95"
          onPress={() => setModalIAVisible(true)}
        >
          <Text className="text-blue-700 font-semibold text-base">🪄 Desglosar con IA</Text>
        </TouchableOpacity>
      </View>
      <ModalCreateTaskPersonal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        onCreate={onTaskCreated}
      />
      <ModalDesglosarIA
        visible={modalIAVisible}
        onClose={() => setModalIAVisible(false)}
        onAgregar={agregarDesdeIA}
      />
    </>
  );
}
