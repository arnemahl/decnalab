/*********************************************/
/**   KEEP TRACK OF ONGOING MOVE COMMANDS   **/
/*********************************************/

const ADD_MOVE_COMMAND = Symbol();
const REMOVE_MOVE_COMMAND = Symbol();

// Reducer
export default function ongoingMoveCommands(map = {}, event) {
    switch (event.type) {
        case ADD_MOVE_COMMAND:
            map[command.id] = event.command;

        case REMOVE_MOVE_COMMAND:
            delete map[event.commandId];

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

const ongoingMoveCommands = state => state.commands.mgmt.ongoingMoveCommands;
const UNIQUE = state => ongoingMoveCommands(state).UNIQUE;

export const getAllMoveCommandIds = createSelector(
    ongoingMoveCommands,
    UNIQUE,
    ongoingMoveCommands => values(ongoingMoveCommands)
);

// Actions
export function addMoveCommand(command) {
    return {
        type: ADD_MOVE_COMMAND,
        command,
    };
}
export function removeMoveCommand(commandId) {
    return {
        type: REMOVE_MOVE_COMMAND,
        commandId,
    };
}
