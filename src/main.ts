import { BasicAgent } from "./basicAgent";
import { PerfectAgent } from "./perfectAgent";
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

agent.setExploration(0, 0, 0);
console.log("Starting exploitation training against basic agent...");
basicTrainer.train(10000);
console.log("Exploitation training completed");

console.log("Play a game against the agent");

const perfectTeacher = new PerfectAgent(1);

const game = new Game(perfectTeacher);
while (true) {
  await game.play();
}
