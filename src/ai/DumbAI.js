import Vectors from '~/rts/spatial/Vectors';
import getClosestEnemy from '~/rts/spatial/getClosestEnemy';
import Worker from '~/rts/units/Worker';
import Marine from '~/rts/units/Marine';

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

        if (this.team.id === 'blue') {
            this.buildOrder = [
                { spec: Worker, count: 9, },
                { spec: SupplyDepot, count: 1, },
                { spec: Worker, count: 10, },
                { spec: Barracks, count: 1, },
                { spec: Worker, count: 11, },
                { spec: Marine, count: 1, },
                { spec: Barracks, count: 2, },
                { spec: Marine, count: 10, },
                { spec: SupplyDepot, count: 2, },
                { spec: Marine, count: Number.POSITIVE_INFINITY, },
            ];
        } else {
            this.buildOrder = [
                { spec: Worker, count: 10, },
                { spec: Barracks, count: 1, },
                { spec: Marine, count: Number.POSITIVE_INFINITY, },
            ];
        }
    }

    doTick = (/*tick*/) => {
        this.macro();
        this.micro();
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
    getAllCommandablesOfClass = (clazz) => {
        switch (clazz.type) {
            case 'unit':
                return Object.values(this.team.units)
                    .filter(unit => unit instanceof clazz);
            case 'structure':
                return Object.values(this.team.structures)
                    .filter(structure => structure instanceof clazz);
            default:
                throw Error('woot');
        }
    }
    countCommandablesWithSpec = (spec) => {
        switch (spec.type) {
            case 'unit':
                return Object.values(this.team.units)
                    .filter(unit => unit.constructor.name === spec.constructor.name)
                    .length;
            case 'structure':
                return Object.values(this.team.structures)
                    .filter(structure => structure.constructor.name === spec.constructor.name)
                    .length;
        }
    }

    macro() {
        while (true) { // eslint-disable-line
            const nextTarget = this.buildOrder.find(target => this.countCommandablesWithSpec(target.spec) < target.count);

            const {spec} = nextTarget;

            if (!this.canAfford(spec)) {
                return;
            }

            let availableProducers;

            if (spec.producedBy === Worker) {
                availableProducers = this.getAllCommandablesOfClass(spec.producedBy)
                    .filter(worker => worker.commandQueue.array.every(command => command.type !== 'build'));
            } else {
                availableProducers = this.getAllCommandablesOfClass(spec.producedBy)
                    .filter(producer => !producer.isOnlyPlanned)
                    .filter(producer => !producer.isUnderConstruction)
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
        const usedStructurePositions = Object.values(this.team.structures).map(structure => structure.position);
        const isUnused = position => usedStructurePositions.every(usedPosition => Vectors.notEquals(position, usedPosition));
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
        const marines = this.getAllCommandablesOfClass(Marine);
        const enemySpawnPosition = this.map.unitSpawnPositions.find((_, index) => index !== this.team.index);

        marines
            .filter(marine => marine.isIdle())
            .forEach(marine => {
                const closestEnemy = getClosestEnemy(marine);

                if (closestEnemy) {
                    marine.getCommander().attackMove(closestEnemy.position);
                } else {
                    marine.getCommander().attackMove(enemySpawnPosition);
                }
            });
    }
}
