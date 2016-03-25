import Engine from '~/rts/engine/Engine';
import DefaultMap from '~/rts/spatial/DefaultMap';
// import TeamVisionHelper from '~/rts/spatial/TeamVisionHelper';

import Team from '~/rts/team/Team';
import Foo from '~/rts/Foo';
import TeamAI from '~/ai/TeamAI';

let loops = 0;

export default class Game {

    constructor(id) {
        this.id = id;

        const map = new DefaultMap();

        const startingResources = map.startingResources;
        const teams = [
            new Team('blue', {...startingResources}),
            new Team('red', {...startingResources})
        ];
        this.asdf = teams.map(team => new Foo(team));

        this.engine = new Engine(map, teams);
        this.AIs = teams.map(team => new TeamAI(team, map));
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
            this.engine.dumpLog();
            this.asdf.forEach(foo => foo.log());
            this.onFinish(this);
        } else {
            setImmediate(this.play);
        }
    }
}
