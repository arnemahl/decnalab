import * as ongoingCommands from '~/store/ducks/commands/mgmt/ongoingCommands';

import {
    UNIT_COMMAND_RECEIVED,
    UNIT_COMMAND_COMPLETED,
    UNIT_COMMANDS_CLEARED,
    UNIT_CREATED,
    UNIT_MOVED,
    UNIT_DAMAGED,
    UNIT_KILLED,
} from './units';

import {
    STRUCTURE_STARTED,
    STRUCTURE_FINISHED,
    STRUCTURE_DAMAGED,
    STRUCTURE_DESTROYED,
    STRUCTURE_COMMAND_RECEIVED,
    STRUCTURE_COMMAND_COMPLETED,
    STRUCTURE_COMMANDS_CLEARED,
} from './structures';


// Event-creators
export const start = ({ unit, unitSpecs, targetLocation, structureSpecId }) => {
    return (dispatch, getState) => {
        // What if worker needs to move first?

        const structureId = generateId(); // TODO

        // Issue command
        const command = {
            type: BUILD_STRUCTURE_COMMAND,
            id: generateId(),
            teamId: unit.teamId,
            target: {
                type: UNIT,
                id: unit.id,
            },
            startedAtTick: state.tick.currentTick,
            finishedAtTick: state.tick.currentTick + getStructureSpec(structureSpecId).cost.time,
            structureId: structureId,
        };

        dispatch({
            type: UNIT_COMMAND_RECEIVED,
            unitId: unit.id,
            commandId: command.id,
        });

        dispatch(ongoingCommands.addCommand(command.id, command.finishedAtTick));

        // Add structure to state
        dispatch({
            type: STRUCTURE_STARTED,
            structureId: structureId,
            teamId: unit.teamId,
            specId: structureSpecId,
            position: targetLocation,
        });

        // Decrement available resources
        // Keep track of planned structures
    };
};

// export const progress = (command) => {
//     return (dispatch, getState) => {
//     };
// };

export const cancel = (command) => {
    return (dispatch) => {
        dispatch(ongoingCommands.removeCommand(command.id));

        dispatch({
            type: STRUCTURE_CANCELLED,
            structureId: command.structureId,
        });
    }
}

export const finish = (command) => {
    return (dispatch, getState) => {
        dispatch(ongoingCommands.removeCommand(command.id));

        dispatch({
            type: STRUCTURE_FINISHED,
            structureId: command.structureId,
        });
    };
};
