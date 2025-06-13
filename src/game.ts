import type { Agent } from "./agent";

class Game {
  private board: number[];
  private player1: Agent;
  private player2: Agent;

  resetBoard() {
    this.board = new Array(9).fill(0);
  }

  constructor({ player1, player2 }: { player1: Agent; player2: Agent }) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Array(9).fill(0);
  }

  checkWin(player: 1 | 2) {
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

    winningCombinations.forEach((combination) => {
      const [a, b, c] = combination;
      if (
        this.board[a] === player &&
        this.board[b] === player &&
        this.board[c] === player
      ) {
        return true;
      }
    });

    return false;
  }

  applyAction(action: number, player: 1 | 2) {
    this.board[action] = player;
    this.displayBoard();
    console.log(`Player ${player} played in ${action}`);
  }

  displayBoard() {
    console.log(`${this.board[0]} ${this.board[1]} ${this.board[2]}`);
    console.log(`${this.board[3]} ${this.board[4]} ${this.board[5]}`);
    console.log(`${this.board[6]} ${this.board[7]} ${this.board[8]}`);
  }

  play(startingPlayer: 1 | 2) {
    this.resetBoard();
    let currentPlayer = startingPlayer;
    let moves = 0;

    while (moves < 9) {
      const player = currentPlayer === 1 ? this.player1 : this.player2;
      const action = player.decideAction(this.board.join(","));

      this.applyAction(action, currentPlayer);

      if (this.board[action] !== 0) {
        console.log(
          `Invalid move by player ${currentPlayer} at cell ${action}`
        );
        return;
      }

      this.board[action] = currentPlayer;
      moves++;

      // Check for a win condition
      if (this.checkWin(currentPlayer)) {
        console.log(`Player ${currentPlayer} wins!`);
        return;
      }

      // Switch players
      currentPlayer = currentPlayer === 1 ? 2 : 1;
    }

    console.log("It's a draw!");
    return;
  }
}
