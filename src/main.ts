import { BasicAgent } from "./basicAgent";
import { QLearnAgent } from "./qLearnAgent";
import { Trainer } from "./trainer";

let gamesCounter = 0;
let aiWins = 0;
let aiDraws = 0;
let aiLosses = 0;
let aiIllegalMoves = 0;
const boardState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let playerTurn = 1;
let lastAgentAction: number | null = null;
let lastBoardState: number[] | null = null;

const fillSquare = (index: number, player: number) => {
  boardState[index] = player;
  console.log(`Player ${player} filled square ${index}`);
};

const updatePlayerTurnDisplay = () => {
  const playerTurnDisplay = document.getElementById("player-turn");
  if (playerTurnDisplay) {
    playerTurnDisplay.textContent = `Current Player: ${playerTurn}`;
  }
};

const documentSquares = document.querySelectorAll(".square");
documentSquares.forEach((square, index) => {
  square.addEventListener("click", () => {
    const player = boardState.filter((x) => x !== 0).length % 2 === 0 ? 1 : 2;
    fillSquare(index, player);
    refreshBoard();
  });
});

const refreshBoard = () => {
  documentSquares.forEach((square, index) => {
    square.textContent =
      boardState[index] === 1 ? "X" : boardState[index] === 2 ? "O" : "";
  });
  console.log("Board refreshed");
};

const resetBoard = () => {
  boardState.fill(0);
  documentSquares.forEach((square) => {
    square.textContent = "";
  });
  playerTurn = 1;
  lastBoardState = null;
  lastAgentAction = null;
  updatePlayerTurnDisplay();
  console.log("Game reset");
};

const resetButton = document.getElementById("reset-button");
resetButton?.addEventListener("click", () => {
  resetBoard();
});

updatePlayerTurnDisplay();

const qLearnAgent = new QLearnAgent({
  learningRate: 0.001,
  discountFactor: 0.9,
  explorationRate: 0.5,
  explorationDecay: 0.99,
  explorationMin: 0.1,
});

const playAgentTurn = () => {
  lastBoardState = [...boardState];
  console.log("Agent's turn");
  const stateHash = boardState.join("");
  console.log("Current state hash:", stateHash);
  const action = qLearnAgent.decideAction(stateHash);
  lastAgentAction = action;
  console.log("Agent decided action:", action);
  fillSquare(action, 2);
  refreshBoard();
  playerTurn = 1;
};

const signalIllegalMove = () => {
  aiIllegalMoves++;
  updateAIScoreDisplay();
  console.log("Illegal move signaled");

  if (lastAgentAction === null || lastBoardState === null) {
    console.error("No last action or board state to update Q-value.");
    return;
  }
  qLearnAgent.updateQValue({
    action: lastAgentAction,
    currentState: lastBoardState.join(""),
    nextState: boardState.join(""),
    reward: -10, // Penalty for illegal move
  });
};

const signalWin = () => {
  aiLosses++;
  updateAIScoreDisplay();
  console.log("Win signaled");
  if (lastAgentAction === null || lastBoardState === null) {
    console.error("No last action or board state to update Q-value.");
    return;
  }
  qLearnAgent.updateQValue({
    action: lastAgentAction,
    currentState: lastBoardState.join(""),
    nextState: boardState.join(""),
    reward: -1, // Reward for losing
  });
};

const winButton = document.getElementById("win-button");
winButton?.addEventListener("click", () => {
  signalWin();
  resetBoard();
  gamesCounter++;
  updateGamesCounterDisplay();
});

const signalLose = () => {
  aiWins++;
  updateAIScoreDisplay();
  console.log("Loss signaled");
  if (lastAgentAction === null || lastBoardState === null) {
    console.error("No last action or board state to update Q-value.");
    return;
  }
  qLearnAgent.updateQValue({
    action: lastAgentAction,
    currentState: lastBoardState.join(""),
    nextState: boardState.join(""),
    reward: 1, // Reward for winning
  });
};
const loseButton = document.getElementById("lost-button");
loseButton?.addEventListener("click", () => {
  signalLose();
  resetBoard();
  gamesCounter++;
  updateGamesCounterDisplay();
});

