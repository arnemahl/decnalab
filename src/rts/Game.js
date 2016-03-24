import Engine from '~/rts/engine/Engine';
import DefaultMap from '~/rts/spatial/DefaultMap';
// import TeamVisionHelper from '~/rts/spatial/TeamVisionHelper';

import Team from '~/rts/team/Team';
import TeamAI from '~/ai/TeamAI';

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
        this.AIs = teams.map(team => new TeamAI(team));
    }

    isFinished() {
        return true; // TODO ask engine
    }

    play = () => {
        console.log('\n\n----- play -----\n');

        // TODO do stuff

        // Callbacks
        if (this.isFinished()) {
            this.onFinish(this);
        } else {
            setImmediate(this.play);
        }
    }
}
