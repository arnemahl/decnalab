
const structureReducer = (state, action) => {
    switch (action.type) {
        case CREATE_STRUCTURE:
            return {
                // TODO
            };
        case DAMAGE_STRUCTURE:
            return {
                ...state,
                healthLeftPercentage: state.healthLeftPercentage - Math.min(0, state.damage - getUnitSpecs(state.specId).armor)
            };
        case START_PRODUCTION: // AND ONLY IF THIS STRUCTURE...
            return {
                ...state,
                producing: {
                    // what,
                    // when,
                }
            };
        case FINISH_PRODUCTION: // AND ONLY IF THIS STRUCTURE...
            return {
                ...state,
                producing: false
            };
        default:
            return state;
    }    
};

const structureList = (state, action) => {
    // action.target: Idea to easily know which reducers may be affected.
    // A bit of an antipattern in some ways, but still worth considering
    switch (action.target) {
        case STRUCTURE:
            return {
                ...state,
                [action.structureId]: structureReducer(state[action.structureId])
            };
        default:
            return state;
    }
};
