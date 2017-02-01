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
            ...this.getCommandableState(),
            isOnlyPlanned: this.isOnlyPlanned,
            isUnderConstruction: this.isUnderConstruction,
        };
    }

}
