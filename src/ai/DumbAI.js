import Vectors from '~/rts/spatial/Vectors';
import Worker from '~/rts/units/Worker';

function getClosestResourceSite(map, worker, resourceType) {
    const distanceTo = resourceSite => Vectors.absoluteDistance(worker.position, resourceSite.position);

    return (
        map
        .resourceSites[resourceType]
        .sort((one, two) => distanceTo(one) - distanceTo(two))
        [0]
    );
}

export default class DumbAI {
    usedStructurePositions = [];

    constructor(team, map) {
        this.team = team;
        this.map = map;

        const {
            unitSpecs: {
                Worker,
                Marine,
            },
            structureSpecs: {
                SupplyDepot,
                // BaseStructure,
                Barracks,
            },
        } = team;

        this.buildOrder = [
            { spec: Worker, count: 9, },
            { spec: SupplyDepot, count: 1, },
            { spec: Worker, count: 10, },
            { spec: Barracks, count: 1, },
            { spec: Worker, count: 11, },
            { spec: Marine, count: Number.POSITIVE_INFINITY, },
        ];
    }

    doTick = (/*tick*/) => {
        this.macro();
        // this.micro();
        this.harvestWithIdleWorkers();
    }

    harvestWithIdleWorkers() {
        Object.values(this.team.units)
            .filter(unit => unit instanceof Worker)
            .filter(worker => worker.isIdle())
            .forEach(worker => worker.getCommander().harvest(
                getClosestResourceSite(this.map, worker, 'abundant')
            ));
    }

    /*****************/
    /***   macro   ***/
    /*****************/
    macro() {
        const commandableMap = [
            ...Object.values(this.team.units),
            ...Object.values(this.team.structures),
        ].reduce((map, commandable) => {
            const arr = map[commandable.constructor.name] || (map[commandable.constructor.name] = []);

            arr.push(commandable);

            return map;
        }, {});

        while (true) { // eslint-disable-line
            const nextTarget = this.buildOrder.find(target =>
                (commandableMap[target.spec.constructor.name] || {length: 0}).length < target.count
            );

            const {spec} = nextTarget;

            if (!this.canAfford(spec)) {
                return;
            }

            let availableProducers;

            if (spec.producedBy === Worker) {
                availableProducers = commandableMap[spec.producedBy.name]
                    .filter(worker => worker.commandQueue.array.every(command => command.type !== 'build'));
            } else {
                availableProducers = commandableMap[spec.producedBy.name]
                    .filter(producer => producer.isIdle());
            }

            if (availableProducers.length === 0) {
                return;
            }

            if (spec.producedBy === Worker) {
                availableProducers[0].getCommander().build(spec, this.getNextAvailableStructurePosition());
            } else {
                availableProducers[0].getCommander().produceUnit(spec);
            }
        }
    }

    getNextAvailableStructurePosition() {
        const isUnused = position => this.usedStructurePositions.every(usedPosition => Vectors.notEquals(position, usedPosition));
        const suggestedPositions = this.map.suggestedStructurePositions[ {blue: 'north', red: 'south'}[this.team.id] ];

        return suggestedPositions.find(isUnused);
    }

    canAfford(spec) {
        return this.team.supply - this.team.usedSupply - spec.cost.supply >= 0
            && ['abundant', 'sparse'].every(resourceType => this.team.resources[resourceType] - spec.cost[resourceType] >= 0);
    }

    /*****************/
    /***   micro   ***/
    /*****************/
    micro() {
        // // TODO
        // if (seesEnemyUnit) {
        //     // for each army-unit:
        //     // A_MOVE toward closest visible enemy unit
        // } else if (seesEnemyStructure) {
        //     // for each army-unit:
        //     // A_MOVE toward closest visible enemy strucure
        // } else if (attackTiming.count <= thingCounts[attackTiming.unit]) {
        //     // A_MOVE toward enemy base
        // }
    }
}
