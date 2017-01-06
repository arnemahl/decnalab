
const unitReducer = (state, event) => {
    switch (event.type) {
        case 'CREATE':
            return {
                specId: event.specId,
                position: event.position,
                // TODO should set receive a target position to move to (as Command?)
            };
        case 'MOVE':
            return {
                ...state,
                position: Vectors.add(state.position + event.vector)
            };
        case 'DAMAGE':
            return {
                ...state,
                healthLeftPercentage: state.healthLeftPercentage - (event.damage - getUnitSpecs(state.specId).armor)
            };
        default:
            return state;
    }
};

const unitList = (state, event) => {
    // event.target: Idea to easily know which reducers may be affected.
    // A bit of an antipattern in some ways, but still worth considering
    switch (event.target) {
        case UNIT:
            return {
                ...state,
                [event.targetId]: unitReducer(state[event.targetId])
            };
        default:
            return state;
    }
};