const signalDraw = () => {
  aiDraws++;
  updateAIScoreDisplay();
  console.log("Draw signaled");
  if (lastAgentAction === null || lastBoardState === null) {
    console.error("No last action or board state to update Q-value.");
    return;
  }
  qLearnAgent.updateQValue({
    action: lastAgentAction,
    currentState: lastBoardState.join(""),
    nextState: boardState.join(""),
    reward: 0, // Reward for draw
  });
};
const drawButton = document.getElementById("draw-button");
drawButton?.addEventListener("click", () => {
  signalDraw();
  resetBoard();
  gamesCounter++;
  updateGamesCounterDisplay();
});

const illegalButton = document.getElementById("illegal-button");
illegalButton?.addEventListener("click", () => {
  signalIllegalMove();
  resetBoard();
  gamesCounter++;
  updateGamesCounterDisplay();
});

const nextButton = document.getElementById("next-button");
nextButton?.addEventListener("click", () => {
  playerTurn = 2;
  updatePlayerTurnDisplay();
  playAgentTurn();
});

const gamesCounterDisplay = document.getElementById("games-counter");
if (gamesCounterDisplay) {
  gamesCounterDisplay.textContent = `Games Played: ${gamesCounter}`;
}
const updateGamesCounterDisplay = () => {
  if (gamesCounterDisplay) {
    gamesCounterDisplay.textContent = `Games Played: ${gamesCounter}`;
  }
};
updateGamesCounterDisplay();

const doRandomAuthorizedAction = () => {
  const availableActions = boardState
    .map((value, index) => (value === 0 ? index : null))
    .filter((index) => index !== null);
  if (availableActions.length === 0) {
    console.log("No available actions to perform.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * availableActions.length);
  const action = availableActions[randomIndex];
  fillSquare(action, 1);
};

const checkEnd = () => {
  // Check is an illegal move was made using lastBoardState
  if (lastBoardState && lastAgentAction !== null) {
    if (lastBoardState[lastAgentAction] !== 0) {
      return -1;
    }
  }

  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const combination of winningCombinations) {
    const [a, b, c] = combination;
    if (
      boardState[a] !== 0 &&
      boardState[a] === boardState[b] &&
      boardState[a] === boardState[c]
    ) {
      console.log(`Player ${boardState[a]} wins!`);
      return boardState[a];
    }
  }
  if (boardState.every((value) => value !== 0)) {
    console.log("It's a draw!");
    return 0;
  }

  return null;
};

const autoTrainingProgressDisplay = document.getElementById(
  "auto-training-progress"
);

const updateAutoTrainingProgressDisplay = (progress: string) => {
  if (autoTrainingProgressDisplay) {
    autoTrainingProgressDisplay.textContent = `Auto-training progress: ${progress}`;
  }
};

const autoTrain = (numberOfGames: number) => {
  const teacher = new BasicAgent();

  const trainer = new Trainer(teacher, qLearnAgent);

  const { draws, illegalMoves, studentLosses, studentWins } =
    trainer.train(numberOfGames);

  console.log({
    draws,
    illegalMoves,
    studentLosses,
    studentWins,
    winrate: ((studentWins + draws) / numberOfGames) * 100,
  });
};

const autoTrainButton = document.getElementById("auto-train-button");
autoTrainButton?.addEventListener("click", async () => {
  autoTrain(10000);
});

const aiScoreDisplay = document.getElementById("ai-score");

const updateAIExplorationRateDisplay = () => {
  const aiExplorationRateDisplay = document.getElementById(
    "ai-exploration-rate"
  );
  if (aiExplorationRateDisplay) {
    aiExplorationRateDisplay.textContent = `AI Exploration Rate: ${qLearnAgent
      .getExplorationRate()
      .toFixed(2)}`;
  }
};
updateAIExplorationRateDisplay();

const updateAIScoreDisplay = () => {
  if (aiScoreDisplay) {
    aiScoreDisplay.textContent = `AI Wins: ${aiWins}, Draws: ${aiDraws}, Losses: ${aiLosses}, Illegal Moves: ${aiIllegalMoves}, 10g_winrate: ${
      ((aiWins + aiDraws) / gamesCounter) * 100
    }%, 10g_illegal: ${(aiIllegalMoves / gamesCounter) * 100}%`;
  }
};
updateAIScoreDisplay();
