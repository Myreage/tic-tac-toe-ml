import type { Agent, StateHash } from "./agent";
import type { QLearnAgent } from "./qLearnAgent";

const getRandomIntegerInclusive = (min: number, max: number) => {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);

  return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
};

export class Trainer {
  // Player 1
  private teacherAgent: Agent;

  // Player 2
  private studentAgent: QLearnAgent;

  private loggingEnabled: boolean;

  private state: StateHash;

  constructor(
    teacherAgent: Agent,
    studentAgent: QLearnAgent,
    loggingEnabled: boolean
  ) {
    this.teacherAgent = teacherAgent;
    this.studentAgent = studentAgent;
    this.loggingEnabled = loggingEnabled;
    this.state = "000000000"; // Initialize the board state to empty

    this.resetBoard();
  }

  log(content: string) {
    if (this.loggingEnabled) {
      console.log(content);
    }
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

  displayBoard() {
    const board = this.state.split("").map(Number);
    this.log(`
      ${board[0]} | ${board[1]} | ${board[2]}
      ---------
      ${board[3]} | ${board[4]} | ${board[5]}
      ---------
      ${board[6]} | ${board[7]} | ${board[8]}
    `);
  }

  train(episodes: number) {
    let gameResults: ("win" | "lose" | "draw" | "illegal")[] = [];

    for (let episode = 0; episode < episodes; episode++) {
      this.log(`Training episode ${episode + 1}/${episodes}`);

      let currentPlayer = getRandomIntegerInclusive(1, 2);

      this.studentAgent.updateExplorationRate();
      this.resetBoard();

      let lastStudentAction: number | null = null;
      let lastStudentStartingState: string | null = null;

      while (true) {
        const player =
          currentPlayer === 1 ? this.teacherAgent : this.studentAgent;

        const stateBeforeAction = this.state;

        const action = player.decideAction(this.state);

        if (currentPlayer === 2) {
          lastStudentAction = action;
          lastStudentStartingState = stateBeforeAction;
        }

        const isIllegalMove = this.applyAction(action, currentPlayer);

        this.log(`Player ${currentPlayer} chose action ${action}`);

        this.displayBoard();

        if (isIllegalMove) {
          // Illegal move from teacher, should not happen
          if (currentPlayer === 1) {
            throw new Error("Illegal move by teacher agent");
          }
          this.log("Illegal move by student agent, punishing...");

          this.studentAgent.learn({
            action,
            finalState: null,
            outcome: "illegal",
            startingState: stateBeforeAction,
          });
          gameResults.push("illegal");

          break;
        }

        const boardState = this.checkBoardState();

        if (boardState.done) {
          if (lastStudentAction === null || lastStudentStartingState === null) {
            throw new Error(
              "Last student action or starting state is undefined"
            );
          }
          if (boardState.winner === 1) {
            // Teacher did a winning move
            // The last student action was a losing move, so we punish
            this.log("Student agent lost, punishing last action...");
            gameResults.push("lose");
            this.studentAgent.learn({
              action: lastStudentAction,
              finalState: null,
              outcome: "lose",
              startingState: lastStudentStartingState,
            });

            break;
          } else if (boardState.winner === 2) {
            this.log("Student agent won, rewarding last action...");
            gameResults.push("win");
            this.studentAgent.learn({
              action: lastStudentAction,
              finalState: null,
              outcome: "win",
              startingState: lastStudentStartingState,
            });
            break;
          }

          this.log("Game ended in a draw, updating student agent...");
          gameResults.push("draw");
          this.studentAgent.learn({
            action: lastStudentAction,
            finalState: null,
            outcome: "draw",
            startingState: lastStudentStartingState,
          });

          break;
        }

        if (currentPlayer === 1) {
          // After teacher's action, we can update the student agent if we have values
          if (lastStudentAction !== null && lastStudentStartingState !== null) {
            this.studentAgent.learn({
              action: lastStudentAction,
              finalState: this.state,
              outcome: "no-effect",
              startingState: lastStudentStartingState,
            });
          }
        }

        currentPlayer = currentPlayer === 1 ? 2 : 1;
      }
    }

    console.log("Training completed");
    console.log("Results", {
      win: gameResults.filter((result) => result === "win").length,
      lose: gameResults.filter((result) => result === "lose").length,
      draw: gameResults.filter((result) => result === "draw").length,
      illegal: gameResults.filter((result) => result === "illegal").length,
    });

    const last100GamesWinrate = gameResults
      .slice(-100)
      .filter((result) => result === "win" || result === "draw").length;

    const last100GamesIllegalMoves = gameResults
      .slice(-100)
      .filter((result) => result === "illegal").length;

    const winRateEvery1000Games: number[] = gameResults.reduce(
      (acc, result, index) => {
        if (index % 1000 === 0 && index !== 0) {
          const last1000Games = gameResults.slice(index - 1000, index);
          const winRate = last1000Games.filter(
            (r) => r === "win" || r === "draw"
          ).length;
          acc.push((winRate / 1000) * 100);
        }
        return acc;
      },
      [] as number[]
    );
    console.log("Win rate every 1000 games:", winRateEvery1000Games);

    console.log(`Winrate on the 100 last games:  ${last100GamesWinrate}%`);

    console.log(
      `Illegal moves on the 100 last games: ${last100GamesIllegalMoves}%`
    );

    const finalQTable = this.studentAgent.getQTable();
    const neverSeenStates = Object.keys(finalQTable).filter(
      (state) => Object.keys(finalQTable[state]).length === 0
    );
    console.log("Never seen states:", neverSeenStates.length);
  }
}
