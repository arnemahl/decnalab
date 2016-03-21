import TeamVisionHelper from '~/rts/spatial/TeamVisionHelper';
import DefaultMap from '~/rts/spatial/DefaultMap';
import * as TeamInitializer from '~/rts/team/TeamInitializer';

export default class Game {
    tick = 0;

    constructor(id) {
        this.id = id;
        this.teams = new TeamInitializer.initializeTeams(DefaultMap);
    }

    // finishProcesses(tick) {
    //     const onFinishedCallbacks = this.processes[tick];

    //     if (onFinishedCallbacks) {
    //         onFinishedCallbacks.forEach(callback => callback());
    //     }
    // }

    moveUnits(tick) {
        const units = this.units;

        units.forEach(unit => unit.tick(tick));
    }

    updateUnitViews() {
        const {blue: blueTeam, red: redTeam} = this.teams;

        console.log('...');
        const vision = TeamVisionHelper.getViewsForEachTeam({blueTeam, redTeam});
        console.log('***');

        console.log('vision:', vision); // DEBUG
    }

    isFinished() {
        return this.tick++ > 18000;
    }

    play = () => {
        // const tick = this.ticker.nextTick();

        // Let all the things that should happen at this tick, happen
        // this.finishProcesses();
        // this.moveUnits();
        this.updateUnitViews();

        // Callbacks
        if (this.isFinished()) {
            this.onFinish(this);
        } else {
            setImmediate(this.play);
        }
    }
}
