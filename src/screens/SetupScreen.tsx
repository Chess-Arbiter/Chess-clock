import { useRef, useState } from "react";
import {
  LayoutAnimation,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import PlayerCard, { cardStyles } from "../components/PlayerCard";
import Stepper from "../components/Stepper";
import { presets } from "../presets";
import { colors, radius, shadow } from "../theme";
import { GameSettings, PlayerTime } from "../types";

interface Props {
  initialSettings: GameSettings;
  onStart: (settings: GameSettings) => void;
}

const isSameTime = (a: PlayerTime, b: PlayerTime) =>
  a.minutes === b.minutes && a.seconds === b.seconds && a.increment === b.increment;

const hasTime = (player: PlayerTime) => player.minutes > 0 || player.seconds > 0;

const animateLayout = () =>
  LayoutAnimation.configureNext(LayoutAnimation.create(300, "easeInEaseOut", "opacity"));

const switchColors = {
  trackColor: { false: colors.line, true: colors.primary },
  thumbColor: colors.card,
};

export default function SetupScreen({ initialSettings, onStart }: Props) {
  const [white, setWhite] = useState(initialSettings.white);
  const [black, setBlack] = useState(initialSettings.black);
  const [incrementRule, setIncrementRule] = useState(initialSettings.incrementRule);
  const [sameForBoth, setSameForBoth] = useState(isSameTime(white, black));
  const scroll = useRef<ScrollView>(null);
  const shouldRevealCards = useRef(false);

  // Small phones get a tighter layout so everything fits without scrolling
  const { width, height } = useWindowDimensions();
  const compact = height < 680;
  const gap = compact ? 8 : 12;
  const presetWidth = (Math.min(width, 480) - 32 - gap * 2) / 3;

  const setBoth = (value: PlayerTime) => {
    setWhite(value);
    setBlack(value);
  };

  const toggleSameForBoth = (same: boolean) => {
    animateLayout();

    if (same) {
      // Mirror the reveal: glide back up while the Black card folds away
      setBlack(white);
      scroll.current?.scrollTo({ y: 0, animated: true });
    } else {
      shouldRevealCards.current = true;
    }

    setSameForBoth(same);
  };

  const canStart = hasTime(white) && hasTime(black);

  return (
    <View style={styles.screen}>
      <ScrollView
        ref={scroll}
        contentContainerStyle={[styles.content, { gap, paddingTop: compact ? 12 : 16 }]}
        keyboardShouldPersistTaps="handled"
        // After switching to separate times, scroll down so both color cards are fully visible
        onContentSizeChange={() => {
          if (shouldRevealCards.current) {
            shouldRevealCards.current = false;
            scroll.current?.scrollToEnd({ animated: true });
          }
        }}
      >
        <View>
          <Text style={[styles.title, compact && styles.titleCompact]}>Chess Clock</Text>
          {!compact && <Text style={styles.subtitle}>Choose a time control</Text>}
        </View>

        <View style={[styles.presets, { gap: compact ? 6 : 8 }]}>
          {presets.map(({ category, minutes, increment }) => {
            const preset = { minutes, seconds: 0, increment };
            const isSelected = isSameTime(white, preset) && isSameTime(black, preset);

            return (
              <Pressable
                key={`${minutes}+${increment}`}
                accessibilityRole="button"
                onPress={() => {
                  if (!sameForBoth) {
                    animateLayout();
                  }
                  setBoth(preset);
                  setSameForBoth(true);
                }}
                style={({ pressed }) => [
                  styles.preset,
                  { width: presetWidth, minHeight: compact ? 46 : 56 },
                  isSelected && styles.presetSelected,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.presetTime, compact && styles.presetTimeCompact, isSelected && styles.selectedText]}
                >
                  {minutes} + {increment}
                </Text>
                <Text style={[styles.presetCategory, isSelected && styles.selectedCategory]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Custom</Text>
          <View style={styles.switchRow}>
            <Switch value={sameForBoth} onValueChange={toggleSameForBoth} {...switchColors} />
            <Text style={styles.switchLabel}>Same for both</Text>
          </View>
        </View>

        {sameForBoth ? (
          <PlayerCard title="Both players" player={white} compact={compact} onChange={setBoth} />
        ) : (
          <>
            <PlayerCard title="White" side="white" player={white} compact={compact} onChange={setWhite} />
            <PlayerCard title="Black" side="black" player={black} compact={compact} onChange={setBlack} />
          </>
        )}

        <View style={cardStyles.card}>
          <View style={styles.ruleRow}>
            <View style={styles.ruleText}>
              <Text style={styles.cardTitle}>Increment after move</Text>
              <Text style={styles.ruleHint}>
                {incrementRule.enabled
                  ? `No increment until move ${incrementRule.afterMove + 1}`
                  : "Like Armageddon: no increment early in the game"}
              </Text>
            </View>
            <Switch
              accessibilityLabel="Increment after move"
              value={incrementRule.enabled}
              onValueChange={(enabled) => {
                animateLayout();
                setIncrementRule((prev) => ({ ...prev, enabled }));
              }}
              {...switchColors}
            />
          </View>
          {incrementRule.enabled && (
            <Stepper
              label="After move"
              value={incrementRule.afterMove}
              max={200}
              compact={compact}
              onChange={(afterMove) => setIncrementRule((prev) => ({ ...prev, afterMove }))}
            />
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, compact && styles.footerCompact]}>
        <Pressable
          accessibilityRole="button"
          disabled={!canStart}
          onPress={() => onStart({ white, black: sameForBoth ? white : black, incrementRule })}
          style={({ pressed }) => [
            styles.startButton,
            compact && styles.startButtonCompact,
            !canStart && styles.startDisabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.startText}>{canStart ? "Start" : "Set a time to start"}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
  },
  titleCompact: {
    fontSize: 22,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 16,
    color: colors.muted,
  },
  presets: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  preset: {
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderRadius: 12,
    backgroundColor: colors.card,
    ...shadow,
  },
  presetSelected: {
    backgroundColor: colors.primary,
  },
  presetTime: {
    fontSize: 18,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
    color: colors.text,
  },
  presetTimeCompact: {
    fontSize: 16,
  },
  presetCategory: {
    fontSize: 12,
    color: colors.muted,
  },
  selectedText: {
    color: colors.light,
  },
  selectedCategory: {
    color: colors.light,
    opacity: 0.75,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  switchLabel: {
    fontSize: 14,
    color: colors.muted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  ruleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 6,
  },
  ruleText: {
    flexShrink: 1,
  },
  ruleHint: {
    fontSize: 13,
    color: colors.muted,
  },
  footer: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  footerCompact: {
    paddingBottom: 8,
  },
  startButton: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius,
    backgroundColor: colors.primary,
    ...shadow,
  },
  startButtonCompact: {
    height: 48,
  },
  startDisabled: {
    opacity: 0.4,
  },
  startText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.light,
  },
});
