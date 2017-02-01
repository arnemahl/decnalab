import Vectors from '~/rts/spatial/Vectors';
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

    attackMove = (targetPosition, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.attackMoveUnit(this.unit, targetPosition);
    }

    // attackMove = (position, waitForQueuedCommandsToComplete) => {
    //     if (!waitForQueuedCommandsToComplete) {
    //         this.eventReceiver.clearCommands(this.unit);
    //     }
    //     // TODO implement
    // }

    build = (structureSpec, position, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.buildWithUnit(this.unit, structureSpec, position);
    }
}


export default class Unit extends Commandable {
    static type = 'unit'
    type = 'unit'

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new UnitCommander(this, this.eventReceiver));
    }

    isAt = (position) => {
        return Vectors.absoluteDistance(this.position, position) < this.specs.speed;
    }

    getUnitState = () => {
        return {
            ...this.getCommandableState(),
            speed: Vectors.clone(this.currentSpeed),
            speedSetAtTick: this.speedSetAtTick,
        };
    }
    getState = () => this.getUnitState();

}
