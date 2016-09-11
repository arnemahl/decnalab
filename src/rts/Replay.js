import DefaultMap from '~/rts/spatial/DefaultMap';
import ReplayTeam from '~/rts/replay/ReplayTeam';

export default class Replay {

    map = new DefaultMap()
    teams = {}

    constructor(gameId, teamIds, allStates) {
        this.gameId = gameId;
        this.allStates = allStates;

        teamIds.forEach(teamId => {
            this.teams[teamId] = new ReplayTeam(teamId);
        });

        console.log('this.allStates.length:', this.allStates.length); // DEBUG

        this.setCurrentState(0);
    }

    isValid(index) {
        return 0 <= index && index < this.allStates.length;
    }

    setCurrentState(index) {
        if (!this.isValid(index)) {
            return false;
        }

        this.currentIndex = index;
        const currentState = this.allStates[index];

        currentState.teams.map(teamState => {
            const {id, ...state} = teamState;

            this.teams[id].setState(state);
        });
        this.map.setState(currentState.map);

        return true;
    }

    forward = (step = 1) => {
        return this.setCurrentState(this.currentIndex + step);
    }
    rewind = (step = 1) => {
        return this.setCurrentState(this.currentIndex - step);
    }

}
