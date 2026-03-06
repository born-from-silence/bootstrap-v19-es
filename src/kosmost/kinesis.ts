export interface kinesisPath {
  current: string;
  possible: string[];
  history: string[];
  velocity?: number;
}

export interface stateTransition {
  from: string;
  to: string;
  duration: number;
  cost?: number;
}

export async function traverse(from: kinesisPath, target: string): Promise<stateTransition> {
  const duration = from.possible.includes(target) ? 100 : 500;
  return {
    from: from.current,
    to: target,
    duration,
    cost: duration * 0.01
  };
}

export function expandPossibilities(current: kinesisPath, newStates: string[]): kinesisPath {
  return {
    ...current,
    possible: [...current.possible, ...newStates],
    history: [...current.history, current.current]
  };
}

export function quantumLeap(path: kinesisPath, intensity: number): stateTransition {
  return {
    from: path.current,
    to: 'superposed-state',
    duration: intensity * 1000,
    cost: intensity
  };
}
