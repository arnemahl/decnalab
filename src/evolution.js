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
    FileWriter.writeSolutionsToJS(`${uniqueDirName}/solutions.js`, output.solutions);
    FileWriter.writeJSON(`${uniqueDirName}/config.json`, output.config);
    FileWriter.writeJSON(`${uniqueDirName}/statistics.json`, output.statistics.json);

    FileWriter.createDumpDirectory(`${uniqueDirName}/tex-graph-data`);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/fitness.dat`, output.statistics.tex.fitness);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/score.dat`, output.statistics.tex.score);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/nofWins.dat`, output.statistics.tex.nofWins);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/baselineFitness.dat`, output.statistics.tex.baselineFitness);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/baselineScore.dat`, output.statistics.tex.baselineScore);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/baselineNofWins.dat`, output.statistics.tex.baselineNofWins);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/geneticDistance.dat`, output.statistics.tex.geneticDistance);
    FileWriter.writeToFile(`${uniqueDirName}/tex-graph-data/geneticDistanceToCaseInjected.dat`, output.statistics.tex.geneticDistanceToCaseInjected);
}

console.log('\n'); // DEBUG
console.log(`===========================================================`);
console.log(`     Evolution complete (${Date.now() - t0} ms)`);
console.log(`     Unique solutions: ${output.solutions.population.length}`);
console.log(`===========================================================`);
