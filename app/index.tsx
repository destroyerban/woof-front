import { NavigationContainer, NavigationIndependentTree } from "@react-navigation/native";
import React from "react";
import { HomeRefreshProvider } from "./src/context/homeRefreshContext";
import { RealtimeProvider } from "./src/context/realtimeContext";
import { AuthProvider } from "./src/context/userContext";
import RootNavigation from "./src/navigation/rootNavigation";

// expo-router (SDK 58) ya no incluye un NavigationContainer de React Navigation,
// así que la navegación propia de la app necesita el suyo.
export default function StartScreen() {
  return (
    <AuthProvider>
      <HomeRefreshProvider>
        <RealtimeProvider>
          <NavigationIndependentTree>
            <NavigationContainer>
              <RootNavigation />
            </NavigationContainer>
          </NavigationIndependentTree>
        </RealtimeProvider>
      </HomeRefreshProvider>
    </AuthProvider>
  );
}
