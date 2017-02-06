require("babel-core/register");
require("babel-polyfill");

const runCoevolution = require('./coevolution/Coevolution').runCoevolution;
const FileWriter = require('./rts/FileWriter');

const t0 = Date.now();
const finalGeneration = runCoevolution();
console.log(`Evolution complete (${Date.now() - t0}ms)`);

const fileName = process.argv[2];

if (fileName) {
    FileWriter.writeConfigToJS(`${fileName}.js`, finalGeneration.map(x => x.genome));

} else {
    console.log(`\nBuild order (one)\n\t` + finalGeneration[0].genome.buildOrder.map(target => `${target.specName}: ${target.addCount}`).join('\n\t'));
    console.log(`\nBuild order (two)\n\t` + finalGeneration[1].genome.buildOrder.map(target => `${target.specName}: ${target.addCount}`).join('\n\t'));
}
