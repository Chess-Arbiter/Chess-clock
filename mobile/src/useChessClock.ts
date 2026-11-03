import { useCallback, useEffect, useRef, useState } from "react";
import { GameSettings, PlayerTime, Side } from "./types";

const toMs = ({ minutes, seconds }: PlayerTime) => (minutes * 60 + seconds) * 1000;

const other = (side: Side): Side => (side === "white" ? "black" : "white");

interface ClockState {
  remaining: Record<Side, number>;
  moves: Record<Side, number>;
  active: Side;
  isRunning: boolean;
  isOver: boolean;
}

const initialState = (settings: GameSettings): ClockState => ({
  remaining: { white: toMs(settings.white), black: toMs(settings.black) },
  moves: { white: 0, black: 0 },
  active: "white",
  isRunning: false,
  isOver: false,
});

export function useChessClock(settings: GameSettings) {
  const [state, setState] = useState(() => initialState(settings));
  const lastTick = useRef(0);

  // Count down against the real clock so time stays exact even if a frame is late
  useEffect(() => {
    if (!state.isRunning) {
      return;
    }

    lastTick.current = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - lastTick.current;
      lastTick.current = now;

      setState((prev) => {
        const left = Math.max(0, prev.remaining[prev.active] - elapsed);

        return {
          ...prev,
          remaining: { ...prev.remaining, [prev.active]: left },
          isRunning: left > 0,
          isOver: left === 0,
        };
      });
    }, 100);

    return () => clearInterval(timer);
  }, [state.isRunning]);

  // The player to move taps their own timer to finish the move
  const finishMove = useCallback(() => {
    setState((prev) => {
      if (prev.isOver) {
        return prev;
      }

      if (!prev.isRunning) {
        return { ...prev, active: other(prev.active) };
      }

      const side = prev.active;
      const moveNumber = prev.moves[side] + 1;
      const { incrementRule } = settings;
      // With the delayed rule on, moves up to and including `afterMove` get no increment
      const earnsIncrement = !incrementRule.enabled || moveNumber > incrementRule.afterMove;
      const bonus = earnsIncrement ? settings[side].increment * 1000 : 0;

      // Charge the time used since the last tick before switching sides
      const now = Date.now();
      const left = Math.max(0, prev.remaining[side] - (now - lastTick.current));
      lastTick.current = now;

      return {
        ...prev,
        remaining: { ...prev.remaining, [side]: left + bonus },
        moves: { ...prev.moves, [side]: moveNumber },
        active: other(side),
      };
    });
  }, [settings]);

  const toggleRunning = useCallback(() => {
    setState((prev) => (prev.isOver ? prev : { ...prev, isRunning: !prev.isRunning }));
  }, []);

  const restart = useCallback(() => setState(initialState(settings)), [settings]);

  return { ...state, finishMove, toggleRunning, restart };
}

/** Whole seconds left, rounded up so the clock shows 00:00 only when time is really gone */
export function formatTime(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
