import Vectors from '~/rts/spatial/Vectors';
import getClosestEnemy, {byClosenessTo} from '~/rts/spatial/getClosestEnemy';

function getClosestResourceSite(map, worker, resourceType) {
    return (
        map
        .resourceSites[resourceType]
        .sort(byClosenessTo(worker.position))
        [0]
    );
}

export default class DumbAI {

    constructor(team, map, strategy) {
        this.team = team;
        this.map = map;

        this.buildOrder = strategy.buildOrder;
        this.attackAtSupply = strategy.attackAtSupply;

        const emptyTargetTotals = Object.keys(this.team.allSpecs).reduce((initCounts, name) => {
            initCounts[name] = (name === 'Worker') ? 5 : 0;
            return initCounts;
        }, {});

        this.getEmptyTargetTotals = () => ({ ...emptyTargetTotals });

        if (strategy.buildOrder.some(x => !x.specName || !x.addCount)) {
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
            const targetTotals = this.getEmptyTargetTotals();

            const nextTarget = this.buildOrder.find((target, index) => {
                const count = this.team.commandablesByName[target.specName].length
                    + this.team.plannedUnitsByName[target.specName]; // plannedUnitsByName is 0 for all sturctures, not undefined

                return count < (targetTotals[target.specName] += target.addCount) // need to make more
                    || index === this.buildOrder.length - 1; // or is last in build order
            });

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
                    .filter(producer => producer.isFinished)
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
                    availableProducers
                        .sort(byClosenessTo(structurePosition))[0]
                        .getCommander().build(spec, structurePosition);
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
            this.team.commandablesByName
                .Firebat
                .filter(firebat => firebat.isIdle())
                .forEach(firebat => {
                    const closestEnemy = getClosestEnemy(firebat);

                    firebat.getCommander().attackMove(closestEnemy.position);
                });

        } else if (this.team.usedSupply >= this.attackAtSupply) {
            // Ready to approach enemy base
            const {enemySpawnPosition} = this.team;

            this.team.commandablesByName
                .Marine
                .filter(marine => marine.isIdle())
                .forEach(marine => {
                    marine.getCommander().attackMove(enemySpawnPosition);
                });
            this.team.commandablesByName
                .Firebat
                .filter(firebat => firebat.isIdle())
                .forEach(firebat => {
                    firebat.getCommander().attackMove(enemySpawnPosition);
                });
        }
    }
}
