import Vectors from '~/rts/spatial/Vectors';

import * as collisionTable from '~/store/ducks/commands/mgmt/moveCollisionTable';
import * as ongoingMoveCommands from '~/store/ducks/commands/mgmt/ongoingMoveCommands';
import * as ongoingCommands from '~/store/ducks/commands/mgmt/ongoingCommands';

import {
    UNIT_COMMAND_ADDED,
    UNIT_COMMAND_REMOVED,
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


// Event-creators
export const start = ({ unit, unitSpecs, targetLocation }) => {
    // NB: Command both given and started at the same time. Assume only one command at a time per unit.
    return (dispatch, getState) => {
        const state = getState();

        const command = {
            type: MOVE_UNIT_COMMAND,
            id: generateId,
            teamId: unit.teamId,
            target: {
                type: UNIT,
                id: unit.id
            },
            startedAtTick: state.tick.currentTick,
            finishedAtTick: Vectors.absoluteDistance(unit.position, targetLocation) / unitSpecs.speed + state.tick.currentTick,
            originPosition: unit.position,
            moveVector: Vectors.direction(unit.position, targetLocation, unitSpecs.speed),
            // originPosition3d: {
            //     ...unit.position,
            //     z: state.tick.currentTick,
            // },
            // targetLocation3d: {
            //     ...targetLocation,
            //     z: Vectors.absoluteDistance(unit.position, targetLocation) / unitSpecs.speed,
            // },
        };
        dispatch({
            type: UNIT_COMMAND_ADDED,
            unitId: unit.id,
            commandId: command.id,
        });
        dispatch(ongoingCommands.addCommand(command.id, command.finishedAtTick));
        dispatch(ongoingMoveCommands.addMoveCommand(command, command.finishedAtTick));
        dispatch(collisionTable.addMove(command.id));

        // TODO: use memoized selector (`npm install reselect`)
        state.units
            .filter(otherUnit => otherUnit.team !== unit.team)
            .filter(enemyUnit => enemyUnit.command.type === MOVE_UNIT_COMMAND)
            .map(enemyUnit => enemyUnit.command)
            .forEach(enemyMoveCommand => {

                /*
                    Room for performance improvement:

                    // Given 3D Vectors
                    const {
                        originPosition3d: enemyStart,
                        targetLocation3d: enemyEnd,
                    } = enemyMoveCommand;
                    const {
                        originPosition3d: unitStart,
                        targetLocation3d: unitEnd,
                    } = command;

                    Efficiently calculate intersection(s) (if any) between
                        * skewed cylinder (from unitStart to unitEnd, radius: unitSpecs.sight)
                        * line (from enemyStart to enemyEnd)
                    If there is one or more intersetions, the intersection with the lowest
                    z-coordinate is where the units will first spot eachother.
                    At that tick (z) the game must recalculate state and inform players.
                */

                let minTick = Math.min(command.startedAtTick, enemyMoveCommand.startedAtTick);
                const maxTick = Math.min(command.finishedAtTick, enemyMoveCommand.finishedAtTick);

                for (let tick = minTick; tick < maxTick; tick++) {
                    const unitPos = Vectors.add(
                        command.originPosition,
                        Vectors.scale(command.moveVector, tick - command.startedAtTick)
                    );
                    const enemyPos = Vectors.add(
                        enemyMoveCommand.originPosition,
                        Vectors.scale(enemyMoveCommand.moveVector, tick - enemyMoveCommand.startedAtTick)
                    );

                    if (Vectors.absoluteDistance(unitPos, enemyPos) < unitSpecs.sight) {
                        // They will see eachother at `tick`
                        dispatch(collisionTable.registerCollision(command.id, enemyMoveCommand.id, tick));
                        break;
                    }
                }
            });
    };
};

export const progress = (command) => {
    return (dispatch, getState) => {
        // Move unit
        dispatch({
            type: UNIT_MOVED,
            unitId: command.unitId,
            vector: Vectors.scale(command.moveVector, (currentTick - command.startedAtTick)),
        });
        // "Change startedAtTick for command" (actually removing and adding it back with new startedAtTick)
        dispatch({
            type: UNIT_COMMANDS_CLEARED,
        });
        dispatch({
            type: UNIT_COMMAND_ADDED,
            command: {
                ...command,
                startedAtTick: command.startedAtTick,
            },
        });
    };
};

export const finish = (command) => {
    return (dispatch, getState) => {
        dispatch({
            type: UNIT_COMMANDS_CLEARED,
        });

        dispatch(collisionTable.removeMove(command.id));
        dispatch(ongoingCommands.removeCommand(command.id));
        dispatch(ongoingMoveCommands.removeMoveCommand(command.id));

        dispatch({
            type: UNIT_MOVED,
            unitId: command.unitId,
            vector: Vectors.scale(command.moveVector, (currentTick - command.startedAtTick)),
        });
    };
};
