import Commandable from '~/rts/commandable/Commandable';
import {generateUnitId} from '~/rts/units/UnitIdGenerator'; // TODO don't do this here

export class UnitCommander {
    constructor(unit, eventReceiver) {
        this.unit = unit;
        this.eventReceiver = eventReceiver;
    }

    move = (position, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.moveUnit(this.unit, position);
    }

    attack = (target, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.attackWithUnit(this.unit, target);
    }

    // attackMove = (position, waitForQueuedCommandsToComplete) => {
    //     if (!waitForQueuedCommandsToComplete) {
    //         this.eventReceiver.clearCommands(this.unit);
    //     }
    //     // TODO implement
    // }
}


export default class Unit extends Commandable {
    constructor(specs, position) {
        this.id = generateUnitId(); // TODO receive ID from outside

        this.specs = specs;
        this.position = position;

        this.healthLeftFactor = 1;
    }

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new UnitCommander(this, this.game.eventReceiver));
    }

}
