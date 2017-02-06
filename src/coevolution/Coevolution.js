import Individual, {getCaseInjectedInvidviduals} from '~/coevolution/individual/Individual';
import {selectUnique, createScaledFitnessSelection} from '~/coevolution/selection';

const flatMap = (flattenedArray, nextArray) => flattenedArray.concat(nextArray);
const scaledFitnessSelection = createScaledFitnessSelection((fitness, maxFitness) => 3 * fitness + maxFitness);

const popSize = 8;
const nofChildrenPerGeneration = 12;
const teachSetSize = 4;
const maxGenerations = 3;
const crossoverRatio = 0.95;
const mutationRatio = 0.01;


export function runCoevolution() {
    let generation = 0;
    const hallOfFame = getCaseInjectedInvidviduals().slice(0, 3);

    // initialize population
    const initialPopulation = Array(nofChildrenPerGeneration).fill().map(Individual.generate);

    // select evaluators (teachSet)
    let bestInHallOfFame = hallOfFame.slice(0, teachSetSize / 2);
    let teachSet = Individual.selectBySharedSampling(initialPopulation, hallOfFame, bestInHallOfFame, teachSetSize);

    // evaluate individuals from initialPopulation
    let wrappedPopulation = Individual.wrapWithSharedFitness(initialPopulation, teachSet);

    wrappedPopulation = scaledFitnessSelection(wrappedPopulation, popSize);

    while (generation++ < maxGenerations) {
        console.log('\nGeneration:', generation, '\n\tFitnesses:\t', wrappedPopulation.map(x => x.individual.id+':  '+Math.floor(x.fitness)).join(',\t'));

        // select parents
        const parents = scaledFitnessSelection(wrappedPopulation, nofChildrenPerGeneration).map(Individual.unwrap);

        const uniqueParents = parents.reduce((unique, next) => {
            if (unique.indexOf(next) === -1) {
                unique.push(next);
            }
            return unique;
        }, []);
        console.log(`uniqueParents.length:`, uniqueParents.length); // DEBUG

        // produce children
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
        const population = wrappedPopulation.map(Individual.unwrap);

        bestInHallOfFame = Individual.selectBySharedSampling(hallOfFame, teachSet, [], teachSetSize / 2);
        teachSet = Individual.selectBySharedSampling(population, teachSet, bestInHallOfFame, teachSetSize);

        // evaluate children
        const wrappedChildren = Individual.wrapWithSharedFitness(children, teachSet);

        // select survivors for next generation
        const wrappedSurvivors = selectUnique(wrappedChildren, popSize, scaledFitnessSelection);

        wrappedPopulation = wrappedSurvivors;

        // // update hall of fame (?)
        // hallOfFame = Individual.selectBySharedSampling(hallOfFame.concat(population), teachSet, [], hallOfFame.length);
    }

    const sortedPopulation = wrappedPopulation.sort((one, two) => two.fitness - one.fitness).map(Individual.unwrap);

    return sortedPopulation;
}
