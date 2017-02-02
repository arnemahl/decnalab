require("babel-core/register");
require("babel-polyfill");

const simulateGame = require('./Simulation').simulateGame;

function test() {
    const loops = 1000;

    const t0 = Date.now();

    simulateGame(loops)
    .then(() => {
        console.log(`Running ${loops} loops, OK (${Date.now() - t0}ms)`);
    })
    .catch((error) => {
        console.log(`Running ${loops} loops FAILED`, error);
        process.exit();
    });
}
test();
