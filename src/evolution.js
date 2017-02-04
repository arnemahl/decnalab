require("babel-core/register");
require("babel-polyfill");

const runSimpleEvolution = require('./coevolution/Coevolution').runSimpleEvolution;

const t0 = Date.now();
runSimpleEvolution();
console.log(`Running evolution, OK (${Date.now() - t0}ms)`);
