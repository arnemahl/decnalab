require("babel-core/register");
require("babel-polyfill");

const Game = require('./rts/Game').default;
const CliUtil = require('./util/cli');
const aiConfigs = CliUtil.canGetAiConfigs() ? CliUtil.getAiConfigs() : Array(2).fill(require('./ai/DefaultConfigDumbAI'));

function fastTest() {
    const maxLoops = 2000;
    const maxTicks = 20000;
    const game = new Game('unused-id', maxLoops, maxTicks, aiConfigs[0], aiConfigs[1]);

    const t0 = Date.now();

    // game.simulateAndStoreEveryState();
    game.simulate();

    console.log('\n--------------------------------\nFinal score:\n\n', game.finalScore, '\n--------------------------------');
    console.log(`\n\nRunning ${game.loops} loops, ${game.finalTick} ticks, OK (${Date.now() - t0}ms)`);
}

fastTest();
