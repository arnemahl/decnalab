require("babel-core/register");
require("babel-polyfill");

const runSimpleEvolution = require('./coevolution/Coevolution').runSimpleEvolution;

const t0 = Date.now();
const individual = runSimpleEvolution();

console.log(`\nBuild order\n\t` + individual.buildOrder.map(target => `${target.spec.constructor.name}: ${target.count}`).join('\n\t'));

console.log(`Running evolution, OK (${Date.now() - t0}ms)`);
