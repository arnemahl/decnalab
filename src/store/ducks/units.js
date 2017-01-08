export const UNIT_CREATED = Symbol('UNIT_CREATED');
export const UNIT_MOVED = Symbol('UNIT_MOVED');
export const UNIT_DAMAGED = Symbol('UNIT_DAMAGED');

export const UNIT_COMMAND_RECEIVED = Symbol('UNIT_COMMAND_RECEIVED');
export const UNIT_COMMAND_COMPLETED = Symbol('UNIT_COMMAND_COMPLETED');
export const UNIT_COMMANDS_CLEARED = Symbol('UNIT_COMMANDS_CLEARED');

const unitReducer = (state, event) => {
    switch (event.type) {
        case UNIT_CREATED:
            return {
                specId: event.specId,
                position: event.position,
                healthLeftFactor: 1,
                commands: [],
            };
        case UNIT_MOVED:
            return {
                ...state,
                position: Vectors.add(state.position + event.vector),
            };
        case UNIT_DAMAGED:
            return {
                ...state,
                healthLeftFactor: state.healthLeftFactor - (event.damage - getUnitSpecs(state.specId).armor),
            };
        case UNIT_COMMAND_RECEIVED:
            return {
                ...state,
                commands: [
                    ...state.commands,
                    event.command
                ],
            };
        case UNIT_COMMAND_COMPLETED:
            return {
                ...state,
                commands: state.commands.slice(1),
            };
        case UNIT_COMMANDS_CLEARED:
            return {
                ...state,
                commands: [],
            };
        default:
            return state;
    }
};

export const units = (state = {}, event) => {
    switch (event.type) {
        case UNIT_CREATED:
        case UNIT_MOVED:
        case UNIT_DAMAGED:
        case UNIT_COMMAND_RECEIVED:
        case UNIT_COMMAND_COMPLETED:
        case UNIT_COMMANDS_CLEARED:
            return {
                ...state,
                [event.targetId]: unitReducer(state[event.targetId])
            };
        case UNIT_KILLED: {
            const { [event.targetId]: killed, ...remainingUnits } = state;

            return {
                ...remainingUnits
            };
        }
        default:
            return state;
    }
};
