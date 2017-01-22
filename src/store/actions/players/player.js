/*********************/
/**   JUST THE AI   **/
/*********************/

const buildTarget = [
    { thing: 'worker', count: 9 },
    { thing: 'supplyDepot', count: 1 },
    { thing: 'worker', count: 10 },
    { thing: 'barracks', count: 1 },
    { thing: 'worker', count: 11 },
    { thing: 'marine', count: Number.POSITIVE_INFINITY }
];

export const macro = ({ resources, thingCost, thingCounts, nofMakers, make, }) => {
    let {sparse, abundant, supply} = resources;

    const canAfford = (thing) => (
        thingCost[thing].sparse <= sparse &&
        thingCost[thing].abundant <= abundant &&
        thingCost[thing].supply <= supply
    );
    const calcDidMake = (thing) => {
        sparse -= thingCost.sparse[thing];
        abundant -= thingCost.abundant[thing];
        supply -= thingCost.supply[thing];

        nofMakers[thing]--;

        thingCounts[thing]++;
    };

    while (true) {              // eslint-disable-line
        const nextThing = buildTarget.find(target => {
            thingCounts[target.thing] < target.count
        });

        if (canAfford(nextThing) && nofMakers[nextThing] > 0) {
            make(nextThing);
            calcDidMake(nextThing);
        } else {
            return; // nothing more we can do for now
        }
    }
};

const attackTiming = { unit: 'marine', count: 5 };

export const micro = ({ thingCounts, seesEnemyUnit, seesEnemyStructure, }) => {
    if (seesEnemyUnit) {
        // for each army-unit:
        // A_MOVE toward closest visible enemy unit
    } else if (seesEnemyStructure) {
        // for each army-unit:
        // A_MOVE toward closest visible enemy strucure
    } else if (attackTiming.count <= thingCounts[attackTiming.unit]) {
        // A_MOVE toward enemy base
    }
};

/***************************/
/**   END:  JUST THE AI   **/
/***************************/
