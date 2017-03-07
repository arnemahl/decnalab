require("babel-core/register");
require("babel-polyfill");

const runCoevolution = require('./coevolution/Coevolution').runCoevolution;
const FileWriter = require('./rts/FileWriter');

const t0 = Date.now();
const output = runCoevolution();

const DEBUG = false;

if (DEBUG || !process.argv[2]) {
    console.log('\n');
    console.log('/************************/');
    console.log('/**  final generation  **/');
    console.log('/************************/');
    output.solutions.population.forEach((strategy, index) => {
        console.log(`\nBuild order (${index})\n\t` + strategy.buildOrder.map(target => `${target.specName}: ${target.addCount}`).join('\n\t'));
    });

    console.log('\n');
    console.log('/********************/');
    console.log('/**  hall of fame  **/');
    console.log('/********************/');
    output.solutions.population.forEach((strategy, index) => {
        console.log(`\nBuild order (${index})\n\t` + strategy.buildOrder.map(target => `${target.specName}: ${target.addCount}`).join('\n\t'));
    });
}


const experimentName = process.argv[2];

if (experimentName) {
    const uniqueDirName = FileWriter.getUniqueDirName(experimentName);

    FileWriter.createDumpDirectory(uniqueDirName);
    FileWriter.writeJSON(`${uniqueDirName}/config.json`, output.config);
    FileWriter.writeJSON(`${uniqueDirName}/statistics.json`, output.statistics.json);
    FileWriter.writeJSON(`${uniqueDirName}/evaluation.json`, output.evaluation.json);

    FileWriter.createDumpDirectory(`${uniqueDirName}/solutions`);
    Object.keys(output.solutions).map(solutionSetName => {
        FileWriter.writeSolutionsToJS(`${uniqueDirName}/solutions/${solutionSetName}.js`, output.solutions[solutionSetName]);
    });

    FileWriter.createDumpDirectory(`${uniqueDirName}/tex-graph-data`);
    Object.keys(output.statistics.tex).map(texDataName => {
        FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/${texDataName}.dat`, output.statistics.tex[texDataName]);
    });

    FileWriter.createDumpDirectory(`${uniqueDirName}/tex-evaluation`);
    Object.keys(output.evaluation.latexTables).map(latexTableName => {
        FileWriter.writeToFile(`${uniqueDirName}/tex-evaluation/${latexTableName}.tex`, output.evaluation.latexTables[latexTableName]);
    });
}

console.log('Score:', output.evaluation.json.score)

console.log('\n'); // DEBUG
console.log(`===========================================================`);
console.log(`     Evolution complete (${Date.now() - t0} ms)`);
console.log(`     Unique solutions: ${output.solutions.population.length}`);
console.log(`===========================================================`);
