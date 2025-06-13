import { BasicAgent } from "./basicAgent";
import { Game } from "./game";
import { NoobAgent } from "./noobAgent";
import { QLearnAgent } from "./qLearnAgent";
import { Trainer } from "./trainer";

const agent = new QLearnAgent({
  learningRate: 0.1,
  discountFactor: 0.95,
  explorationRate: 1.0,
  explorationDecay: 0.9999,
  explorationMin: 0.05,
});

const noobTeacher = new NoobAgent();

const trainer1 = new Trainer(noobTeacher, agent, false);

console.log("Starting training against noob agent...");
trainer1.train(10000);

console.log("Training completed");

const basicTeacher = new BasicAgent(1);

const basicTrainer = new Trainer(basicTeacher, agent, false);

console.log("Starting training against basic agent...");
basicTrainer.train(10000);

console.log("Training completed");

console.log("Starting exploitation training against basic trainer...");
agent.setExploration(0, 0, 0);
basicTrainer.train(10000);

console.log("Training completed");

console.log("Play a game against the agent");
const game = new Game(agent);
while (true) {
  await game.play();
}
