import Vectors from '~/rts/spatial/Vectors';
import {generateUnitId} from '~/rts/units/UnitIdGenerator';

export class UnitCommander {
    constructor(unit, eventReceiver) {
        this.unit = unit;
        this.eventReceiver = eventReceiver;
    }

    move = (position) => {
        this.unit.cancelQueuedActions();

        this.unit.queuedActions = eventReceiver.moveUnit(this.unit, position);
    }

    attack = (target) => {
        this.unit.cancelQueuedActions();

        this.unit.queuedActions = eventReceiver.attackWithUnit(this.unit, target);
    }

    attackMove = (position) => {
        this.unit.cancelQueuedActions();

        this.unit.queuedActions = 
            eventReceiver.moveUnit(this.unit, position)
            .then(eventReceiver.attackWithUnit(this.unit, target));
    }
}

export default class Unit {

    constructor(stats, position) {
        this.id = generateUnitId();

        this.stats = stats;
        this.position = position;

        this.isBusy = false;
    }

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new SafeUnitCommander(this));
    }

    isAt(somePosition) {
        return Vectors.absoluteDistance(this.position, somePosition);
    }

    cancelQueuedActions = () => {
        if (this.isBusy) {
            this.isBusy = false;

            this.queuedActions.cancel();
            this.queuedActions = null;
        }
    }

}
