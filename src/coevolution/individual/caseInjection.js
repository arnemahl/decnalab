import Individual from './Individual';
import * as Genome from './genome';

/*******************************************/
/**  Human designed good-ish individuals  **/
/*******************************************/
export const getCaseInjectedInvidviduals = () => [
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
.map(strategy => Genome.encodeGenome(strategy))
.map(genome => new Individual(genome));
