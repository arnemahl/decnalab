import Statistics from '~/coevolution/Statistics';
import Individual, {getCaseInjectedInvidviduals} from '~/coevolution/individual/Individual';
import {selectUnique, createScaledFitnessSelection} from '~/coevolution/selection';
import * as config from '~/coevolution/config';

const flatMap = (flattenedArray, nextArray) => flattenedArray.concat(nextArray);

const {
    popSize,
    nofChildrenPerGeneration,
    teachSetSize,
    maxGenerations,
    fitnessScalingFactor,
    crossoverRatio,
    mutationRatio,
} = config;

const scaledFitnessSelection = createScaledFitnessSelection((fitness, maxFitness) => fitnessScalingFactor * fitness + maxFitness);

const DEBUG = true;
const logProgress = DEBUG ? console.log : () => {};


export function runCoevolution() {
    const statistics = new Statistics();

    let generation = 0;

    const hallOfFame = getCaseInjectedInvidviduals();

    // initialize population (not all will survive)
    const initialPopulation = Array(nofChildrenPerGeneration).fill().map(Individual.generate);

    // select evaluators (teachSet)
    logProgress('Creating initial Teach set...');
    let bestInHallOfFame = hallOfFame.slice(0, teachSetSize / 2);
    let teachSet = Individual.selectBySharedSampling(initialPopulation, hallOfFame, bestInHallOfFame, teachSetSize);

    // evaluate individuals from initialPopulation
    logProgress('Evaluating initial population...');
    let wrappedPopulation = Individual.wrapWithSharedFitness(initialPopulation, teachSet);

    // select survivors for 1st generation
    wrappedPopulation = selectUnique(wrappedPopulation, popSize, scaledFitnessSelection);
    let population = wrappedPopulation.map(Individual.unwrap);

    while (generation++ < maxGenerations) {
        console.log('\nGeneration:', generation + '\n');
        statistics.track(wrappedPopulation);

        // select parents
        const parents = scaledFitnessSelection(wrappedPopulation, nofChildrenPerGeneration).map(Individual.unwrap);

        // produce children
        logProgress('\nCreating childen...');
        const children = Array(nofChildrenPerGeneration / 2).fill().map(() => {
            // Crossover
            const mother = parents.pop();
            const father = parents.pop();

            if (Math.random() < crossoverRatio) {
                return Individual.crossover(mother, father);
            } else {
                return [ mother.clone(), father.clone() ];
            }

        }).reduce(flatMap, []).map((child) => {
            // Mutation
            if (Math.random() < mutationRatio) {
                return child.mutate();
            } else {
                return child;
            }
        });

        // update evaluators (teachSet)
        logProgress('Updating Teach set...');
        bestInHallOfFame = Individual.selectBySharedSampling(hallOfFame, teachSet, [], teachSetSize / 2);
        teachSet = Individual.selectBySharedSampling(population, teachSet, bestInHallOfFame, teachSetSize);

        // evaluate children
        logProgress('Evaluating children...');
        const wrappedChildren = Individual.wrapWithSharedFitness(children, teachSet);

        // select survivors for next generation
        const wrappedSurvivors = selectUnique(wrappedChildren, popSize, scaledFitnessSelection);

        wrappedPopulation = wrappedSurvivors;
        population = wrappedPopulation.map(Individual.unwrap);

        // add best individual from generation
        logProgress('Adding best individual to Hall of Fame...');
        hallOfFame.push(Individual.getBestAdditionToSample(population, teachSet, hallOfFame));
    }

    const sortedPopulation = wrappedPopulation.sort((one, two) => two.fitness - one.fitness).map(Individual.unwrap);
    const uniqueInPopulation = Individual.getIndividualsWithUniqueGenome(sortedPopulation);

    const output = {
        solutions: {
            population: uniqueInPopulation.map(x => x.genome),
            hallOfFame: hallOfFame.map(x => x.genome),
            caseInjected: getCaseInjectedInvidviduals().map(x => x.genome),
        },
        config,
        statistics: statistics.dump(),
    };

    return output;
}
