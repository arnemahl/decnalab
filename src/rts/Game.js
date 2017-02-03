import Engine from '~/rts/engine/Engine';
import DefaultMap from '~/rts/spatial/DefaultMap';
// import TeamVisionHelper from '~/rts/spatial/TeamVisionHelper';

import Team from '~/rts/team/Team';
import DumbAI from '~/ai/DumbAI';

// import * as FileWriter from '~/rts/FileWriter';

export default class Game {

    states = []
    teamIds = ['blue', 'red']
    loops = 0

    constructor(id, maxLoops) {
        this.id = id;
        this.maxLoops = maxLoops;

        this.map = new DefaultMap();

        const startingResources = this.map.startingResources;
        this.teams = [
            new Team('blue', 0, {...startingResources}),
            new Team('red', 1, {...startingResources})
        ];

        this.engine = new Engine(this.map, this.teams);
        this.AIs = this.teams.map(team => new DumbAI(team, this.map));
    }

    isFinished(/*tick*/) {
        // TODO ask engine
        // console.info('tick:', tick, '\tloops:', loops); // DEBUG
        return this.loops++ > this.maxLoops;
    }

    play = () => {
        // console.info('\n\n----- play -----\n');

        // TODO do stuff
        const tick = this.engine.doTick();
        this.AIs.forEach(ai => ai.doTick(tick));

        this.states.push(this.getState());

        // Callbacks
        if (this.isFinished(tick)) {
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
