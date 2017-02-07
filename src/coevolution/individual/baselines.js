import Individual from './Individual';

// Base line solutions to provide a fixed measurement of each
// Generation (unlike Teach set, which will vary)
export const getBaselines = () => [
    {
        "buildOrder": [
            {
                "specName": "Barracks",
                "addCount": 1
            },
            {
                "specName": "Marine",
                "addCount": 2
            },
            {
                "specName": "SupplyDepot",
                "addCount": 1
            },
            {
                "specName": "Barracks",
                "addCount": 1
            },
            {
                "specName": "Marine",
                "addCount": 3
            }
        ],
        "attackAtSupply": 16
    },
    {
        buildOrder: [
            {
                specName: 'Worker',
                addCount: 3
            },
            {
                specName: 'Barracks',
                addCount: 1
            },
            {
                specName: 'Marine',
                addCount: 1
            },
            {
                specName: 'SupplyDepot',
                addCount: 1
            },
            {
                specName: 'Marine',
                addCount: 1
            },
            {
                specName: 'Barracks',
                addCount: 1
            },
            {
                specName: 'Marine',
                addCount: 1
            },
        ],
        attackAtSupply: 20,
    },
    {
        buildOrder: [
            {
                specName: 'Worker',
                addCount: 1
            },
            {
                specName: 'Barracks',
                addCount: 1
            },
            {
                specName: 'Marine',
                addCount: 1
            },
            {
                specName: 'SupplyDepot',
                addCount: 1
            },
            {
                specName: 'Marine',
                addCount: 1
            },
        ],
        attackAtSupply: 20,
    },
].map(genome => new Individual(genome));
