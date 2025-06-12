export type StateHash = string;
export type CellIndex = number;
export type Action = CellIndex;

export interface Agent {
  decideAction: (state: StateHash) => Action;
}
