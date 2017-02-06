require("babel-core/register");
require("babel-polyfill");

const runCoevolution = require('./coevolution/Coevolution').runCoevolution;
const FileWriter = require('./rts/FileWriter');

const t0 = Date.now();
const output = runCoevolution();
console.log(`Evolution complete (${Date.now() - t0} ms)`);
console.log(`\nUnique solutions:`, output.solutions.population.length);


console.log('\n');
console.log('/************************/');
console.log('/**  final generation  **/');
console.log('/************************/');
output.solutions.population.forEach((genome, index) => {
    console.log(`\nBuild order (${index})\n\t` + genome.buildOrder.map(target => `${target.specName}: ${target.addCount}`).join('\n\t'));
});

console.log('\n');
console.log('/********************/');
console.log('/**  hall of fame  **/');
console.log('/********************/');
output.solutions.population.forEach((genome, index) => {
    console.log(`\nBuild order (${index})\n\t` + genome.buildOrder.map(target => `${target.specName}: ${target.addCount}`).join('\n\t'));
});


const fileName = process.argv[2];

if (fileName) {
    FileWriter.writeSolutionsToJS(`${fileName}.js`, output.solutions);
    FileWriter.writeJSON(`statistics/${fileName}.json`, {
        config: output.config,
        statistics: output.statistics,
    });
}
