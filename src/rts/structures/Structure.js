import Commandable from '~/rts/commandable/Commandable';

export class StructureCommander {
    constructor(structure, eventReceiver) {
        this.structure = structure;
        this.eventReceiver = eventReceiver;
    }

    produceUnit = (unitSpec, waitForQueuedCommandsToComplete = true) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.produceUnitFromStructure(this.structure, unitSpec);
    }
}

export default class Structure extends Commandable {
    static type = 'structure'
    type = 'structure'

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new StructureCommander(this, this.eventReceiver));
    }

    getState = () => {
        return {
            id: this.id,
            type: this.constructor.name,
            position: {...this.position},
            healthLeftFactor: this.healthLeftFactor,
            isOnlyPlanned: this.isOnlyPlanned,
            isUnderConstruction: this.isUnderConstruction,
            currentCommandType: this.currentCommand ? this.currentCommand.type : 'idle',
        };
    }

    setState = (nextState) => {
        this.position = {...nextState.position};
        this.healthLeftFactor = nextState.healthLeftFactor;
        this.isOnlyPlanned = nextState.isOnlyPlanned;
        this.isUnderConstruction = nextState.isUnderConstruction;

        this.specs = this.team.structureSpecs[this.constructor.name]; // OMG. This is fucked
    }

}
