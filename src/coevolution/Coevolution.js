/*******************/
/**  Individuals  **/
/*******************/
import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structures/StructureSpecs';

const unitSpecs = new UnitSpecs();
const structureSpecs = new StructureSpecs();

const producableThings = [
    unitSpecs.Worker,
    unitSpecs.Marine,
    structureSpecs.SupplyDepot,
    structureSpecs.Barracks,
];
const nofProducableThings = producableThings.length;
const maxProduced = [
    4, // Worker
    4, // Marine
    2, // SupplyDepot
    2, // Barracks
];
const maxAttackTiming = 15;
const initBuildOrderLength = 4;

export function generateIndividual() {
    const counts = Array(nofProducableThings).fill(0);
    counts[0] = 5; // Starts with 5 Workers

    const buildOrder = Array(initBuildOrderLength).fill().map(() => {
        const index = Math.floor(nofProducableThings * Math.random());
        const whatToProduce = producableThings[index];
        const howMany = Math.ceil((maxProduced[index] - 1) * Math.random());

        counts[index] += howMany;

        return {
            spec: whatToProduce,
            count: counts[index]
        };
    });

    buildOrder.push({ spec: unitSpecs.Marine, count: Number.POSITIVE_INFINITY });

    const attackAtSupply = 5 + Math.floor(maxAttackTiming + Math.random());

    return {buildOrder, attackAtSupply, fitness: 0};
}

function crossover(mother, father) { // eslint-disable-line no-unused-vars
    const crossoverPoint = Math.floor(Math.random() * Math.max(mother.buildOrder.length, father.buildOrder.length));
    const rand = Math.random() < 0.5;

    const son = {
        buildOrder: []
            .concat(mother.buildOrder.slice(0, crossoverPoint))
            .concat(father.buildOrder.slice(crossoverPoint)),
        attackAtSupply: rand ? mother.attackAtSupply : father.attackAtSupply,
    };
    const daughter = {
        buildOrder: []
            .concat(father.buildOrder.slice(0, crossoverPoint))
            .concat(mother.buildOrder.slice(crossoverPoint)),
        attackAtSupply: rand ? father.attackAtSupply : mother.attackAtSupply,
    };

    return [son, daughter];
}

function mutation(individual) { // eslint-disable-line no-unused-vars
    // TODO - now does nothing
    const {buildOrder, attackAtSupply} = individual;
    return {buildOrder, attackAtSupply};
}


/************/
/**  Main  **/
/************/
import Game from '~/rts/Game';

const popSize = 4;
const maxLoops = 10;
const maxGameLoops = 999;

export function runSimpleEvolution() {
    let loops = 0;

    // initialize population
    const population = Array(popSize).fill().map(generateIndividual);

    // evaluate individuals from puplation
    population.forEach(one => {
        population.filter(two => two !== one).forEach(two => {
            const game = new Game('unnecessary-id', maxGameLoops, one, two);

            game.simulate();

            one.fitness += game.finalScore.blue.score;
            two.fitness += game.finalScore.red.score;
        });
    });

    population.forEach(ind => {
        console.log(`ind.fitness:`, ind.fitness); // DEBUG
    });

    while (loops++ < maxLoops) {
        // select parents
        // produce children
        // evaluate individuals from children
        // select survivors for next generation
    }

    const solution = population.sort((one, two) => two.fitness - one.fitness);

    return solution;
}

// function runCoevolution() {
//     // let hallOfFame = [];
//     let popSize = 10;
//     let population = Array(popSize).fill().map(generateIndividual);

//     let loops = 0;
//     const maxLoops = 10;

//     // initialize population
//     // select evaluators from population ??
//     // evaluate individuals from puplation by interacting with evaluators(?)

//     while (loops++ < maxLoops) {
//         // select parents
//         // produce children
//         // select evaluators from chldren + parents
//         // evaluate individuals from children by interacting with evaluators
//         // select survivors for next generation
//     }

//     const solution = population.sort((one, two) => two.fitness - one.fitness);

//     return solution;
// }
