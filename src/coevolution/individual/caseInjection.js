import Individual from './Individual';

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
].map(genome => new Individual(genome));
