import Engine from '~/rts/engine/Engine';
import DefaultMap from '~/rts/spatial/DefaultMap';

import Team from '~/rts/team/Team';
import DumbAI from '~/ai/DumbAI';

import {generateIndividual} from '~/coevolution/Coevolution';

// import * as FileWriter from '~/rts/FileWriter';

export default class Game {

    states = []
    teamIds = ['blue', 'red']
    loops = 0

    constructor(id, maxLoops, blueIndividual, redIndividual) {
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
            new DumbAI(this.teams[0], this.map, blueIndividual || generateIndividual()),
            new DumbAI(this.teams[1], this.map, redIndividual || generateIndividual()),
        ];
    }

    isFinished() {
        return this.teams.some(team => team.hasNoMoreCommandables()) || this.loops++ > this.maxLoops;
    }

    play = () => {
        // TODO do stuff
        const tick = this.engine.doTick();
        this.AIs.forEach(ai => ai.doTick(tick));

        this.states.push(this.getState());

        // Callbacks
        if (this.isFinished()) {
            const loser = this.teams.find(team => team.hasNoMoreCommandables());
            const winner = this.teams.find(team => !team.hasNoMoreCommandables());

            if (loser && winner) {
                this.engine.scoreCounter.gameOver(winner.id, loser.id, this.engine.tick);
            }

            this.ticks = this.engine.tick;
            this.finalScore = this.engine.scoreCounter.getState();
            this.onFinish(this);
        } else {
            setImmediate(this.play);
        }
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
