require("babel-core/register");
require("babel-polyfill");

const Game = require('./rts/Game').default;
const aiConfig = require('./ai/DefaultConfigDumbAI');

const nofGames = process.argv[2];
const process_t0 = Date.now()
let i = 0, t0, game;

while (i++ < nofGames) {
    t0 = Date.now();

    game = new Game('unused-id', 1000, aiConfig, aiConfig);

    game.simulate();

    console.log(`Game ${i}/${nofGames}\tSimulated ${game.loops} loops in ${Date.now() - t0} ms`);
}

console.log(`\nSimulated ${nofGames} games in ${Date.now() - process_t0} ms`);
