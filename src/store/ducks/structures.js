export const STRUCTURE_PLANNED = Symbol('STRUCTURE_PLANNED');
export const STRUCTURE_STARTED = Symbol('STRUCTURE_STARTED');
export const STRUCTURE_CANCELLED = Symbol('STRUCTURE_CANCELLED');
export const STRUCTURE_FINISHED = Symbol('STRUCTURE_FINISHED');
export const STRUCTURE_DAMAGED = Symbol('STRUCTURE_DAMAGED');
export const STRUCTURE_DESTROYED = Symbol('STRUCTURE_DESTROYED');

export const STRUCTURE_COMMAND_RECEIVED = Symbol('STRUCTURE_COMMAND_RECEIVED');
export const STRUCTURE_COMMAND_COMPLETED = Symbol('STRUCTURE_COMMAND_COMPLETED');
export const STRUCTURE_COMMANDS_CLEARED = Symbol('STRUCTURE_COMMANDS_CLEARED');

const getStructureSpecs = (globalState, structure) => globalState.specs[structure.teamId].structures[structure.specId];

const structureReducer = (globalState, state, event) => {
    switch (event.type) {
        case STRUCTURE_PLANNED:
            return {
                id: event.structureId,
                teamId: event.teamId,
                specId: event.specId,
                position: event.position,
            };
        case STRUCTURE_STARTED:
            return {
                ...state,
                healthLeftFactor: 1, // starts with 100% health
                progressFactor: 0, // progressFactor < 1 means it's under construction
            };
        case STRUCTURE_FINISHED:
            return {
                ...state,
                progressFactor: 1, // it's finished
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
        case STRUCTURE_PLANNED:
        case STRUCTURE_STARTED:
        case STRUCTURE_FINISHED:
        case STRUCTURE_DAMAGED:
        case STRUCTURE_COMMAND_RECEIVED:
        case STRUCTURE_COMMAND_COMPLETED:
        case STRUCTURE_COMMANDS_CLEARED:
            return {
                ...state,
                [event.structureId]: structureReducer(globalState, state[event.structureId], event),
            };
        case STRUCTURE_CANCELLED:
        case STRUCTURE_DESTROYED: {
            const { [event.structureId]: killed, ...remainingStructures } = state; // eslint-disable-line no-unused-vars

            return {
                ...remainingStructures
            };
        }
        default:
            return state;
    }
};
