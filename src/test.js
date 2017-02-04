require("babel-core/register");
require("babel-polyfill");

const Game = require('./rts/Game').default;
const aiConfig = require('./ai/DefaultConfigDumbAI');

function fastTest() {
    const maxLoops = 1000;
    const game = new Game('unused-id', maxLoops, aiConfig, aiConfig);

    const t0 = Date.now();

    // game.simulateAndStoreEveryState();
    game.simulate();

    console.log('\n--------------------------------\nFinal score:\n\n', game.finalScore, '\n--------------------------------');
    console.log(`\n\nRunning ${game.loops} loops, ${game.finalTick} ticks, OK (${Date.now() - t0}ms)`);
}

fastTest();
