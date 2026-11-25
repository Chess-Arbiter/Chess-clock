import { StyleSheet, Text, View } from "react-native";
import { PlayerTime, Side } from "../types";
import { colors, radius, shadow } from "../theme";
import Stepper from "./Stepper";

interface Props {
  title: string;
  side?: Side;
  player: PlayerTime;
  compact?: boolean;
  onChange: (value: PlayerTime) => void;
}

export default function PlayerCard({ title, side, player, compact, onChange }: Props) {
  return (
    <View style={styles.card}>
      <View style={[styles.titleRow, compact && styles.titleRowCompact]}>
        {side && <View style={[styles.dot, side === "black" && styles.dotBlack]} />}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Stepper
        label="Minutes"
        value={player.minutes}
        max={180}
        compact={compact}
        onChange={(minutes) => onChange({ ...player, minutes })}
      />
      <Stepper
        label="Seconds"
        value={player.seconds}
        max={59}
        compact={compact}
        onChange={(seconds) => onChange({ ...player, seconds })}
      />
      <Stepper
        label="Increment (sec)"
        value={player.increment}
        max={60}
        compact={compact}
        onChange={(increment) => onChange({ ...player, increment })}
      />
    </View>
  );
}

export const cardStyles = StyleSheet.create({
  card: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: radius,
    backgroundColor: colors.card,
    ...shadow,
  },
});

const styles = StyleSheet.create({
  card: cardStyles.card,
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
  },
  titleRowCompact: {
    paddingVertical: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dotBlack: {
    backgroundColor: colors.primary,
  },
});
