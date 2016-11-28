import specs from './specs';
import units from './units';
import structures from './structures';
import resources from './resources';

const team = (state, action) => {
    switch (action.type) {
        case INIT_GAME:
            return {
                specs: specs(void 0, action),
                units: teamUnitList(void 0, action),
                structures: teamStructureList(void 0, action),
                resources: specs(void 0, action),
            };
        default:
            return state;
    }
}

const teams = (state, action) => {
    switch (action.type) {
        case INIT_GAME:
            return {
                'blue': team(void 0, action),
                'red': team(void 0, action)
            };
        default:
            return state;
    }
}

const gameState = (state, action) => {
    switch (action.type) {
        case INIT_GAME:
            return {
                teams: teams(void 0, action)
            };
        default:
            throw Error('Unrecognized action: ' + action.type);
    }
}

export default gameState;
