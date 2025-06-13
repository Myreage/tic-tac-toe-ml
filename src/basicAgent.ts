import type { Agent, StateHash } from "./agent";

// A basic agent that plays tic tac toe like a human would,
// without any learning or strategy.
// As such, it will try to win and to prevent the opponent from winning
// But not use advanced strategies.
export class BasicAgent implements Agent {
  // Try to form lines, and block opponent from doing so.
  decideAction(state: StateHash) {
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

    // Check if the agent can win in the next move
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] === 1 && board[b] === 1 && board[c] === 0) {
        return c; // Win
      }
      if (board[a] === 1 && board[b] === 0 && board[c] === 1) {
        return b; // Win
      }
      if (board[a] === 0 && board[b] === 1 && board[c] === 1) {
        return a; // Win
      }
    }

    // Block opponent from winning in the next move
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] === 2 && board[b] === 2 && board[c] === 0) {
        return c; // Block
      }
      if (board[a] === 2 && board[b] === 0 && board[c] === 2) {
        return b; // Block
      }
      if (board[a] === 0 && board[b] === 2 && board[c] === 2) {
        return a; // Block
      }
    }

    // If no immediate win or block is possible, try to take a square on a row/diagonal we already have one
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] === 1 && board[b] === 0 && board[c] === 0) {
        return b; // Take a square on a row/diagonal we already have one
      }
      if (board[a] === 0 && board[b] === 1 && board[c] === 0) {
        return a; // Take a square on a row/diagonal we already have one
      }
      if (board[a] === 0 && board[b] === 0 && board[c] === 1) {
        return b; // Take a square on a row/diagonal we already have one
      }
    }
    // If no immediate win, block, or strategic move is possible, take a random square
    const availableActions = board
      .map((value, index) => (value === 0 ? index : null))
      .filter((index) => index !== null);
    if (availableActions.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableActions.length);
      return availableActions[randomIndex];
    }

    throw new Error("No available actions to perform.");
  }

  draw() {}
  lose() {}
  win() {}
}
