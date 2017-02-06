
export default class EventStack {
    constructor(tickReader) {
        this.tickReader = tickReader;
        this.eventsPerTick = {};
    }

    push = (event) => {
        const currentTick = this.tickReader.getCurrentTick();
        const eventsAtCurrentTick = this.eventsPerTick[currentTick] || (this.eventsPerTick[currentTick] = []);

        eventsAtCurrentTick.push(event);
    }

    toString = () => {
        return JSON.stringify(this.eventsPerTick);
    }
}
