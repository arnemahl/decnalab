import Individual from './Individual';
import * as Genome from './genome';

/*******************************************/
/**  Human designed good-ish individuals  **/
/*******************************************/
const caseInjectedStrategies = [

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

    {   // #3: Very economical (12 workers). BO-26(9) (max addCount of 7). Beats #2
        attackAtSupply: 30,
        buildOrder: [
            { addCount: 7, specName: 'Worker' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 2, specName: 'Barracks' },
            { addCount: 7, specName: 'Marine' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 4, specName: 'Marine' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 1, specName: 'Marine' },
        ],
    },

    {   // #4: Max economical (15 workers). BOL-8. Beats #2 and #3
        attackAtSupply: 35,
        buildOrder: [
            { addCount: 7, specName: 'Worker' },
            { addCount: 1, specName: 'SupplyDepot' },
            { addCount: 3, specName: 'Worker' },
            { addCount: 2, specName: 'Barracks' },
            { addCount: 2, specName: 'SupplyDepot' },
            { addCount: 7, specName: 'Marine' },
            { addCount: 1, specName: 'Barracks' },
            { addCount: 1, specName: 'Marine' },
        ],
    },


    // OLD ONES
    // {
    //     buildOrder: [
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Barracks' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Marine' },
    //     ],
    //     attackAtSupply: 15,
    // },
    // {
    //     buildOrder: [
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Barracks' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Barracks' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Marine' },
    //     ],
    //     attackAtSupply: 15,
    // },
    // {
    //     buildOrder: [
    //         { addCount: 1, specName: 'Barracks' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Marine' },
    //     ],
    //     attackAtSupply: 15,
    // },
    // {
    //     buildOrder: [
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Barracks' },
    //         { addCount: 1, specName: 'Marine' },
    //     ],
    //     attackAtSupply: 15,
    // },
    // {
    //     buildOrder: [ // was 1st generation random generated :-O
    //         { addCount: 1, specName: 'Worker' },
    //         { addCount: 1, specName: 'Barracks' },
    //         { addCount: 1, specName: 'Marine' },
    //         { addCount: 1, specName: 'SupplyDepot' },
    //         { addCount: 1, specName: 'Marine' },
    //     ],
    //     attackAtSupply: 20,
    // },
    // {
    //     buildOrder: [ // was 1st generation random generated :-O
    //         { specName: 'Barracks', addCount: 1 },
    //         { specName: 'SupplyDepot', addCount: 1 },
    //         { specName: 'Marine', addCount: 1 },
    //     ],
    //     attackAtSupply: 20,
    // },
];

export const getCaseInjectedInvidviduals = () =>
    caseInjectedStrategies
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

    const caseInjectedIndividuals = getCaseInjectedInvidviduals();

    caseInjectedStrategies.forEach((strategy, strategyIndex) => {
        const individual = caseInjectedIndividuals[strategyIndex];

        if (areDifferent(strategy, individual.strategy)) {
            console.log('Encoded strategy !== original strategy:');
            console.log(`strategy:`, strategy);
            console.log(`individual.strategy:`, individual.strategy);
        }
    });
})();
