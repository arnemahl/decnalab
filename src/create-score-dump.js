require("babel-core/register");
require("babel-polyfill");

const Game = require('./rts/Game').default;
const CliUtil = require('./util/cli');
const FileWriter = require('./rts/FileWriter');

const fileName = process.argv[2];
const fileName2 = process.argv[3];

if (fileName) {
    const aiConfigs = CliUtil.getAiConfigs(fileName, fileName2);

    const game = new Game('unused-id', 1000, aiConfigs[0], aiConfigs[1]);
    game.simulateAndStoreEveryState();

    FileWriter.writeJSON(`score/${fileName}${!fileName2 ? '' : `-vs-${fileName2}`}.json`, game.finalScore);

} else {
    console.log('Please provide file name');
}
