import Vectors from '~/rts/spatial/Vectors';
import * as move from './move';

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
    STRUCTURE_PLANNED,
    STRUCTURE_STARTED,
    STRUCTURE_FINISHED,
    STRUCTURE_DAMAGED,
    STRUCTURE_DESTROYED,
    STRUCTURE_COMMAND_RECEIVED,
    STRUCTURE_COMMAND_COMPLETED,
    STRUCTURE_COMMANDS_CLEARED,
} from './structures';

import {
    RESOURCES_RESERVED,
    RESOURCES_UN_RESERVED,
} from '~/store/ducks/resources';


// Event-creators
export const issue = ({ worker, workerSpecs, targetLocation, structureSpecId }) => {
    return (dispatch, getState) => {

        if (Vectors.distance(worker.position, targetLocation) > 10) {
            dispatch(move.issue({
                unit: worker,
                unitSpecs: workerSpecs,
                targetLocation: targetLocation,
            }));
        }

        const command = {
            type: BUILD_STRUCTURE_COMMAND,
            id: generateId(),
            info: {
                issuedAtTick: getState().tick.currentTick,
            },
            target: {
                type: UNIT,
                id: worker.id,
                teamId: worker.teamId,
            },
            structure: {
                structureId: generateId(),
                teamId: worker.teamId,
                specId: structureSpecId,
                position: targetLocation,
            },
        }

        dispatch({
            type: UNIT_COMMAND_RECEIVED,
            unitId: worker.id,
            command,
        });

        dispatch({
            type: STRUCTURE_PLANNED,
            ...command.structure,
        });

        const {sparse, abundant} = structureSpecs;

        dispatch({
            type: RESOURCES_RESERVED,
            sparse,
            abundant,
        });
    };
};

export const start = (command) => {
    return (dispatch, getState) => {
        const state = getState();

        const FOO = {
            startedAtTick: state.tick.currentTick,
            finishedAtTick: state.tick.currentTick + getStructureSpec(command.structure.structureSpecId).cost.time,
        };

        dispatch(ongoingCommands.addCommand(command.id, FOO.finishedAtTick));

        dispatch({
            type: STRUCTURE_STARTED,
            structureId: command.structure.id,
        });
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
            type: UNIT_COMMAND_REMOVED,
            unitId: worker.id,
            command,
        });

        dispatch({
            type: STRUCTURE_CANCELLED,
            structureId: command.structureId,
        });

        dispatch({
            type: RESOURCES_UN_RESERVED,
            sparse,
            abundant,
        });
    };
};

export const finish = (command) => {
    return (dispatch, getState) => {
        dispatch(ongoingCommands.removeCommand(command.id));

        dispatch({
            type: UNIT_COMMAND_REMOVED,
            unitId: worker.id,
            command,
        });

        dispatch({
            type: STRUCTURE_FINISHED,
            structureId: command.structureId,
        });
    };
};
