import { Action, Agent, StateHash } from "./agent";

const isWinning = (state: StateHash, playerNumber: number): boolean => {
  const board = state.split("").map(Number);
  // Check rows, columns, and diagonals for a win
  const winPatterns = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Column 1
    [1, 4, 7], // Column 2
    [2, 5, 8], // Column 3
    [0, 4, 8], // Diagonal \
    [2, 4, 6], // Diagonal /
  ];
  return winPatterns.some((pattern) =>
    pattern.every((index) => board[index] === playerNumber)
  );
};

// It's the number of positions where they only need one more move to win
const numberOfWinningPositions = (
  state: StateHash,
  playerNumber: number
): number => {
  const board = state.split("").map(Number);
  // Check rows, columns, and diagonals for a win
  const winPatterns = [
    [0, 1, 2], // Row 1
    [3, 4, 5], // Row 2
    [6, 7, 8], // Row 3
    [0, 3, 6], // Column 1
    [1, 4, 7], // Column 2
    [2, 5, 8], // Column 3
    [0, 4, 8], // Diagonal \
    [2, 4, 6], // Diagonal /
  ];

  return winPatterns.filter((pattern) => {
    const playerCells = pattern.filter(
      (index) => board[index] === playerNumber
    );
    const emptyCells = pattern.filter((index) => board[index] === 0);
    return playerCells.length === 2 && emptyCells.length === 1;
  }).length;
};

export class PerfectAgent implements Agent {
  private playerNumber: number;

  constructor(playerNumber: number) {
    this.playerNumber = playerNumber;
  }

  getBoardValue(state: StateHash): number {
    if (isWinning(state, this.playerNumber)) {
      return 10; // Win
    }
    if (isWinning(state, this.playerNumber === 1 ? 2 : 1)) {
      return -10; // Loss
    }
    if (state.split("").every((cell) => cell !== "0")) {
      return 5; // Draw
    }

    return 0; // Game not finished
  }

  getActionValue(
    state: StateHash,
    action: Action,
    playerNumber: number
  ): number {
    const board = state.split("").map(Number);

    const newState = board
      .map((cell, index) => (index === action ? playerNumber : Number(cell)))
      .join("");

    const boardValue = this.getBoardValue(newState);

    if (boardValue === 0) {
      const newPossibleActions = newState
        .split("")
        .map(Number)
        .map((cell, index) => (cell === 0 ? index : null))
        .filter((index) => index !== null);

      const newPossibleActionsValues = newPossibleActions.map((newAction) => {
        return this.getActionValue(
          newState,
          newAction,
          playerNumber === 1 ? 2 : 1
        );
      });

      if (playerNumber === this.playerNumber) {
        return Math.min(...newPossibleActionsValues);
      }

      return Math.max(...newPossibleActionsValues);
    }

    return boardValue;
  }

  decideAction(state: StateHash): Action {
    const board = state.split("").map(Number);

    const possibleActions = board
      .map((cell, index) => (cell === 0 ? index : null))
      .filter((index) => index !== null);

    if (possibleActions.length === 0) {
      throw new Error("No possible actions available, the board is full.");
    }

    const actionValues = possibleActions.map((action) => {
      return {
        action,
        value: this.getActionValue(state, action, this.playerNumber),
      };
    });

    return [...actionValues].sort((a, b) => b.value - a.value)[0].action;
  }
}
