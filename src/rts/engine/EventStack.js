
export default class EventStack {
    constuctor(ticker) {
        this.ticker = ticker;
        this.eventsPerTick = {};
    }

    push = (eventString) => {
        const currentTick = this.ticker.getCurrentTick();
        const eventsAtCurrentTick = this.eventsPerTick[currentTick] || (this.eventsPerTick[currentTick] = []);

        eventsAtCurrentTick.push(eventString);
    }

    toString = () => {
        return JSON.stringify(this.eventsPerTick);
    }
}

export class ReplayEventStack {
    constuctor(string) {
        this.eventsPerTick = JSON.parse(string);
    }

    // tick = (tick) => {
    //     // TODO forward all events
    // }
}
