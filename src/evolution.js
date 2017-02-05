require("babel-core/register");
require("babel-polyfill");

const runCoevolution = require('./coevolution/Coevolution').runCoevolution;
const FileWriter = require('./rts/FileWriter');

function run() {
    const t0 = Date.now();
    const finalGeneration = runCoevolution();

    console.log(`Evolution complete (${Date.now() - t0}ms)`);

    return finalGeneration;
}

const fileName = process.argv[2];

if (fileName) {
    const finalGeneration = run();

    FileWriter.writeConfigToJS(`${fileName}.js`, finalGeneration.map(x => x.genome));

} else {
    const finalGeneration = run();

    console.log(`\nBuild order (one)\n\t` + finalGeneration[0].genome.buildOrder.map(target => `${target.spec.constructor.name}: ${target.count}`).join('\n\t'));
    console.log(`\nBuild order (two)\n\t` + finalGeneration[1].genome.buildOrder.map(target => `${target.spec.constructor.name}: ${target.count}`).join('\n\t'));
}
