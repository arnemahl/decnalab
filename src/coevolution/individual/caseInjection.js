import Individual from './Individual';
import * as Genome from './genome';

/*******************************************/
/**  Human designed good-ish individuals  **/
/*******************************************/
const caseInjectedStrategies = [
    {
        buildOrder: [
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Barracks', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 15,
    },
    {
        buildOrder: [
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Barracks', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Barracks', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 15,
    },
    {
        buildOrder: [
            { specName: 'Barracks', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
            { specName: 'SupplyDepot', addCount: 1 },
            { specName: 'Marine', addCount: 1 },
        ],
        attackAtSupply: 15,
    },
    {
        buildOrder: [
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
            { specName: 'Worker', addCount: 1 },
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
]

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
                (target, targetIndex) => target.specName !== strategyTwo.buildOrder[targetIndex].specName
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
