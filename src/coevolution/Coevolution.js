import Individual, {getCaseInjectedInvidviduals} from '~/coevolution/individual/Individual';
import {selectUnique, rouletteWheelSelection, linearRankSelection} from '~/coevolution/selection';

const popSize = 6;
const nofChildrenPerGeneration = 12;
const crossoverRatio = 0.5;
const mutationRatio = 0.01;
const maxGenerations = 20;
const teachSetSize = 4;


const flatMap = (flattenedArray, nextArray) => flattenedArray.concat(nextArray);

export function runCoevolution() {
    let generation = 0;
    const hallOfFame = getCaseInjectedInvidviduals();

    // initialize population
    let population = Array(popSize).fill().map(Individual.generate);

    // select evaluators (teachSet)
    let bestInHallOfFame = hallOfFame.slice(0, teachSetSize / 2);
    let teachSet = Individual.getListOfIndividualsWithBestSharedFitness(population, hallOfFame, bestInHallOfFame, teachSetSize);

    // evaluate individuals from puplation
    population.forEach(individual => individual.calcFitnessAgainstAll(teachSet));

    while (generation++ < maxGenerations) {
        console.log('Generation:', generation, '\tFitnesses', population.map(individual => individual.fitness));

        // select parents
        const parents = linearRankSelection(population, nofChildrenPerGeneration);

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
        bestInHallOfFame = Individual.getListOfIndividualsWithBestSharedFitness(hallOfFame, teachSet, [], teachSetSize / 2);
        teachSet = Individual.getListOfIndividualsWithBestSharedFitness(population, teachSet, bestInHallOfFame, teachSetSize);

        // evaluate children
        children.forEach(individual => individual.calcFitnessAgainstAll(teachSet));

        // select survivors for next generation
        const survivors = selectUnique(children, popSize, rouletteWheelSelection);

        population = survivors;

        // // update hall of fame (?)
        // hallOfFame = Individual.getListOfIndividualsWithBestSharedFitness(hallOfFame.concat(population), teachSet, [], hallOfFame.length);
    }

    const sortedPopulation = population.sort((one, two) => two.fitness - one.fitness);

    return sortedPopulation;
}
