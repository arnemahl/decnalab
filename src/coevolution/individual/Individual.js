import Game from '~/rts/Game';

const sumTotal = (sum, number) => sum + number;
let individualsCreated = 0;


export default class Individual {

    static generate = () => new Individual(generateGenome()); // eslint-disable-line no-use-before-define

    constructor(genome) {
        this.id = `individual-${individualsCreated++}`;
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
        const plusOrMinus = (int) => Math.random() < 0.5 ? int : -int;
        const clonedCopy = this.clone();

        if (Math.random() < 0.9) {
            // Mutate build order
            const {buildOrder} = clonedCopy.genome;
            const targetIndex = Math.floor(buildOrder.length * Math.random());
            const target = buildOrder[targetIndex];

            target.addCount = Math.max(1, target.addCount + plusOrMinus(1));

        } else {
            // Mutate attack at supply
            clonedCopy.attackAtSupply += plusOrMinus(1);
        }

        return clonedCopy;
    }

    static crossover(mother, father) {
        const crossoverPointMother = Math.floor(Math.random() * mother.genome.buildOrder.length);
        const crossoverPointFather = Math.floor(Math.random() * father.genome.buildOrder.length);
        const rand = Math.random() < 0.5;

        const son = {
            buildOrder: []
                .concat(mother.genome.buildOrder.slice(0, crossoverPointMother))
                .concat(father.genome.buildOrder.slice(crossoverPointFather)),
            attackAtSupply: rand ? mother.genome.attackAtSupply : father.genome.attackAtSupply,
        };
        const daughter = {
            buildOrder: []
                .concat(father.genome.buildOrder.slice(0, crossoverPointFather))
                .concat(mother.genome.buildOrder.slice(crossoverPointMother)),
            attackAtSupply: rand ? father.genome.attackAtSupply : mother.genome.attackAtSupply,
        };

        return [son, daughter].map(genome => new Individual(genome));
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
            const game = new Game('game-id', 1000, this.genome, opponent.genome);

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

            const sharedFitness =
                individual
                    .evaluateAgainstAll(teachSet)
                    // .filter(result => result.didWin)
                    // .map(result => {
                    //     return result.score / nofTimesBeaten[result.opponentId];
                    // })
                    .map(result => {
                        return result.score / (1 + 2 * nofTimesBeaten[result.opponentId]);
                    })
                    .reduce(sumTotal, 0);

            return {
                individual,
                fitness: sharedFitness,
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

            const sharedFitnessRelateiveToAlreadySelected =
                individual
                    .evaluateAgainstAll(teachSet)
                    // .filter(result => result.didWin)
                    .map(result => {
                        return result.score / (1 + 2 * nofTimesBeaten[result.opponentId]);
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

}


/*******************************************/
/**  Human designed good-ish individuals  **/
/*******************************************/

export const getCaseInjectedInvidviduals = () => [
    { // Not that good :)
        buildOrder: [
            { specName: 'Worker', addCount: 5 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Barracks', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 15,
    },
    { // Not that good :)
        buildOrder: [
            { specName: 'Worker', addCount: 5 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Worker', addCount: 4 },
            { specName: 'Barracks', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 15,
    },
    {
        buildOrder: [
            { specName: 'Barracks', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 11 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 15,
    },
    {
        buildOrder: [
            { specName: 'Worker', addCount: 4 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Barracks', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 15,
    },
    {
        buildOrder: [ // was 1st generation random generated :-O
            { specName: 'Worker', addCount: 1 },
            { specName: 'Barracks', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 20,
    },
    {
        buildOrder: [ // was 1st generation random generated :-O
            { specName: 'Barracks', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 20,
    },
].map(genome => new Individual(genome));


/************************************/
/**  Generate random individuals   **/
/************************************/
const producableThings = [
    'Worker',
    'Marine',
    'SupplyDepot',
    'Barracks',
];
const nofProducableThings = producableThings.length;
const maxProduced = [
    1, // Worker
    4, // Marine
    1, // SupplyDepot
    1, // Barracks
];
const maxAttackTiming = 15;
const initBuildOrderLength = 5;

export function generateGenome() {
    const buildOrder = Array(initBuildOrderLength).fill().map(() => {
        const index = Math.floor(nofProducableThings * Math.random());
        const whatToProduce = producableThings[index];
        const howMany = Math.ceil(maxProduced[index] * Math.random());

        return {
            specName: whatToProduce,
            addCount: howMany
        };
    });

    const attackAtSupply = 5 + Math.floor(maxAttackTiming + Math.random());

    return { buildOrder, attackAtSupply };
}
