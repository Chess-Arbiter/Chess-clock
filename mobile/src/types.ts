export type Side = "white" | "black";

export interface PlayerTime {
  minutes: number;
  seconds: number;
  /** Seconds added after each move */
  increment: number;
}

/** Armageddon-style delayed increment: no increment until a player has made more than `afterMove` moves */
export interface IncrementRule {
  enabled: boolean;
  afterMove: number;
}

export interface GameSettings {
  white: PlayerTime;
  black: PlayerTime;
  incrementRule: IncrementRule;
}
