import Vectors from '~/rts/spatial/Vectors';
import getClosestEnemy from '~/rts/spatial/getClosestEnemy';

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
        this.team.commandablesByName
            .Worker
            .filter(worker => worker.isIdle())
            .forEach(worker => worker.getCommander().harvest(
                getClosestResourceSite(this.map, worker, 'abundant')
            ));
    }

    /*****************/
    /***   macro   ***/
    /*****************/
    macro() {
        while (true) { // eslint-disable-line
            const targetTotals = {
                'Worker': 5, // starts with 5
                'Marine': 0,
                'SupplyDepot': 0,
                'Barracks': 0,
            };

            const nextTarget =
                this.buildOrder.find(target => this.team.commandablesByName[target.specName].length < (targetTotals[target.specName] += target.addCount))
                || this.buildOrder[this.buildOrder.length - 1];

            const {specName} = nextTarget;
            const spec = this.team.allSpecs[specName];

            if (!this.canAfford(spec)) {
                return;
            }

            let availableProducers;

            if (spec.producedBy === 'Worker') {
                availableProducers = this.team.commandablesByName.Worker
                    .filter(worker => worker.commandQueue.array.every(command => command.type !== 'build'));
            } else {
                availableProducers = this.team.commandablesByName[spec.producedBy]
                    .filter(producer => !producer.isOnlyPlanned)
                    .filter(producer => !producer.isUnderConstruction)
                    .filter(producer => producer.isIdle());
            }

            if (availableProducers.length === 0) {
                return;
            }

            if (spec.producedBy === 'Worker') {
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
        const usedStructurePositions = this.team.structures.map(structure => structure.position);
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
            this.team.commandablesByName
                .Marine
                .filter(marine => marine.isIdle())
                .forEach(marine => {
                    const closestEnemy = getClosestEnemy(marine);

                    marine.getCommander().attackMove(closestEnemy.position);
                });

        } else if (this.team.usedSupply >= this.attackAtSupply) {
            // Ready to approach enemy base
            const enemySpawnPosition = this.map.unitSpawnPositions.find((_, index) => index !== this.team.index);

            this.team.commandablesByName
                .Marine
                .filter(marine => marine.isIdle())
                .forEach(marine => {
                    marine.getCommander().attackMove(enemySpawnPosition);
                });
        }
    }
}
