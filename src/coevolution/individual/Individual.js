import Game from '~/rts/Game';
import {maxLoopsPerGame} from '~/coevolution/config';
import * as Genome from '~/coevolution/individual/genome';

const sumTotal = (sum, number) => sum + number;


export default class Individual {

    static generate = () => new Individual(Genome.generateGenome());

    constructor(genome) {
        this.id = genome;
        this.genome = genome;
    }

    clone() {
        const deepCopiedGenome = {
            buildOrder: this.genome.buildOrder.map(target => ({ ...target })),
            attackAtSupply: this.genome.attackAtSupply,
        };

        return new Individual(deepCopiedGenome);
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
    gameResults = {}
    getResult = (opponent) => this.gameResults[opponent.id]
    setResult = (opponent, result) => {
        result.opponentId = opponent.id;
        this.gameResults[opponent.id] = result;
    }

    evaluateAgainstOne = (opponent) => {
        if (!this.getResult(opponent)) {
            const game = new Game('game-id', maxLoopsPerGame, this.genome, opponent.genome);

            game.simulate();

            this.setResult(opponent, game.finalScore.blue);
            opponent.setResult(this, game.finalScore.red);
        }
        return this.getResult(opponent);
    }
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
        // Different if either attack at supply is different
        return this.genome.attackAtSupply !== other.genome.attackAtSupply
            || this.genome.buildOrder.some((target, index) => {
                const otherTarget = other.genome.buildOrder[index];

                // Or if any of the targets in the bulid order are different
                return !otherTarget
                    || otherTarget.specName !== target.specName
                    || otherTarget.addCount !== target.addCount;
            });
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
        return Math.abs(this.genome.attackAtSupply - other.genome.attackAtSupply)
            + Array(
                Math.max(this.genome.buildOrder.length, other.genome.buildOrder.length)
            )
            .fill()
            .map((_, index) => {
                const dummyTarget = { addCount: 0 }; // 0 so we can subract without getting NaN
                const thisTarget = this.genome.buildOrder[index] || dummyTarget; // Dummy target will never
                const otherTarget = other.genome.buildOrder[index] || dummyTarget; // apply to both

                const addCountDiff = Math.abs(thisTarget.addCount - otherTarget.addCount);
                const specNameDiff = (thisTarget.specName === otherTarget.specName) ? 0 : 1;

                return addCountDiff + specNameDiff;
            })
            .reduce(sumTotal, 0);
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
