export const STRUCTURE_CREATED = Symbol('STRUCTURE_CREATED');
export const STRUCTURE_DAMAGED = Symbol('STRUCTURE_DAMAGED');
export const STRUCTURE_DESTROYED = Symbol('STRUCTURE_DESTROYED');

export const STRUCTURE_COMMAND_RECEIVED = Symbol('STRUCTURE_COMMAND_RECEIVED');
export const STRUCTURE_COMMAND_COMPLETED = Symbol('STRUCTURE_COMMAND_COMPLETED');
export const STRUCTURE_COMMANDS_CLEARED = Symbol('STRUCTURE_COMMANDS_CLEARED');

const getStructureSpecs = (globalState, structure) => globalState.specs[structure.teamId].structures[structure.specId];

const structureReducer = (globalState, state, event) => {
    switch (event.type) {
        case STRUCTURE_CREATED:
            return {
                teamId: event.teamId,
                specId: event.specId,
                position: event.position,
                healthLeftFactor: 1,
                commands: [],
            };
        case STRUCTURE_DAMAGED:
            return {
                ...state,
                healthLeftFactor: state.healthLeftFactor - (event.damage - getStructureSpecs(state.specId).armor),
            };
        case STRUCTURE_COMMAND_RECEIVED:
            return {
                ...state,
                commands: [
                    ...state.commands,
                    event.command
                ],
            };
        case STRUCTURE_COMMAND_COMPLETED:
            return {
                ...state,
                commands: state.commands.slice(1),
            };
        case STRUCTURE_COMMANDS_CLEARED:
            return {
                ...state,
                commands: [],
            };
        default:
            return state;
    }
};

export const structures = (globalState, state = {}, event) => {
    switch (event.type) {
        case STRUCTURE_CREATED:
        case STRUCTURE_DAMAGED:
        case STRUCTURE_COMMAND_RECEIVED:
        case STRUCTURE_COMMAND_COMPLETED:
        case STRUCTURE_COMMANDS_CLEARED:
            return {
                ...state,
                [event.targetId]: structureReducer(globalState, state[event.targetId])
            };
        case STRUCTURE_DESTROYED: {
            const { [event.targetId]: killed, ...remainingStructures } = state; // eslint-disable-line no-unused-vars

            return {
                ...remainingStructures
            };
        }
        default:
            return state;
    }
};
