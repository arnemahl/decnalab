function ensureInteger(tick) {
    if (!Number.isInteger(tick)) {
        const error = `TickError: ${tick} is not an integer`;
        throw error;
    }
}

export default class TaskSchedule {
    tasks = []; // array of arrays of tasks -- works like a map with key = tick and value = tasks at tick
    lastTick = -1;

    addTask = (task, tick) => {
        ensureInteger(tick);

        if (!this.tasks[tick]) {
            this.tasks[tick] = [];
        }

        this.tasks[tick].push(task);
    }

    removeTask = (taskToRemove, tick) => {
        ensureInteger(tick);

        this.tasks[tick] = this.tasks[tick].filter(task => task !== taskToRemove);

        if (this.tasks[tick].length === 0) {
            delete this.tasks[tick];
        }
    }

    getTasks = (tick) => {
        ensureInteger(tick);

        const next = this.tasks[tick];

        delete this.tasks[tick];

        return next || [];
    }

    getNextTick() {
        const nextTick = Object.keys(this.tasks)[0];

        if (this.lastTick === nextTick || !nextTick) {
            this.lastTick += 1;
        } else {
            this.lastTick = parseInt(nextTick);
        }

        return this.lastTick;
    }

    getNext = () => {
        const tick = this.getNextTick();

        return {
            tick,
            tasks: this.getTasks(tick)
        };
    }

}
