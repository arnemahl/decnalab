import * as FileWriter from '~/rts/FileWriter';

import Engine from '~/rts/engine/Engine';
import DefaultMap from '~/rts/spatial/DefaultMap';
// import TeamVisionHelper from '~/rts/spatial/TeamVisionHelper';

import Team from '~/rts/team/Team';
import TeamAI from '~/ai/TeamAI';

let loops = 0;

export default class Game {

    constructor(id) {
        this.id = id;

        this.map = new DefaultMap();

        const startingResources = this.map.startingResources;
        this.teams = [
            new Team('blue', {...startingResources}),
            new Team('red', {...startingResources})
        ];

        this.engine = new Engine(this.map, this.teams);
        this.AIs = this.teams.map(team => new TeamAI(team, this.map));

        FileWriter.writeJSON('game-state-start.log', this.getState());
    }

    isFinished(/*tick*/) {
        // TODO ask engine
        // console.info('tick:', tick, '\tloops:', loops); // DEBUG
        return loops++ > 9;
    }

    play = () => {
        // console.info('\n\n----- play -----\n');

        // TODO do stuff
        const tick = this.engine.doTick();
        this.AIs.forEach(ai => ai.doTick(tick));

        // Callbacks
        if (this.isFinished(tick)) {
            FileWriter.writeJSON('game-state-end.log', this.getState());
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
