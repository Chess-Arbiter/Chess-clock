import Storage from "expo-sqlite/kv-store";
import { GameSettings, IncrementRule, PlayerTime } from "./types";

const emptyTime: PlayerTime = { minutes: 0, seconds: 0, increment: 0 };
const defaultRule: IncrementRule = { enabled: false, afterMove: 40 };

function read<T>(key: string, fallback: T): T {
  try {
    const value = Storage.getItemSync(key);

    return value ? { ...fallback, ...JSON.parse(value) } : fallback;
  } catch {
    return fallback;
  }
}

// Same keys as the web version
export function loadSettings(): GameSettings {
  return {
    white: read("player1", emptyTime),
    black: read("player2", emptyTime),
    incrementRule: read("incrementRule", defaultRule),
  };
}

export function saveSettings({ white, black, incrementRule }: GameSettings) {
  Storage.setItemSync("player1", JSON.stringify(white));
  Storage.setItemSync("player2", JSON.stringify(black));
  Storage.setItemSync("incrementRule", JSON.stringify(incrementRule));
}
