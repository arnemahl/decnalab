// TODO move definitions
const structures = [
    'SupplyDepot',
    'Barracks',
];
const units = [
    'Worker',
    'Marine',
];
const dependencies = {
    'Marine': 'Barracks'
};

const getLastIn = array => array[array.length - 1];
const flatMap = (flattenedArray, nextArray) => flattenedArray.concat(nextArray);

export function fixBuildOrderByFiltering(strategy) {
    let fixedBuildOrder = strategy.buildOrder.slice();

    // Don't let structure be last thing in build order
    while (fixedBuildOrder.length > 0 && structures.indexOf(getLastIn(fixedBuildOrder).specName) !== -1) {
        fixedBuildOrder.pop();
    }

    // Filter out targets with unmet dependencies
    fixedBuildOrder =
        fixedBuildOrder
            .filter((target, index) => {
                const dependency = dependencies[target.specName];

                const dependencyIndex = fixedBuildOrder.findIndex(target => target.specName === dependency);

                return !dependency
                    || 0 <= dependencyIndex && dependencyIndex < index;
            });

    // Filter out units that cant be made due to supply cap
    let availableSupply = 12;
    let usedSupply = 5;

    fixedBuildOrder =
        fixedBuildOrder
            .filter(target => {
                if (target.specName === 'SupplyDepot') {
                    availableSupply += 10; // TODO use spec
                } else if (units.indexOf(target.specName) !== -1) {
                    usedSupply += 1; // TODO use spec
                }

                return usedSupply <= availableSupply;
            });

    // Don't let structure be last thing in build order
    while (fixedBuildOrder.length > 0 && structures.indexOf(getLastIn(fixedBuildOrder).specName) !== -1) {
        fixedBuildOrder.pop();
    }

    return {
        ...strategy,
        buildOrder: fixedBuildOrder,
    };
}

export function fixBuildOrderByInsertion(strategy) {
    let fixedBuildOrder = strategy.buildOrder.slice();

    // Don't let structure be last thing in build order
    while (fixedBuildOrder.length > 0 && structures.indexOf(getLastIn(fixedBuildOrder).specName) !== -1) {
        fixedBuildOrder.pop();
    }

    // Insert missing dependencies
    fixedBuildOrder =
        fixedBuildOrder
            .filter((target, index) => {
                const dependency = dependencies[target.specName];

                const dependencyIndex = fixedBuildOrder.findIndex(target => target.specName === dependency);

                return (!dependency || 0 <= dependencyIndex && dependencyIndex < index)
                    ? [ target ]
                    : [
                        { specName: dependency, addCount: 1},
                        target,
                    ];
            })
            .reduce(flatMap, []);

    // Insert SupplyDepot when necessary (not fixing supply cap when making infinite of last unit)
    let availableSupply = 12;
    let usedSupply = 5;

    fixedBuildOrder =
        fixedBuildOrder
            .map(target => {
                if (target.specName === 'SupplyDepot') {
                    availableSupply += 10; // TODO use spec
                } else if (units.indexOf(target.specName) !== -1) {
                    usedSupply += 1; // TODO use spec
                }

                const addDepot = usedSupply > availableSupply;

                if (addDepot) {
                    availableSupply += 10;
                }

                return !addDepot
                    ? [ target ]
                    : [
                        { specName: 'SupplyDepot', addCount: 1 },
                        target,
                    ];
            })
            .reduce(flatMap, []);

    // // Add extra SupplyDepots
    // const lastTarget = getLastIn(fixedBuildOrder);

    // lastTarget.addCount += availableSupply - usedSupply;

    // for (i = 0; i < 2; i++) {
    //     fixedBuildOrder.push({
    //         specName: 'SupplyDepot',
    //         addCount: 1
    //     });
    //     fixedBuildOrder.push({
    //         specName: lastTarget.specName,
    //         addCount: 10
    //     });
    // }

    return {
        ...strategy,
        buildOrder: fixedBuildOrder,
    };
}


/*********************************/
/*  Used in Game.js for testing  */
/*********************************/
import { generateGenome, decodeGenome } from './genome';

export function getRandomStrategy() {
    const strategy = fixBuildOrder(decodeGenome(generateGenome()));

    console.log(`Generated strategy:`, strategy);

    return strategy;
}
