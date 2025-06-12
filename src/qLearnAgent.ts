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
    currentState,
    nextState,
    reward,
  }: {
    currentState: StateHash;
    action: Action;
    reward: number;
    nextState: StateHash | null;
  }) {
    // Update the Q-value for the current state and action using the Q-learning formula
    const currentQValue = this.qTable[currentState][action];
    const maxNextQValue = nextState
      ? Math.max(...Object.values(this.qTable[nextState]))
      : 0;
    const newQValue =
      currentQValue +
      this.learningRate *
        (reward + this.discountFactor * maxNextQValue - currentQValue);
    this.qTable[currentState][action] = newQValue;

    console.log(
      `Updated Q-value for state ${currentState}, action ${action}: ${newQValue}`
    );
  }

  getQTable() {
    return this.qTable;
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

  updateExplorationRate() {
    this.explorationRate = Math.max(
      this.explorationRate * this.explorationDecay,
      this.explorationMin
    );
  }
}
