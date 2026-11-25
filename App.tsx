import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { useKeepAwake } from "expo-keep-awake";
import { NavigationBar } from "expo-navigation-bar";
import { BackHandler, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import ClockScreen from "./src/screens/ClockScreen";
import SetupScreen from "./src/screens/SetupScreen";
import { loadSettings, saveSettings } from "./src/storage";
import { colors } from "./src/theme";
import { GameSettings } from "./src/types";

function Screen() {
  const { bottom } = useSafeAreaInsets();
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [isSetupOpen, setIsSetupOpen] = useState(true);

  // Android back button on the clock returns to the settings instead of closing the app
  useEffect(() => {
    if (isSetupOpen) {
      return;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      setIsSetupOpen(true);

      return true;
    });

    return () => subscription.remove();
  }, [isSetupOpen]);

  const startGame = (next: GameSettings) => {
    saveSettings(next);
    setSettings(next);
    setIsSetupOpen(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      {/* Light buttons on a dark strip stay readable whatever the screen shows above them */}
      <NavigationBar style="light" />
      {isSetupOpen ? (
        <SetupScreen initialSettings={settings} onStart={startGame} />
      ) : (
        <ClockScreen settings={settings} onOpenSettings={() => setIsSetupOpen(true)} />
      )}
      {/* Sits behind the system navigation bar so the screen never goes under its buttons */}
      <View style={[styles.navigationBarStrip, { height: bottom }]} />
    </SafeAreaView>
  );
}

export default function App() {
  // The screen must not dim or lock in the middle of a game
  useKeepAwake();

  return (
    <SafeAreaProvider>
      <Screen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  navigationBarStrip: {
    backgroundColor: colors.primary,
  },
});
