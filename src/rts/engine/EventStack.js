
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

export class ReplayEventStack {
    constructor(string) {
        this.eventsPerTick = JSON.parse(string);
    }

    // tick = (tick) => {
    //     // TODO forward all events
    // }
}
