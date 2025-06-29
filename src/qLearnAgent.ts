import type { Action, Agent, StateHash } from "./agent";

/**
 * Class that represents an AI agent that plays and learns to play tic-tac-toe using Q-learning.
 */
export class QLearnAgent implements Agent {
  private qTable: Record<StateHash, Record<Action, number>>;
  private learningRate: number;
  private discountFactor: number;
  private explorationRate: number;
  private explorationDecay: number;
  private explorationMin: number;

  initQTable() {
    // Initialize the Q-table with zeros for all possible states and actions
    for (let i = 0; i < 3 ** 9; i++) {
      const stateHash = i.toString(3).padStart(9, "0");
      this.qTable[stateHash] = {};
      for (let action = 0; action < 9; action++) {
        this.qTable[stateHash][action] = 0;
      }
    }
  }

  constructor({
    learningRate,
    discountFactor,
    explorationRate,
    explorationDecay,
    explorationMin,
  }: {
    learningRate: number;
    discountFactor: number;
    explorationRate: number;
    explorationDecay: number;
    explorationMin: number;
  }) {
    this.learningRate = learningRate;
    this.discountFactor = discountFactor;
    this.explorationRate = explorationRate;
    this.explorationDecay = explorationDecay;
    this.explorationMin = explorationMin;
    this.qTable = {};

    this.initQTable();
  }

  getExplorationRate() {
    return this.explorationRate;
  }

  updateQValue({
    action,
    state,
    resultingState,
    reward,
  }: {
    state: StateHash;
    action: Action;
    resultingState: StateHash | null;
    reward: number;
  }) {
    // Update the Q-value for the current state and action using the Q-learning formula
    const qValueToUpdate = this.qTable[state][action];

    const maxResultingQValue = resultingState
      ? Math.max(...Object.values(this.qTable[resultingState]))
      : 0;

    const newQValue =
      qValueToUpdate +
      this.learningRate *
        (reward + this.discountFactor * maxResultingQValue - qValueToUpdate);
    this.qTable[state][action] = newQValue;
  }

  getQTable() {
    return this.qTable;
  }

  learn({
    action,
    finalState,
    outcome,
    startingState,
  }: {
    startingState: StateHash;
    finalState: StateHash | null;
    action: Action;
    outcome: "no-effect" | "win" | "lose" | "illegal" | "draw";
  }) {
    const rewards = {
      "no-effect": 0.1,
      win: 1,
      lose: -1,
      illegal: -10,
      draw: 0.5,
    };

    this.updateQValue({
      action,
      resultingState: finalState,
      reward: rewards[outcome],
      state: startingState,
    });
  }

  decideAction(state: StateHash): Action {
    if (Math.random() < this.explorationRate) {
      // Explore
      return Math.floor(Math.random() * 9);
    } else {
      // Exploit
      const actions = Object.keys(this.qTable[state]);
      const maxQValue = Math.max(
        ...actions.map((action) => this.qTable[state][Number(action)])
      );
      const bestActions = actions
        .filter((action) => this.qTable[state][Number(action)] === maxQValue)
        .map(Number);
      return bestActions[Math.floor(Math.random() * bestActions.length)];
    }
  }

  setExploration(rate: number, decay: number, min: number) {
    this.explorationRate = rate;
    this.explorationDecay = decay;
    this.explorationMin = min;
  }

  updateExplorationRate() {
    this.explorationRate = Math.max(
      this.explorationRate * this.explorationDecay,
      this.explorationMin
    );
  }
}
