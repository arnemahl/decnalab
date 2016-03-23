import Vectors from '~/rts/spatial/Vectors';

class EventChainLink {
    constructor(fn) {
        fn(this.resolve, this.reject);
    }

    resolve() {
        if (typeof this.nextEvent === 'function') {
            this.nextEvent();
        }
    }

    reject() {
        // TODO: Cancel the rest of the chain
        // TODO: Add catch method?
    }

    then = (nextEvent) => {
        this.nextEvent = nextEvent;
    }
}

export default class Engine {

    constructor() {
        this.doAtSpecifiedTick = {};
        this.doEachTick = [];
        this.tick = 0;
        this.ticker = {
            getCurrentTick: () => this.tick
        };
    }

    // instantAction(name, realization) {
    //     const action = {
    //         name,
    //         realization,
    //         duration: 0,
    //         startAtTick: this.tick
    //     };

    // }

    // durativeAction(name, realization, duration) {
    //     const startAtTick = this.tick;
    //     const finishAtTick = startAtTick + duration;

    //     const action = {
    //         name,
    //         realization,
    //         duration,
    //         startAtTick,
    //         finishAtTick
    //     };

    //     this.doAtSpecifiedTick[finishAtTick] = action;
    // }

    doUntil(finishAtTick, onProgress) {
        this.doEachTick.push(onProgress);

        this.doAtSpecifiedTick[finishAtTick] = () => {
            this.doEachTick = this.doEachTick.filter(fn => fn !== onProgress);
        }
    }

    moveUnit = (unit, targetPosition) => {
        return new EventChainLink(next => {
            
        });
    }

    stopMovingUnit = (unit) => {
        // TODO
        // it may be difficult to stop moving a unit. Perhaps we ought to approach unit movement differently
    }

    attackWithUnit = (unit, target) => {
        return new EventChainLink((next, cancel) => {
            if (unit.isOnCooldown) {
                cancel();
                return;
            }

            Foo.applyAttack(unit, target);
            unit.isOnCooldown = true;

            const finishAt = this.tick + unit.stats.weapon.cooldown;

            this.doAtSpecifiedTick[finishAt] = () => {
                unit.isOnCooldown = false;
                next();
            };
        });
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