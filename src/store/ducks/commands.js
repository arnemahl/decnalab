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
    STRUCTURE_CREATED,
    STRUCTURE_DAMAGED,
    STRUCTURE_DESTROYED,
    STRUCTURE_COMMAND_RECEIVED,
    STRUCTURE_COMMAND_COMPLETED,
    STRUCTURE_COMMANDS_CLEARED,
} from './structures';

const UNIT = Symbol('UNIT');
const STRUCTURE = Symbol('STRUCTURE');

// Event-creators
export const moveCommand = {
    started: ({ unit, unitSpecs, targetLocation, currentTick }) => {
        // NB: Command both given and started at the same time. Assume only one command at a time per unit.
        return {
            type: UNIT_COMMAND_RECEIVED,
            unitId: unit.id,
            command: {
                type: MOVE_UNIT_COMMAND,
                startedAtTick: currentTick,
                target: {
                    type: UNIT,
                    id: unit.id
                },
                moveVector: Vectors.direction(unit.position, targetLocation, unitSpecs.speed),
            },
        };
    },
    finished: (dispatch, command) => {
        return {
            type: UNIT_MOVED,
            unitId: command.unitId,
            vector: (currentTick - command.startedAtTick) * command.moveVector,
        };
    },
};

// Process
export const progressCommands = () => {
    return (dispatch, getState) => {
        const commands = ?;// all commands that affect the state at this tick
        /*
            Move commands may be important although not finished?
            Not important:
                * production
                * construction
                * harvesting
                * cooldowns
        */

        commands.forEach(command => {
            switch (command.target.type) {
                case UNIT:
                    switch (command.info.type) {
                        case MOVE_UNIT_COMMAND: // ASSUME IT'S FINISHED
                            moveCommand.finished(command);
                            break;
                    }
                    dispatch({
                        type: UNIT_COMMAND_COMPLETED,
                        unidId: command.target.id,
                    });
                    break;
                case STRUCTURE:
                    dispatch({
                        type: STRUCTURE_COMMAND_COMPLETED,
                        structureId: command.target.id,
                    });
                    break;
            }
        });

    };
};
