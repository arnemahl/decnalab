import Engine from '~/rts/engine/Engine';
import DefaultMap from '~/rts/spatial/DefaultMap';
// import TeamVisionHelper from '~/rts/spatial/TeamVisionHelper';

import Team from '~/rts/team/Team';
import TeamAI from '~/ai/TeamAI';

let loops = 0;

export default class Game {

    constructor(id) {
        this.id = id;

        const map = new DefaultMap();

        const startingResources = map.startingResources;
        const teams = [
            new Team('blue', this, {...startingResources}),
            new Team('red', this, {...startingResources})
        ];

        this.engine = new Engine(map, teams);
        this.AIs = teams.map(team => new TeamAI(team, map));
    }

    isFinished(tick) {
        // TODO ask engine
        console.info('tick:', tick, '\tloops:', loops); // DEBUG
        return loops++ > 10;
    }

    play = () => {
        console.info('\n\n----- play -----\n');

        // TODO do stuff
        const tick = this.engine.doTick();
        this.AIs.forEach(ai => ai.doTick(tick));

        // Callbacks
        if (this.isFinished(tick)) {
            this.onFinish(this);
        } else {
            setImmediate(this.play);
        }
    }
}
