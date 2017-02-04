require("babel-core/register");
require("babel-polyfill");

const runSimpleEvolution = require('./coevolution/Coevolution').runSimpleEvolution;
const FileWriter = require('./rts/FileWriter');

function run() {
    const t0 = Date.now();
    const finalGeneration = runSimpleEvolution();

    console.log(`Evolution complete (${Date.now() - t0}ms)`);

    return finalGeneration;
}

const fileName = process.argv[2];

if (fileName) {
    const finalGeneration = run();

    FileWriter.writeConfigToJS(`${fileName}.js`, finalGeneration);

} else {
    const finalGeneration = run();

    console.log(`\nBuild order (one)\n\t` + finalGeneration[0].buildOrder.map(target => `${target.spec.constructor.name}: ${target.count}`).join('\n\t'));
    console.log(`\nBuild order (two)\n\t` + finalGeneration[1].buildOrder.map(target => `${target.spec.constructor.name}: ${target.count}`).join('\n\t'));
}
