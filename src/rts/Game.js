import TeamVisionHelper from '~/rts/spatial/TeamVisionHelper';
import DefaultMap from '~/rts/spatial/DefaultMap';
import * as TeamInitializer from '~/rts/team/TeamInitializer';
import TeamAI from '~/ai/TeamAI';

export default class Game {
    state = {
        tick: 0,
        blue: {},
        red: {}
    }

    constructor(id) {
        this.id = id;

        this.map = new DefaultMap();
        this.safeMapAcessor = this.map.getSafeAccessor();

        const teams = TeamInitializer.initializeTeams(this, this.map);
        this.state.blue.team = teams.blue;
        this.state.red.team = teams.red;

        this.teamAIs = {
            blue: new TeamAI(),
            red: new TeamAI()
        };
    }

    // finishProcesses(tick) {
    //     const onFinishedCallbacks = this.processes[tick];

    //     if (onFinishedCallbacks) {
    //         onFinishedCallbacks.forEach(callback => callback());
    //     }
    // }

    tickUnits() {
        ['blue', 'red'].forEach(color => {
            this.state[color].team.units.forEach(unit => {
                unit.tick();
            });
        });
    }

    tickStructures() {
        // TODO
    }

    updateVision() {
        const vision = TeamVisionHelper.getViewsForEachTeam({
            blueTeam: this.state.blue.team,
            redTeam: this.state.red.team
        });

        this.state.blue.vision = vision.blue;
        this.state.red.vision = vision.red;
    }

    triggerAIs() {
        ['blue', 'red'].forEach(color => {
            const teamAI = this.teamAIs[color];
            const teamState = this.state[color];
            const fullTeamState = { // TODO smartify
                vision: teamState.vision,
                ...teamState.team
            };

            teamAI.tick(fullTeamState, this.safeMapAcessor);
        });
    }

    isFinished() {
        return this.state.tick++ > 2;//18000;
    }

    play = () => {
        console.log('\n\n----- play -----\n');
        // Let all the things that should happen at this tick, happen
        // this.finishProcesses(tick);
        this.tickUnits();
        this.tickStructures();
        this.updateVision();

        this.triggerAIs();

        // Callbacks
        if (this.isFinished()) {
            this.onFinish(this);
        } else {
            setImmediate(this.play);
        }
    }
}
