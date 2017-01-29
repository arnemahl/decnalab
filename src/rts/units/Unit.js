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

    getState = () => {
        return {
            id: this.id,
            type: this.constructor.name,
            position: {...this.position},
            healthLeftFactor: this.healthLeftFactor
        };
    }

    setState = (nextState) => {
        this.position = {...nextState.position};
        this.healthLeftFactor = nextState.healthLeftFactor;

        this.specs = this.team.unitSpecs[this.constructor.name]; // OMG. This is fucked
    }

}
