import {generateIndividual, crossover, mutate, cloneIndividual} from '~/coevolution/individual/Individual';
import {evaluate_wip} from '~/coevolution/evaluation/Evaluation';
import {selectUnique, rouletteWheelSelection, linearRankSelection} from '~/coevolution/selection';

const popSize = 6;
const nofChildrenPerGeneration = 12;
const crossoverRatio = 0.5;
const mutationRatio = 0.01;
const maxGenerations = 20;

const flatMap = (flattenedArray, nextArray) => flattenedArray.concat(nextArray);

export function runSimpleEvolution() {
    let generation = 0;

    // initialize population
    let population = Array(popSize).fill().map(generateIndividual);

    // evaluate individuals from puplation
    evaluate_wip(population);

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
        const survivors = selectUnique(children, popSize, rouletteWheelSelection);

        population = survivors;
    }

    const sortedPopulation = population.sort((one, two) => two.fitness - one.fitness);

    return sortedPopulation;
}
