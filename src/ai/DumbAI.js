import Vectors from '~/rts/spatial/Vectors';
import getClosestEnemy, {byClosenessTo, getClosestEnemyUnitWithinRange} from '~/rts/spatial/getClosestEnemy';

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

        if (strategy.buildOrder.some(x => !this.team.allSpecs[x.specName] || typeof x.addCount !== 'number')) {
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
            this.inBattleMicro(this.team.commandablesByName.Marine);
            this.inBattleMicro(this.team.commandablesByName.Firebat);

        } else if (this.team.usedSupply >= this.attackAtSupply) {
            // Ready to approach enemy base
            this.launchAttackMicro(this.team.commandablesByName.Marine);
            this.launchAttackMicro(this.team.commandablesByName.Firebat);
        } else {
            // Stop approaching enemy base
            this.abortAttackMicro(this.team.commandablesByName.Marine);
            this.abortAttackMicro(this.team.commandablesByName.Firebat);
        }
    }

    inBattleMicro = (unitList) => {
        unitList
            .filter(unit => unit.isIdle())
            .forEach(unit => {
                const enemyUnitInRange = getClosestEnemyUnitWithinRange(unit);

                if (enemyUnitInRange) {
                    unit.getCommander().attack(enemyUnitInRange);
                } else {
                    const closestEnemy = getClosestEnemy(unit);

                    unit.getCommander().attackMove(closestEnemy.position);
                }
            });
    }

    launchAttackMicro = (unitList) => {
        const {enemySpawnPosition} = this.team;

        unitList
            .filter(unit => unit.isIdle())
            .forEach(unit => {
                unit.getCommander().attackMove(enemySpawnPosition);
            });
    }

    abortAttackMicro = (unitList) => {
        unitList
            .filter(unit => unit.isBusy())
            .forEach(unit => {
                unit.clearCommands();
            });
    }
}
