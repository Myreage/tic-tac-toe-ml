import type { Agent, StateHash } from "./agent";

// A basic agent that plays tic tac toe using a more strategic approach.
// It will try to win and prevent the opponent from winning, and also use some basic strategy.
export class BasicAgent implements Agent {
  private playerNumber: number;

  constructor(playerNumber: number) {
    this.playerNumber = playerNumber;
  }

  // Try to form lines, block opponent, and use basic strategies.
  decideAction(state: StateHash) {
    const opponentNumber = this.playerNumber === 1 ? 2 : 1;

    const board = state.split("").map(Number);
    const winningCombinations = [
      [0, 1, 2], // Row 1
      [3, 4, 5], // Row 2
      [6, 7, 8], // Row 3
      [0, 3, 6], // Column 1
      [1, 4, 7], // Column 2
      [2, 5, 8], // Column 3
      [0, 4, 8], // Diagonal \
      [2, 4, 6], // Diagonal /
    ];

    // Get available moves
    const availableActions = board
      .map((value, index) => (value === 0 ? index : null))
      .filter((index) => index !== null) as number[];

    if (availableActions.length === 0) {
      throw new Error("No available actions to perform.");
    }

    // Check if the agent can win in the next move
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        board[a] === this.playerNumber &&
        board[b] === this.playerNumber &&
        board[c] === 0
      ) {
        return c; // Win
      }
      if (
        board[a] === this.playerNumber &&
        board[b] === 0 &&
        board[c] === this.playerNumber
      ) {
        return b; // Win
      }
      if (
        board[a] === 0 &&
        board[b] === this.playerNumber &&
        board[c] === this.playerNumber
      ) {
        return a; // Win
      }
    }

    // Block opponent from winning in the next move
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        board[a] === opponentNumber &&
        board[b] === opponentNumber &&
        board[c] === 0
      ) {
        return c; // Block
      }
      if (
        board[a] === opponentNumber &&
        board[b] === 0 &&
        board[c] === opponentNumber
      ) {
        return b; // Block
      }
      if (
        board[a] === 0 &&
        board[b] === opponentNumber &&
        board[c] === opponentNumber
      ) {
        return a; // Block
      }
    }

    // Take center if available (strategic advantage)
    if (board[4] === 0) {
      return 4;
    }

    // Take corners if available - they offer more strategic value
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter((corner) => board[corner] === 0);

    if (availableCorners.length > 0) {
      return availableCorners[
        Math.floor(Math.random() * availableCorners.length)
      ];
    }

    // Create potential winning opportunities by playing on lines where we have one piece and opponent has none
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      // Check if we have one piece on this line and no opponent pieces
      const ourPieces = [board[a], board[b], board[c]].filter(
        (cell) => cell === this.playerNumber
      ).length;
      const opponentPieces = [board[a], board[b], board[c]].filter(
        (cell) => cell === opponentNumber
      ).length;

      if (ourPieces === 1 && opponentPieces === 0) {
        // Find the empty cells on this line
        const emptyCells = [a, b, c].filter((index) => board[index] === 0);
        if (emptyCells.length > 0) {
          return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
      }
    }

    // If no strategic move is found, take a random available square
    return availableActions[
      Math.floor(Math.random() * availableActions.length)
    ];
  }
}
