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
/**   COLLITION TABLE OF ALL MOVES   **/
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
export default function tableOfAllMoves(table = [], event) {
    const {a, b, tick} = event;

    switch (event.type) {
        case ADD_MOVE:
            // Add row for a
            table[a] = [];
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
const values = array => Object.keys(array).map(index => array[index]);

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
/**  END:  COLLITION TABLE OF ALL MOVES   **/
/*******************************************/

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
export const moveCommand = {
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
