
export default class Command {
    constructor(id, onExecute, onAbort) {
        this.id = id;
        this.onExecute = onExecute;
        this.onAbort = onAbort;
    }

    excecute = () => {
        if (this.isStarted) {
            throw 'Can only excecude a command once';
        }
        this.isStarted = true;
        this.onExecute();
    }

    abort = () => {
        if (!this.isStarted || this.isStopped) {
            throw 'Can only abort a command in progress.';
        }
        this.isStopped = true;
        this.onAbort();
    }
}
