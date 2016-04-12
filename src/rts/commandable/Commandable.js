import Queue from '~/rts/util/Queue';

/** A commandable is something which can receive commands. Typically Units and Structures */
export default class Commandable {
    constructor(id, specs, position, eventReceiver) {
        this.id = id;
        this.specs = specs;
        this.position = position;
        this.eventReceiver = eventReceiver;

        this.healthLeftFactor = 1;

        this.currentCommand = false;
        this.commandQueue = new Queue();
    }

    clearCommands = () => {
        if (this.currentCommand) {
            this.currentCommand.abort();
        }
        this.commandQueue = new Queue();
    }

    isBusy = () => {
        return !!this.currentCommand;
    }

    isIdle = () => {
        return !this.isBusy();
    }

    addCommand = (command) => {
        if (this.isBusy()) {
            this.commandQueue.push(command);
        } else {
            this.currentCommand = command;
            this.currentCommand.excecute();
        }
    }

    commandCompleted = (commandId) => {
        if (this.currentCommand.id !== commandId) {
            throw `Can only complete currentCommand (${this.currentCommand.id}). Tried to complete ${commandId}`;
        }

        if (this.commandQueue.isEmpty()) {
            this.currentCommand = false;
        } else {
            this.currentCommand = this.commandQueue.next();
            this.currentCommand.excecute();
        }
    }

}
