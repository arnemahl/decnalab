import Vectors from '~/rts/spatial/Vectors';

export default class Engine {

    constructor() {
        this.doAtSpecifiedTick = {};
        this.doEachTick = [];
        this.tick = 0;
        this.ticker = {
            getCurrentTick: () => this.tick
        };
    }

    // doUntil(finishAtTick, onProgress) {
    //     this.doEachTick.push(onProgress);

    //     this.doAtSpecifiedTick[finishAtTick] = () => {
    //         this.doEachTick = this.doEachTick.filter(fn => fn !== onProgress);
    //     }
    // }

    cancelQueuedActions = (commandable) => {
        commandable.queuedActions = [];
        commandable.isBusy = false;
    }

    moveUnit = (unit, targetPosition) => {
        if (unit.isBusy) {
            unit.queuedActions.push(() => this.moveUnit(unit, targetPosition));
            return;
        }

        unit.isBusy = true;

        if (Vectors.absoluteDistance(unit.position, targetPosition) < 50) {
            unit.isBusy = false;

            if (unit.queuedActions.length > 0) {
                unit.queuedActions.slice
            }
            return;
        }

        unit.currentSpeed = Vectors.getDirection(unit.position, targetPosition, unit.stats.speed);
    }

    attackWithUnit = (unit, target) => {
        if (unit.isOnCooldown) {
            return;
        }

        unit.isOnCooldown = true;
        unit.stop = cancel;

        Foo.applyAttack(unit, target);

        const finishAt = this.tick + unit.stats.weapon.cooldown;

        this.doAtSpecifiedTick[finishAt] = () => {
            unit.isOnCooldown = false;
            finish();
        };
    }

    harvestWithUnit = (unit, resourceSite) => {

    }

    dropOffHarvestWithUnit = (unit, baseStructure) => {

    }

    constructWithUnit = (unit, structure, position) => {

    }

    tick = (tickNo) => {

    }
}