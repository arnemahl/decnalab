
const unitReducer = (state, action) => {
    switch (action.type) {
        case CREATE_UNIT:
            return {
                specId: action.specId,
                position: action.position,
                moveTarget: action.moveTarget
            };
        case MOVE_UNIT:
            return {
                ...state,
                position: Vectors.add(state.position + action.vector)
            };
        case DAMAGE_UNIT:
            return {
                ...state,
                healthLeftPercentage: state.healthLeftPercentage - Math.min(0, state.damage - getUnitSpecs(state.specId).armor)
            };
        default:
            return state;
    }
};

const unitList = (state, action) => {
    // action.target: Idea to easily know which reducers may be affected.
    // A bit of an antipattern in some ways, but still worth considering
    switch (action.target) {
        case UNIT:
            return {
                ...state,
                [action.unitId]: unitReducer(state[action.unitId])
            };
        default:
            return state;
    }
};
