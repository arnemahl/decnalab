/****************************************/
/**   KEEP TRACK OF ONGOING COMMANDS   **/
/****************************************/

const ADD_COMMAND = Symbol();
const REMOVE_COMMAND = Symbol();

// Reducer (NB: does not "act immutable")
export default function ongoingCommands(map = [], event) {
    switch (event.type) {
        case ADD_COMMAND:
            map[event.commandId] = event.finishedAtTick;
            break;

        case REMOVE_COMMAND:
            delete map[event.commandId];
            break;

        default:
            return map;
    }
    map.UNIQUE = Symbol(); // used instead of object equality check

    return map;
}

// Selectors
import {createSelector} from 'reselect';

const ascending = (t1, t2) => t1 - t2;

const ongoingCommands = state => state.commands.mgmt.ongoingCommands;
const UNIQUE = state => ongoingCommands(state).UNIQUE;

export const getNextTickWhenAnyCommandsFinish = createSelector(
    ongoingCommands,
    UNIQUE, // ensures re-calculation of memoized method output upon update
    ongoingCommands => (
        ongoingCommands.sort(ascending)[0]
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
