import Vectors from '~/rts/spatial/Vectors';

import {
    RESOURCES_PICKED_UP,
    RESOURCES_DROPPED_OFF,
} from '~/store/ducks/resourcesPickedUp';

export const UNIT_CREATED = Symbol('UNIT_CREATED');
export const UNIT_MOVED = Symbol('UNIT_MOVED');
export const UNIT_DAMAGED = Symbol('UNIT_DAMAGED');
export const UNIT_KILLED = Symbol('UNIT_KILLED');

export const UNIT_COMMAND_RECEIVED = Symbol('UNIT_COMMAND_RECEIVED');
export const UNIT_COMMAND_COMPLETED = Symbol('UNIT_COMMAND_COMPLETED');
export const UNIT_COMMANDS_CLEARED = Symbol('UNIT_COMMANDS_CLEARED');

const getUnitSpecs = (globalState, unit) => globalState.specs[unit.teamId].units[unit.specId];

const unitReducer = (globalState, state, event) => {
    switch (event.type) {
        case UNIT_CREATED:
            return {
                teamId: event.teamId,
                specId: event.specId,
                position: event.position,
                healthLeftFactor: 1,
                commands: event.commands || [],
            };
        case UNIT_MOVED:
            return {
                ...state,
                position: Vectors.add(state.position + event.vector),
            };
        case UNIT_DAMAGED:
            return {
                ...state,
                healthLeftFactor: state.healthLeftFactor - (event.damage - getUnitSpecs(globalState, state).armor),
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
        case RESOURCES_PICKED_UP:
            return {
                ...state,
                carriedResources: {
                    resourceType: event.resourceType,
                    resourceAmount: event.resourceAmount,
                },
            };
        case RESOURCES_DROPPED_OFF:
            return {
                ...state,
                carriedResources: false,
            };
        default:
            return state;
    }
};

export const units = (globalState, state = {}, event) => {
    switch (event.type) {
        case UNIT_CREATED:
        case UNIT_MOVED:
        case UNIT_DAMAGED:
        case UNIT_COMMAND_RECEIVED:
        case UNIT_COMMAND_COMPLETED:
        case UNIT_COMMANDS_CLEARED:
        case RESOURCES_PICKED_UP:
        case RESOURCES_DROPPED_OFF:
            return {
                ...state,
                [event.unitId]: unitReducer(globalState, state[event.unitId])
            };
        case UNIT_KILLED: {
            const { [event.unitId]: killed, ...remainingUnits } = state; // eslint-disable-line no-unused-vars

            return {
                ...remainingUnits
            };
        }
        default:
            return state;
    }
};
