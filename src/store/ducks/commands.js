/**********************************/
/**   LIST OF ONGOING COMMANDS   **/
/**********************************/
const ADD_COMMAND = Symbol();
const REMOVE_COMMAND = Symbol();

// Reducer (NB: does not "act immutable")
export default function listOfOngoingCommands(list = [], event) {
    switch (event.type) {
        case ADD_COMMAND:
            list[event.commandId] = event.finishedAtTick;
            break;

        case REMOVE_COMMAND:
            delete list[event.commandId];
            break;

        default:
            return list;
    }
    list.UNIQUE = Symbol(); // used instead of object equality check

    return list;
}

// Selectors
import {createSelector} from 'reselect';

const ascending = (t1, t2) => t1 - t2;

const listOfOngoingCommands = state => state.listOfOngoingCommands;
const UNIQUE = state => state.listOfOngoingCommands.UNIQUE;

export const getNextTickWhenAnyCommandsFinish = createSelector(
    listOfOngoingCommands,
    UNIQUE, // ensures re-calculation of memoized method output upon list update
    listOfOngoingCommands => (
        listOfOngoingCommands.sort(ascending)[0]
    )
);

// Actions
export function addCommand(commandId, finishedAtTick) {
    return {
        type: ADD_COMMAND,
        commandId,
        finishedAtTick,
    };
}

export function removeCommand(commandId) {
    return {
        type: REMOVE_COMMAND,
        commandId,
    };
}

/****************************************/
/**   END:  LIST OF ONGOING COMMANDS   **/
/****************************************/



/**************************************/
/**   COLLISION TABLE OF ALL MOVES   **/
/**************************************/

/*
    Concept:
    Table of all moves
    x denotes interception between move on row and column

    |---|---|---|---|
    |   | 0 | 1 | 2 |
    |---|---|---|---|
    | 0 | \ | x |   |
    |---|---|---|---|
    | 1 | x | \ |   |
    |---|---|---|---|
    | 2 |   |   | \ |
    |---|---|---|---|

*/
const ADD_MOVE = Symbol();
const COLLIDING_MOVES = Symbol();
const REMOVE_MOVE = Symbol();

// Reducer (NB: does not "act immutable")
export default function tableOfAllMoves(table = {}, event) {
    const {a, b, tick} = event;

    switch (event.type) {
        case ADD_MOVE:
            // Add row for a
            table[a] = {};
            break;

        case COLLIDING_MOVES:
            // Set (a,b) and (b,a)
            table[a][b] = tick;
            table[b][a] = tick;
            break;

        case REMOVE_MOVE:
            // Delete a from all rows and columns
            Object.keys(table[a]).forEach(b => delete table[b][a]);
            delete table[a];
            break;

        default:
            return table;
    }
    table.UNIQUE = Symbol(); // used instead of object equality check

    return table;
}

// Selectors
import {createSelector} from 'reselect';

const ascending = (t1, t2) => t1 - t2;


const tableOfAllMoves = state => state.tableOfAllMoves;
const UNIQUE = state => state.tableOfAllMoves.UNIQUE;

// Get next tick (possibly undefined: when table is empty)
export const getNextTickWhenThereIsACollision = createSelector(
    tableOfAllMoves,
    UNIQUE, // ensures re-calculation of memoized method output upon table update
    tableOfAllMoves => (
        tableOfAllMoves
            .filter(row => row.length > 0)
            .map(row => values(row).sort(ascending)[0])
            .sort(ascending)[0];
    )
);

// Actions
export function addMove(commandId) {
    return {
        type: ADD_MOVE,
        a: commandId,
    };
}
export function registerCollision(oneCommandId, anotherCommandId, tick) {
    return {
        type: COLLIDING_MOVES,
        a: oneCommandId,
        b: anotherCommandId,
        tick: tick,
    };
}
export function removeMove(commandId) {
    return {
        type: REMOVE_MOVE,
        a: commandId,
    };
}


/*******************************************/
/**  END:  COLLISION TABLE OF ALL MOVES   **/
/*******************************************/



/*****************************************/
/**   KEEP TRACK OF ALL MOVE COMMANDS   **/
/*****************************************/

TODO: Sync with other events or action creators

// Reducer
export default function mapOfAllMoveCommands(map = {}, event) {
    switch (event.type) {
        case ADD_MOVE_COMMAND:
            map[command.id] = event.command;

        case REMOVE_MOVE_COMMAND:
            delete map[commandId];

        default:
            return map;

    }
    table.UNIQUE = Symbol(); // used instead of object equality check

    return table;
};

