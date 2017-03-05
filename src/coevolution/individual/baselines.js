import Individual from './Individual';
import * as Genome from './genome';

// Base line solutions to provide a fixed measurement of each
// Generation (unlike Teach set, which will vary)
const baselineStrategies = [

    {   // #1: Max offensive. Beats #3
        attackAtSupply: 6,
        buildOrder: [
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Marine' },
        ],
    },

    {   // #2: More economical. Can (just barely) defend first attack against #1, then win
        attackAtSupply: 20,
        buildOrder: [
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Marine' },
        ],
    },

    {   // #3: Very economical (11 workers). BO-26(9) (max addCount of 7). Beats #2
        attackAtSupply: 30,
        buildOrder: [
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Marine' },
        ],
    },

    {   // #4: Max economical (15 workers). BOL-24(8) Beats #2 and #3
        attackAtSupply: 35,
        buildOrder: [
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Worker' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Marine' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'Marine' },
        ],
    },

];

export const getBaselines = () =>
    baselineStrategies
        .map(strategy => Genome.encodeGenome(strategy))
        .map(genome => new Individual(genome));

/**************************************/
/*  Test correct Encoding / Decoding  */
/**************************************/
(function test() {
    function areDifferent(strategyOne, strategyTwo) {
        return strategyOne.attackAtSupply !== strategyTwo.attackAtSupply
            || strategyOne.buildOrder.some(
                (target, targetIndex) =>
                    target.specName !== strategyTwo.buildOrder[targetIndex].specName
                    || target.addCount !== strategyTwo.buildOrder[targetIndex].addCount
            );
    }

    const baselineIndividuals = getBaselines();

    baselineStrategies.forEach((strategy, strategyIndex) => {
        const individual = baselineIndividuals[strategyIndex];

        if (areDifferent(strategy, individual.strategy)) {
            console.log('Encoded strategy !== original strategy:');
            console.log(`strategy:`, strategy);
            console.log(`individual.strategy:`, individual.strategy);
        }
    });
})();
