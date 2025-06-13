import { Agent } from "./agent";

export class NoobAgent implements Agent {
  // Randomly selects an available action
  decideAction(state: string): number {
    const board = state.split("").map(Number);
    const availableActions = board
      .map((value, index) => (value === 0 ? index : null))
      .filter((index) => index !== null) as number[];

    if (availableActions.length === 0) {
      throw new Error("No available actions to perform.");
    }

    // Select a random action from the available actions
    const randomIndex = Math.floor(Math.random() * availableActions.length);
    return availableActions[randomIndex];
  }
}
