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

    return {buildOrder, attackAtSupply};
}

function cloneIndividual(individual) {
    return {
        buildOrder: individual.buildOrder.map(({ spec, count }) => ({ spec, count })),
        attackAtSupply: individual.attackAtSupply,
    };
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

// const randInt = (min, max) => min + Math.floor((max - min) * Math.random());
const plusOrMinus = int => Math.random() < 0.5 ? int : -int;

function mutate(individual) { // eslint-disable-line no-unused-vars
    const {buildOrder} = individual;

    const targetIndex = Math.floor(buildOrder.length * Math.random());
    const target = buildOrder[targetIndex];

    target.count = Math.max(1, target.count + plusOrMinus(1));
}

/*****************/
/**  Selection  **/
/*****************/
function rouletteWheelSelection(population, nofSelected) {
    let popSummedFitness = 0;

    const rouletteWheel = population.reduce((wheel, individual) => {
        wheel.push({
            lowerBound: popSummedFitness,
            individual
        });

        popSummedFitness += individual.fitness;

        return wheel;
    }, []);

    return Array(nofSelected).fill().map(() => {
        const rouletteNumber = Math.floor(popSummedFitness * Math.random());

        const area = rouletteWheel.find(area => area.lowerBound <= rouletteNumber);

        if (!area) {
            throw Error(`No area found for rouletteNumber ${rouletteNumber} in roulette wheel `
                + `[ ${rouletteWheel.map(area => area.lowerBound).join(' <-> ')} <-> ${popSummedFitness} ]`);
        }
        return area.individual;
    });
}

/******************/
/**  Evaluation  **/
/******************/
import Game from '~/rts/Game';
const maxGameLoops = 999;

function evaluate_wip(individuals) {
    individuals.forEach(individual => {
        individual.fitness = 0;
    });

    individuals.forEach(one => {
        individuals.filter(two => two !== one).forEach(two => {
            const game = new Game('unnecessary-id', maxGameLoops, one, two);

            game.simulate();

            one.fitness += game.finalScore.blue.score;
            two.fitness += game.finalScore.red.score;
        });
    });
}

/************/
/**  Main  **/
/************/
const popSize = 4;
const nofChildrenPerGeneration = 2; // must be even
const crossoverRatio = 0.9;
const mutationRatio = 0.01;
const maxGenerations = 10;

const flatMap = (flattenedArray, nextArray) => flattenedArray.concat(nextArray);

export function runSimpleEvolution() {
    let generation = 0;

    // initialize population
    let population = Array(popSize).fill().map(generateIndividual);

    // evaluate individuals from puplation
    evaluate_wip(population);

    population.forEach(one => {
        population.filter(two => two !== one).forEach(two => {
            const game = new Game('unnecessary-id', maxGameLoops, one, two);

            game.simulate();

            one.fitness += game.finalScore.blue.score;
            two.fitness += game.finalScore.red.score;
        });
    });

    while (generation++ < maxGenerations) {
        // select parents
        const parents = rouletteWheelSelection(population, nofChildrenPerGeneration);

        // produce children
        const children = Array(nofChildrenPerGeneration / 2).fill().map((_, index) => {
            // Crossover
            const mother = parents[2 * index];
            const father = parents[2 * index + 1];

            if (Math.random() < crossoverRatio) {
                return crossover(mother, father);
            } else {
                return [cloneIndividual(mother), cloneIndividual(father)];
            }

        }).reduce(flatMap, []).map((child) => {
            // Mutation
            if (Math.random() < mutationRatio) {
                mutate(child);
            }
            return child;
        });

        // evaluate individuals from children
        evaluate_wip(children);

        // select survivors for next generation
        let parentsAndChildren = parents.concat(children);

        if (parentsAndChildren.length < popSize) {
            throw Error(`Not enough parents and children (${parentsAndChildren.length}) to fill a new generation with population size ${popSize}!`);
        }
        if (parentsAndChildren.length === popSize) {
            population = parentsAndChildren;
            continue;
        }

        const survivors = [];

        while (survivors.length < popSize) {
            const nextSurvivor = rouletteWheelSelection(parentsAndChildren, 1)[0];

            survivors.push(nextSurvivor);
            parentsAndChildren = parentsAndChildren.filter(remaining => remaining !== nextSurvivor);
        }

        population = survivors;
    }

    const sortedPopulation = population.sort((one, two) => two.fitness - one.fitness);

    return sortedPopulation;
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
