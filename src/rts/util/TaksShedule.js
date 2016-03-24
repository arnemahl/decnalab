
export default class TaskSchedule {
    tasks = []; // array of arrays of tasks -- works like a map with key = tick and value = tasks at tick

    add = (task, tick) => {
        if (!this.tasks[tick]) {
            this.tasks[tick] = [];
        }

        this.tasks[tick].push(task);
    }

    remove = (taskToRemove, tick) => {
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
        return Object.keys(this.tasks)[0];
    }

    getNext = () => {
        const tick = this.getNextTick();

        return {
            tick,
            tasks: this.get(tick)
        };
    }

}
