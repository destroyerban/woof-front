// src/context/realtimeContext.tsx
// Tiempo real de WOOF: mantiene una conexión Socket.IO con el backend mientras
// hay sesión iniciada. Cuando otro integrante cambia algo, el backend avisa y
// aquí se "sube la versión" del HomeRefreshContext para que las pantallas
// abiertas vuelvan a cargar sus datos.
import React, { ReactNode, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { BASE_URL } from "../utils/constans.jsx";
import { useHomeRefresh } from "./homeRefreshContext";
import { AuthContext } from "./userContext";

const RealtimeContext = React.createContext<{ connected: boolean }>({ connected: false });

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const { auth } = useContext(AuthContext);
  const { bumpTasks, bumpProjects } = useHomeRefresh();
  const [connected, setConnected] = useState(false);
  const token: string | undefined = auth?.token;

  useEffect(() => {
    if (!token) return;

    const socket = io(BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    let firstConnect = true;
    socket.on("connect", () => {
      setConnected(true);
      // Al reconectar (por ejemplo, tras perder el WiFi) se recarga todo,
      // por si hubo cambios mientras no había conexión.
      if (!firstConnect) {
        bumpTasks();
        bumpProjects();
      }
      firstConnect = false;
    });
    socket.on("disconnect", () => setConnected(false));

    socket.on("tareas:cambio", () => bumpTasks());
    socket.on("proyectos:cambio", () => {
      bumpProjects();
      bumpTasks();
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      setConnected(false);
    };
    // bumpTasks/bumpProjects cambian en cada render del provider; basta con el token.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <RealtimeContext.Provider value={{ connected }}>{children}</RealtimeContext.Provider>;
}

export function useRealtime() {
  return useContext(RealtimeContext);
}
