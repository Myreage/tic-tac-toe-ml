import type { Agent, StateHash } from "./agent";
import type { QLearnAgent } from "./qLearnAgent";

const getRandomIntegerInclusive = (min: number, max: number) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);

  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

export class Trainer {
  private teacherAgent: Agent;
  private studentAgent: QLearnAgent;
  private state: StateHash;

  constructor(teacherAgent: Agent, studentAgent: QLearnAgent) {
    this.teacherAgent = teacherAgent;
    this.studentAgent = studentAgent;
    this.state = "000000000"; // Initialize the board state to empty

    this.resetBoard();
  }

  applyAction(action: number, player: number) {
    const board = this.state.split("").map(Number);
    if (board[action] !== 0) {
      return 1; // Illegal move, square already filled
    }
    board[action] = player;
    this.state = board.join("");
  }

  resetBoard() {
    this.state = "000000000"; // Reset the board to empty state
  }

  checkBoardState() {
    const board = this.state.split("").map(Number);
    // Check for a win or draw
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

    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], done: true };
      }
    }

    if (board.every((cell) => cell !== 0)) {
      return { winner: null, done: true }; // Draw
    }

    return { winner: null, done: false }; // Game continues
  }

  train(episodes: number) {
    for (let episode = 0; episode < episodes; episode++) {
      let currentPlayer = getRandomIntegerInclusive(1, 2);
      this.studentAgent.updateExplorationRate();
      this.resetBoard();

      while (true) {
        const player =
          currentPlayer === 1 ? this.teacherAgent : this.studentAgent;

        const action = player.decideAction(this.state);

        const isIllegalMove = this.applyAction(action, currentPlayer);

        if (isIllegalMove) {
          // learn
        }

        const boardState = this.checkBoardState();

        if (boardState.done) {
          if (boardState.winner === 1) {
            // student lost
            break;
          } else if (boardState.winner === 2) {
            //student won
            break;
          }
          // draw
          break;
        }
      }
    }
  }
}
