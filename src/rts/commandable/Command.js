
export default class Command {
    constructor(id, start, stop) {
        this.id = id;
        this.start = start;
        this.stop = stop;
    }

    excecute = () => {
        if (this.isStarted) {
            throw 'Can only excecude a command once';
        }
        this.isStarted = true;
        this.start();
    }

    abort = () => {
        if (!this.isStarted || this.isStopped) {
            throw 'Can only abort a command in progress.';
        }
        this.isStopped = true;
        this.stop();
    }
}
