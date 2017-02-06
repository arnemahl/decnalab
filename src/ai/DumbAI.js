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

    constructor(team, map, individual) {
        this.team = team;
        this.map = map;

        this.buildOrder = individual.buildOrder;
        this.attackAtSupply = individual.attackAtSupply;

        if (individual.buildOrder.some(x => !x.specName || !x.addCount)) {
            throw Error('BUILD ORDER CONTAINS INVAILD TARGET');
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
    getSpecByName = (specName) => {
        const spec = this.team.unitSpecs[specName] || this.team.structureSpecs[specName];

        if (!spec) {
            throw Error(`No spec found for ${specName}`);
        }

        return spec;
    }
    countCommandablesWithSpecName = (specName) => {
        const spec = this.getSpecByName(specName);

        switch (spec.type) {
            case 'unit':
                return Object.values(this.team.units)
                    .filter(unit => unit.constructor.name === specName)
                    .length;
            case 'structure':
                return Object.values(this.team.structures)
                    .filter(structure => structure.constructor.name === specName)
                    .length;
        }
    }

    macro() {
        while (true) { // eslint-disable-line
            const targetTotals = {
                'Worker': 5, // starts with 5
                'Marine': 0,
                'SupplyDepot': 0,
                'Barracks': 0,
            };

            const nextTarget =
                this.buildOrder.find(target => this.countCommandablesWithSpecName(target.specName) < (targetTotals[target.specName] += target.addCount))
                || this.buildOrder[this.buildOrder.length - 1];

            const spec = this.getSpecByName(nextTarget.specName);

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
                // In case the last thing in Build order is  a structure, AI will continue making more of that
                // structure for ever. No value in supporting that, just stop when running out of space.
                const structurePosition = this.getNextAvailableStructurePosition();

                if (!structurePosition) {
                    return; // End infinite loop
                } else {
                    availableProducers[0].getCommander().build(spec, structurePosition);
                }
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
        if (this.team.visibleEnemyCommandables.length > 0) {
            // Probably already in battle, go for it
            this.getAllCommandablesOfClass(Marine)
                .filter(marine => marine.isIdle())
                .forEach(marine => {
                    const closestEnemy = getClosestEnemy(marine);

                    marine.getCommander().attackMove(closestEnemy.position);
                });

        } else if (this.team.usedSupply >= this.attackAtSupply) {
            // Ready to approach enemy base
            const enemySpawnPosition = this.map.unitSpawnPositions.find((_, index) => index !== this.team.index);

            this.getAllCommandablesOfClass(Marine)
                .filter(marine => marine.isIdle())
                .forEach(marine => {
                    marine.getCommander().attackMove(enemySpawnPosition);
                });
        }
    }
}