// Selectors
import {createSelector} from 'reselect';

const ascending = (t1, t2) => t1 - t2;
const values = object => Object.keys(object).map(key => object[key]);

const mapOfAllMoveCommands = state => state.mapOfAllMoveCommands;
const UNIQUE = state => state.mapOfAllMoveCommands.UNIQUE;

export const getAllMoveCommandIds = createSelector(
    mapOfAllMoveCommands,
    UNIQUE,
    mapOfAllMoveCommands => values(mapOfAllMoveCommands)
);

/***********************************************/
/**   END:  KEEP TRACK OF ALL MOVE COMMANDS   **/
/***********************************************/




/******************/
/**   Commands   **/
/******************/
import * as collisionTable from 'TODO/move/to/file';
import * as commandList from 'TODO/move/to/file';

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


// Event-creators
export const MoveCommand_v3 = {
    started: ({ unit, unitSpecs, targetLocation }) => {
        // NB: Command both given and started at the same time. Assume only one command at a time per unit.
        return (dispatch, getState) => (
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
                type: UNIT_COMMAND_RECEIVED,
                unitId: unit.id,
                commandId: command.id,
            });
            dispatch(commandList.addCommand(command.id, command.finishedAtTick))
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

            if ()
        ];
    },
    progress: (command) => {
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
                type: UNIT_COMMAND_RECEIVED,
                command: {
                    ...command,
                    startedAtTick: command.startedAtTick,
                },
            });
        };
    },
    finished: (command) => {
        return (dispatch, getState) => {
            dispatch(collisionTable.removeMove(command.id));

            dispatch({
                type: UNIT_MOVED,
                unitId: command.unitId,
                vector: Vectors.scale(command.moveVector, (currentTick - command.startedAtTick)),
            });
        };
    },
};

// Process
const UNIT = Symbol('UNIT');
const STRUCTURE = Symbol('STRUCTURE');

const progressMoveCommands = () => {
    return (dispatch, getState) => {
        const moveCommands = getAllMoveCommands(getState());

        moveCommands.forEach(move => {
            dispatch(MoveCommand_v3.progress(move));
        });
    };
}

const progressStructureCommands = () => {
    return (dispatch, getState) => {
        structureCommands.forEach(command => {
            dispatch({
                type: STRUCTURE_COMMAND_COMPLETED,
                structureId: command.target.id,
            });

            switch (command.type) {
                case TODO:
                    // TODO
                    break;
            }
            break;
        });
    };
}

const progressUnitCommands = () => {
    return (dispatch, getState) => {
        unitCommands.forEach(command => {
            dispatch({
                type: UNIT_COMMAND_COMPLETED,
                unidId: command.target.id,
            });

            switch (command.type) {
                case MOVE_UNIT_COMMAND:
                    MoveCommand_v3.finished(command);
                    break;
            }
        });
    };
}

const finishCompletedCommands = () => {
    return (dispatch, getState) => {
        // TODO
        dispatch(progressStructureCommands());
        dispatch(applyCommandEffects());

        dispatch(progressUnitCommands());
        dispatch(applyCommandEffects());
    };
}

export const progressCommands = () => {
    return (dispatch, getState) => {
        const state = getState();

        const nextCollisionTick = collisionTable.getNextTickWhenThereIsACollision(state);
        const commandStuff = commandList.getNextTickWhenAnyCommandsFinish(state);

        if (typeof nextCollisionTick !== 'undefined' && typeof commandStuff.nextTick !== 'undefined') {
            if (nextCollisionTick < commandStuff.nextTick) {
                // Progress all move commands
                dispatch(progressMoveCommands());
            } else if (nextCollisionTick > commandStuff.nextTick) {
                // Finish commands that are done
                dispatch(finishCompletedCommands());
            } else {
                // Progress all move commands
                dispatch(progressMoveCommands());
                // Finish commands that are done
                dispatch(finishCompletedCommands());
            }

        } else if (typeof nextCollisionTick !== 'undefined') {
            // Progress all move commands
            dispatch(progressMoveCommands());
        } else if (typeof commandStuff.nextTick !== 'undefined') {
            // Finish commands that are done
            dispatch(finishCompletedCommands());
        }
        // else {
        //     // Nothing to do until the players give commands
        // }
    };
};
