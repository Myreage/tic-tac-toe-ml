import type { Agent, StateHash } from "./agent";
import type { QLearnAgent } from "./qLearnAgent";

export class Trainer {
  private teacherAgent: Agent;
  private studentAgent: QLearnAgent;
  private state: StateHash;
  private lastStudentAction: number | null = null;
  private lastStudentStartingBoard: string | null = null;

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

  displayBoard() {
    const board = this.state
      .split("")
      .map(Number)
      .map((cell) => {
        if (cell === 0) return ".";
        if (cell === 1) return "X";
        if (cell === 2) return "O";
        return "?"; // Unknown state
      });

    for (let i = 0; i < 3; i++) {
      console.log(board.slice(i * 3, i * 3 + 3).join(" "));
    }
    console.log("");
  }

  train(episodes: number) {
    console.log("Starting training with episodes:", episodes);
    let studentWins = 0;
    let studentLosses = 0;
    let draws = 0;
    let illegalMoves = 0;
    let gameResults = [];

    for (let episode = 0; episode < episodes; episode++) {
      console.log(`Episode ${episode + 1}/${episodes}`);
      this.studentAgent.updateExplorationRate();
      this.resetBoard();
      while (true) {
        const boardBeforeTeacherPlay = this.state;

        const teacherAction = this.teacherAgent.decideAction(this.state);
        this.applyAction(teacherAction, 1);

        const { done: doneAfterTeacher, winner: teacherWin } =
          this.checkBoardState();

        if (doneAfterTeacher) {
          if (teacherWin) {
            // Update student after loss

            studentLosses++;
            gameResults.push("loss");
            if (
              this.lastStudentAction !== null &&
              this.lastStudentStartingBoard !== null
            ) {
              this.studentAgent.updateQValue({
                action: this.lastStudentAction,
                currentState: this.lastStudentStartingBoard,
                nextState: boardBeforeTeacherPlay,
                reward: -1, // Teacher wins, student loses
              });
            }
            break;
          }
          // Update student after draw
          if (
            this.lastStudentAction !== null &&
            this.lastStudentStartingBoard !== null
          ) {
            this.studentAgent.updateQValue({
              action: this.lastStudentAction,
              currentState: this.lastStudentStartingBoard,
              nextState: boardBeforeTeacherPlay,
              reward: 0, // Draw
            });
          }

          draws++;
          gameResults.push("draw");
          break;
        }

        const boardBeforeStudentPlay = this.state;
        const studentAction = this.studentAgent.decideAction(this.state);
        const isIllegalMove = this.applyAction(studentAction, 2);
        this.lastStudentAction = studentAction;
        this.lastStudentStartingBoard = boardBeforeStudentPlay;

        if (isIllegalMove) {
          this.studentAgent.updateQValue({
            action: studentAction,
            currentState: boardBeforeStudentPlay,
            nextState: null,
            reward: -10, // Illegal penalty
          });

          illegalMoves++;
          gameResults.push("illegal");
          break;
        }

        const { done: doneAfterStudent, winner: studentWin } =
          this.checkBoardState();

        if (doneAfterStudent) {
          if (studentWin) {
            this.studentAgent.updateQValue({
              action: studentAction,
              currentState: boardBeforeStudentPlay,
              nextState: this.state,
              reward: 1, // Student wins
            });

            gameResults.push("win");
            studentWins++;
            break;
          }
          this.studentAgent.updateQValue({
            action: studentAction,
            currentState: boardBeforeStudentPlay,
            nextState: this.state,
            reward: 0,
          });

          gameResults.push("draw");
          draws++;
          break;
        }
      }
    }

    return {
      studentWins,
      studentLosses,
      draws,
      illegalMoves,
    };
  }
}
