import Commandable from '~/rts/commandable/Commandable';

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

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new UnitCommander(this, this.eventReceiver));
    }

}
