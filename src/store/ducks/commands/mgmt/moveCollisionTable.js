/**************************************/
/**   COLLISION TABLE OF ALL MOVES   **/
/**************************************/

/*
    Concept:
    Table of all moves
    x denotes interception between move on row and column
    Below, 0 and 1 is registered as colliding

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
export default function moveCollisionTable(table = {}, event) {
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

const moveCollisionTable = state => state.commands.mgmt.moveCollisionTable;
const UNIQUE = state => moveCollisionTable(state).UNIQUE;

// Get next tick (possibly undefined: when table is empty)
export const getNextTickWhenThereIsACollision = createSelector(
    moveCollisionTable,
    UNIQUE, // ensures re-calculation of memoized method output upon update
    moveCollisionTable => (
        moveCollisionTable
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
