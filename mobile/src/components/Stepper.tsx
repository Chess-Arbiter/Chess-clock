import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../theme";

interface Props {
  label: string;
  value: number;
  max: number;
  compact?: boolean;
  onChange: (value: number) => void;
}

const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max);

export default function Stepper({ label, value, max, compact, onChange }: Props) {
  const size = compact ? 40 : 44;

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          disabled={value <= 0}
          onPress={() => onChange(clamp(value - 1, max))}
          style={({ pressed }) => [
            styles.button,
            { width: size, height: size },
            value <= 0 && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <TextInput
          accessibilityLabel={label}
          style={[styles.input, { height: size }]}
          value={String(value)}
          keyboardType="number-pad"
          selectTextOnFocus
          maxLength={3}
          onChangeText={(text) => onChange(clamp(Number(text.replace(/\D/g, "")), max))}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          disabled={value >= max}
          onPress={() => onChange(clamp(value + 1, max))}
          style={({ pressed }) => [
            styles.button,
            { width: size, height: size },
            value >= max && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  rowCompact: {
    paddingVertical: 2,
  },
  label: {
    fontSize: 16,
    color: colors.muted,
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  button: {
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  disabled: {
    opacity: 0.35,
  },
  pressed: {
    transform: [{ scale: 0.92 }],
  },
  buttonText: {
    fontSize: 22,
    color: colors.primary,
  },
  input: {
    width: 56,
    padding: 0,
    fontSize: 20,
    fontWeight: "600",
    fontVariant: ["tabular-nums"],
    textAlign: "center",
    color: colors.text,
  },
});
