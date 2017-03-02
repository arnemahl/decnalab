import * as Genome from '~/coevolution/individual/genome';
import * as MemoizedGameResults from '~/coevolution/individual/memoizedGameResults';

const sumTotal = (sum, number) => sum + number;


export default class Individual {

    static generate = () => new Individual(Genome.generateGenome());

    constructor(genome) {
        this.id = genome;
        this.genome = genome;
        this.strategy = Genome.decodeGenome(genome);
    }

    mutate() {
        return new Individual(Genome.copyAndMutate(this.genome));
    }

    static uniformCrossover(mother, father) {
        return Genome.uniformCrossover(mother.genome, father.genome).map(genome => new Individual(genome));
    }


    /**********************************/
    /**  Shared fitness calculation  **/
    /**********************************/
    evaluateAgainstOne = (opponent) => MemoizedGameResults.getResult(this, opponent);
    evaluateAgainstAll = (opponents) => opponents.map(this.evaluateAgainstOne);

    static getTeachSetLosses = (teachSet, selected) => {
        return teachSet.reduce((losses, teachSetMember) => {

            losses[teachSetMember.id] =
                teachSetMember
                    .evaluateAgainstAll(selected)
                    .map(result => result.didLose ? 1 : 0)
                    .reduce(sumTotal, 0);

            return losses;
        }, {});
    };

    static wrapWithSharedFitness = (individuals, teachSet) => {
        const nofTimesBeaten = Individual.getTeachSetLosses(teachSet, individuals);

        // Get shared fitness for each individual based on performance
        // against teachSet, favor beating hard-to-beat teachSet members
        const wrappedWithFitness = individuals.map(individual => {

            const results = individual.evaluateAgainstAll(teachSet);

            const sharedFitness = // NB: Dublicated code in Shared sampling
                results
                    .map(result => {
                        if (result.didWin) {
                            return result.score / (1 + nofTimesBeaten[result.opponentId]);
                        } else if (result.didLose) {
                            return result.score / Math.pow(1 + nofTimesBeaten[result.opponentId], 3);
                        } else {
                            return result.score / Math.pow(1 + nofTimesBeaten[result.opponentId], 2);
                        }
                    })
                    .reduce(sumTotal, 0);

            const avgScore =
                results
                    .map(result => result.score)
                    .reduce(sumTotal, 0) / results.length;

            const nofWins =
                results
                    .filter(result => result.didWin)
                    .length;

            return {
                individual,
                fitness: sharedFitness,
                avgScore,
                nofWins,
            };
        });

        return wrappedWithFitness;
    };

    static unwrap = wrapper => wrapper.individual;


    /***********************/
    /**  Shared sampling  **/
    /***********************/

    static getBestAdditionToSample = (individuals, teachSet, alreadySelected) => {
        const nofTimesBeaten = Individual.getTeachSetLosses(teachSet, alreadySelected);

        // Get shared fitness for each individual based on performance
        // against teachSet, favor beating hard-to-beat teachSet members
        const wrappedWithFitness = individuals.map(individual => {

            const sharedFitnessRelateiveToAlreadySelected = // NB: Duplicated code in Shared fitness
                individual
                    .evaluateAgainstAll(teachSet)
                    .map(result => {
                        if (result.didWin) {
                            return result.score / (1 + nofTimesBeaten[result.opponentId]);
                        } else if (result.didLose) {
                            return result.score / Math.pow(1 + nofTimesBeaten[result.opponentId], 3);
                        } else {
                            return result.score / Math.pow(1 + nofTimesBeaten[result.opponentId], 2);
                        }
                    })
                    .reduce(sumTotal, 0);

            return {
                individual,
                fitness: sharedFitnessRelateiveToAlreadySelected,
            };
        });

        const best = wrappedWithFitness.sort((one, two) => two.fitness - one.fitness)[0];

        return best.individual;
    };

    static selectBySharedSampling = (individuals, teachSet, preSelected, count) => {
        const selected = preSelected.slice();

        while (selected.length < count) {
            selected.push(Individual.getBestAdditionToSample(individuals, teachSet, selected));
        }

        return selected;
    };


    /********************************/
    /**  Filter equal individuals  **/
    /********************************/
    hasDifferentGenomeThan = (other) => {
        return this.genome !== other.genome;
    };

    static getIndividualsWithUniqueGenome = (population) => {
        const unique = [];

        population.forEach(one => {
            if (unique.every(other => one.hasDifferentGenomeThan(other))) {
                unique.push(one);
            }
        });

        return unique;
    };

    static countUniqueGenomes = (population) => {
        return Individual.getIndividualsWithUniqueGenome(population).length;
    };

    /**********************************/
    /**  Calculate genetic distance  **/
    /**********************************/
    getGeneticDistanceTo = (other) => {
        return Genome.calculateDistance(this.genome, other.genome);
    };

    static getAverageGeneticDistancesWithin = (population) => {
        return population.map(individual =>
            population
                .filter(other => other !== individual)
                .map(other => individual.getGeneticDistanceTo(other))
                .reduce(sumTotal, 0)
        ).map(sum => sum / (population.length - 1)); // average
    };

    static getAverageGeneticDistancesToOtherSet = (population, otherPopulation) => {
        return population.map(individual =>
            otherPopulation
                .filter(other => other !== individual) // same should not be in both, but just in case ¯\_(ツ)_/¯
                .map(other => individual.getGeneticDistanceTo(other))
                .reduce(sumTotal, 0)
        ).map(sum => sum / (otherPopulation.length)); // average
    };

}
