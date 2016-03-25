
export default class TaskSchedule {
    tasks = []; // array of arrays of tasks -- works like a map with key = tick and value = tasks at tick
    lastTick = -1;

    addTask = (task, tick) => {
        tick = Math.ceil(tick);

        if (!this.tasks[tick]) {
            this.tasks[tick] = [];
        }

        this.tasks[tick].push(task);
    }

    removeTask = (taskToRemove, tick) => {
        this.tasks[tick] = this.tasks[tick].filter(task => task !== taskToRemove);

        if (this.tasks[tick].length === 0) {
            delete this.tasks[tick];
        }
    }

    getTasks = (tick) => {
        const next = this.tasks[tick];

        delete this.tasks[tick];

        return next || [];
    }

    getNextTick() {
        console.log('Object.keys(this.tasks):', Object.keys(this.tasks)); // DEBUG

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
