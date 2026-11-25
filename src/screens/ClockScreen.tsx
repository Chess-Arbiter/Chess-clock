import { useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme";
import { GameSettings, Side } from "../types";
import { formatTime, useChessClock } from "../useChessClock";

interface Props {
  settings: GameSettings;
  onOpenSettings: () => void;
}

interface TimerProps {
  side: Side;
  ms: number;
  isActive: boolean;
  onPress: () => void;
}

function Timer({ side, ms, isActive, onPress }: TimerProps) {
  const { width } = useWindowDimensions();
  const [height, setHeight] = useState(0);
  const text = formatTime(ms);
  // As large as fits the timer: limited by width, or by height on short screens
  const fontSize = Math.min(width * (text.length > 5 ? 0.3 : 0.38), height * 0.6 || Infinity);

  return (
    <Pressable
      // Only the player to move can end their move
      disabled={!isActive}
      onPress={onPress}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      style={[styles.timer, side === "black" && styles.timerBlack]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.digits,
          { fontSize },
          side === "black" && styles.digitsBlack,
          // White sits across the board, so its time faces the other way
          side === "white" && styles.flipped,
        ]}
      >
        {text}
      </Text>
      {/* Gold frame marks whose move it is; drawn on top so nothing shifts */}
      {isActive && <View pointerEvents="none" style={styles.activeFrame} />}
    </Pressable>
  );
}

function IconButton({ name, label, onPress }: { name: keyof typeof MaterialIcons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
    >
      <MaterialIcons name={name} size={24} color={colors.light} />
    </Pressable>
  );
}

export default function ClockScreen({ settings, onOpenSettings }: Props) {
  const clock = useChessClock(settings);

  return (
    <View style={styles.screen}>
      <Timer side="white" ms={clock.remaining.white} isActive={clock.active === "white"} onPress={clock.finishMove} />

      <View style={styles.controls}>
        {!clock.isRunning && <IconButton name="replay" label="Restart" onPress={clock.restart} />}
        <IconButton
          name={clock.isRunning ? "pause" : "play-arrow"}
          label={clock.isRunning ? "Pause" : "Play"}
          onPress={clock.toggleRunning}
        />
        {!clock.isRunning && <IconButton name="settings" label="Settings" onPress={onOpenSettings} />}
      </View>

      <Timer side="black" ms={clock.remaining.black} isActive={clock.active === "black"} onPress={clock.finishMove} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  timer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  timerBlack: {
    backgroundColor: colors.primary,
  },
  activeFrame: {
    ...StyleSheet.absoluteFill,
    borderWidth: 6,
    borderColor: colors.gold,
  },
  digits: {
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    letterSpacing: -2,
    includeFontPadding: false,
    color: colors.text,
  },
  digitsBlack: {
    color: colors.light,
  },
  flipped: {
    transform: [{ rotate: "180deg" }],
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 16,
    padding: 16,
  },
  iconButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
});
