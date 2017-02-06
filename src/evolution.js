require("babel-core/register");
require("babel-polyfill");

const runCoevolution = require('./coevolution/Coevolution').runCoevolution;
const FileWriter = require('./rts/FileWriter');

const t0 = Date.now();
const finalGeneration = runCoevolution();
console.log(`Evolution complete (${Date.now() - t0}ms)`);
console.log(`\nUnique solutions:`, finalGeneration.length);
finalGeneration.forEach((individual, index) => {
    console.log(`\nBuild order (${index})\n\t` + individual.genome.buildOrder.map(target => `${target.specName}: ${target.addCount}`).join('\n\t'));
});

const fileName = process.argv[2];

if (fileName) {
    FileWriter.writeConfigToJS(`${fileName}.js`, finalGeneration.map(x => x.genome));
}
