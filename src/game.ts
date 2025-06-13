import { Agent } from "./agent";
import { QLearnAgent } from "./qLearnAgent";
import rl from "readline";

function askQuestion(query: string): Promise<string> {
  const readline = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    readline.question(query, (ans) => {
      readline.close();
      resolve(ans);
    })
  );
}

// Handles a game loop. Player 1 is a human player, and Player 2 is a Q-learning agent.
export class Game {
  private board: number[];
  private agent: Agent;

  constructor(agent: Agent) {
    this.board = Array(9).fill(0); // Initialize the board to empty
    this.agent = agent;
  }
  public async play() {
    this.resetBoard();
    let currentPlayer = Math.random() < 0.5 ? 1 : 2; // Randomly choose starting player
    let moves = 0;

    while (moves < 9) {
      this.printBoard();
      if (currentPlayer === 1) {
        const action = await this.getHumanMove();
        if (this.applyAction(action, currentPlayer) === 1) {
          console.log("Illegal move, try again.");
          continue;
        }
      } else {
        const action = this.agent.decideAction(this.board.join(""));
        console.log(`Player ${currentPlayer} (AI) chooses action: ${action}`);
        this.applyAction(action, currentPlayer);
      }

      if (this.checkWin(currentPlayer)) {
        this.printBoard();
        console.log(`Player ${currentPlayer} wins!`);
        return;
      }

      currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch players
      moves++;
    }

    this.printBoard();
    console.log("It's a draw!");
  }
  private printBoard() {
    console.log("Current board:");
    for (let i = 0; i < 3; i++) {
      const row = this.board
        .slice(i * 3, i * 3 + 3)
        .map((cell) => (cell === 0 ? "." : cell === 1 ? "X" : "O"))
        .join(" ");
      console.log(row);
    }
    console.log("\n");
  }

  private async getHumanMove(): Promise<number> {
    const input = await askQuestion("Enter your move (0-8): ");

    const action = parseInt(input, 10);
    return action;
  }

  private applyAction(action: number, player: number): number {
    if (this.board[action] !== 0) {
      return 1; // Illegal move, square already filled
    }
    this.board[action] = player;
    return 0; // Move applied successfully
  }
  private checkWin(player: number): boolean {
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

    return winningCombinations.some((combination) => {
      const [a, b, c] = combination;
      return (
        this.board[a] === player &&
        this.board[b] === player &&
        this.board[c] === player
      );
    });
  }
  public resetBoard() {
    this.board = Array(9).fill(0); // Reset the board to empty state
  }
}
