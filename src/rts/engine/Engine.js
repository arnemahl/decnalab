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

    attackWithUnit = (unit, target) => {
        return new EventChainLink((finish, cancel) => {
            if (unit.isOnCooldown) {
                cancel();
                return;
            }

            if (unit.isBusy) {
                unit.isBusy = false;
                unit.stop();
            }

            unit.isOnCooldown = true; // Unit is not busy, just on cooldown
            unit.stop = cancel;

            Foo.applyAttack(unit, target);

            const finishAt = this.tick + unit.stats.weapon.cooldown;

            this.doAtSpecifiedTick[finishAt] = () => {
                unit.isOnCooldown = false;
                finish();
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