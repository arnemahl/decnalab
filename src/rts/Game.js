import Engine from '~/rts/engine/Engine';
import DefaultMap from '~/rts/spatial/DefaultMap';

import Team from '~/rts/team/Team';
import DumbAI from '~/ai/DumbAI';

import {generateGenome} from '~/coevolution/individual/generateGenome';

export default class Game {

    states = []
    teamIds = ['blue', 'red']
    loops = 0

    constructor(id, maxLoops, blueAiConfig, redAiConfig) {
        this.id = id;
        this.maxLoops = maxLoops;

        this.map = new DefaultMap();

        const startingResources = this.map.startingResources;
        this.teams = [
            new Team('blue', 0, {...startingResources}),
            new Team('red', 1, {...startingResources})
        ];

        this.engine = new Engine(this.map, this.teams);
        this.AIs = [
            new DumbAI(this.teams[0], this.map, blueAiConfig || generateGenome()),
            new DumbAI(this.teams[1], this.map, redAiConfig || generateGenome()),
        ];
    }

    isFinished() {
        return this.teams.some(team => team.hasNoMoreCommandables()) || this.loops++ > this.maxLoops;
    }
    doTick = () => {
        const tick = this.engine.doTick();
        this.AIs.forEach(ai => ai.doTick(tick));
    }

    simulate() {
        do {
            this.doTick();
        } while (!this.isFinished());

        this.saveFinalState();
    }
    simulateAndStoreEveryState() {
        do {
            this.doTick();
            this.states.push(this.getState());
        } while (!this.isFinished());

        this.saveFinalState();
    }

    saveFinalState() {
        const loser = this.teams.find(team => team.hasNoMoreCommandables());
        const winner = this.teams.find(team => !team.hasNoMoreCommandables());

        if (loser && winner) {
            this.engine.scoreCounter.gameOver(winner.id, loser.id, this.engine.tick);
        }

        this.finalTick = this.engine.tick;
        this.finalScore = this.engine.scoreCounter.getState();
        this.finalState = this.getState();
    }

    getState = () => {
        return {
            id: this.id,
            tick: this.engine.tick,
            teams: this.teams.map(team => team.getState()),
            map: this.map.getState()
        };
    }
}
