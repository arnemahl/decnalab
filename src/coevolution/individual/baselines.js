import Individual from './Individual';
import * as Genome from './genome';

// Base line solutions to provide a fixed measurement of each
// Generation (unlike Teach set, which will vary)
export const getBaselines = () => [
    {   // Very offensive
        buildOrder: [
            {
                specName: 'Barracks',
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
    {   // Very economical
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
    {   // Firebats!
        "buildOrder": [
            {
                "specName": "Worker",
                "addCount": 1
            },
            {
                "specName": "Barracks",
                "addCount": 1
            },
            {
                "specName": "FlameTower",
                "addCount": 1
            },
            {
                "specName": "Worker",
                "addCount": 1
            },
            {
                "specName": "SupplyDepot",
                "addCount": 1
            },
            {
                "specName": "Worker",
                "addCount": 1
            },
            {
                "specName": "FlameTower",
                "addCount": 1
            },
            {
                "specName": "Firebat",
                "addCount": 1
            }
        ],
        "attackAtSupply": 16
    },
    // {   // Something in between
    //     buildOrder: [
    //         {
    //             specName: 'Worker',
    //             addCount: 1
    //         },
    //         {
    //             specName: 'Barracks',
    //             addCount: 1
    //         },
    //         {
    //             specName: 'Marine',
    //             addCount: 1
    //         },
    //         {
    //             specName: 'SupplyDepot',
    //             addCount: 1
    //         },
    //         {
    //             specName: 'Marine',
    //             addCount: 1
    //         },
    //     ],
    //     attackAtSupply: 20,
    // },
    // {   // Very persistently offensive
    //     buildOrder: [
    //         {
    //             specName: 'Barracks',
    //             addCount: 1
    //         },
    //         {
    //             specName: 'SupplyDepot',
    //             addCount: 1
    //         },
    //         {
    //             specName: 'Marine',
    //             addCount: 11
    //         },
    //         {
    //             specName: 'SupplyDepot',
    //             addCount: 1
    //         },
    //         {
    //             specName: 'Marine',
    //             addCount: 1
    //         },
    //     ],
    //     attackAtSupply: 15,
    // },
    // {   // First offensive, then economical (if the game lasts that long)
    //     "buildOrder": [
    //         {
    //             "specName": "Barracks",
    //             "addCount": 1
    //         },
    //         {
    //             "specName": "SupplyDepot",
    //             "addCount": 1
    //         },
    //         {
    //             "specName": "Marine",
    //             "addCount": 2
    //         },
    //         {
    //             "specName": "Barracks",
    //             "addCount": 1
    //         },
    //         {
    //             "specName": "Marine",
    //             "addCount": 10
    //         },
    //         {
    //             "specName": "Worker",
    //             "addCount": 2
    //         },
    //         {
    //             "specName": "SupplyDepot",
    //             "addCount": 1
    //         },
    //         {
    //             "specName": "Marine",
    //             "addCount": 1
    //         }
    //     ],
    //     "attackAtSupply": 16
    // },
]
.map(strategy => Genome.encodeGenome(strategy))
.map(genome => new Individual(genome));
