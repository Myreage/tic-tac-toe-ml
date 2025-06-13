export type StateHash = string;
export type CellIndex = number;
export type Action = CellIndex;

export interface Agent {
  decideAction: (state: StateHash) => Action;
  win: (finalState: StateHash) => void;
  lose: (finalState: StateHash) => void;
  draw: (finalState: StateHash) => void;
}
