// Things we need in state
/*
    Units: {
        team (which it belongs to)
        stats (same for all units of same type on same team)
        health
        position
        commands: [
            [zero or more unfinished commands]: {
                type: <identifier>
                status: in progress/pending
                progress
                ...customFields
            }
        ]
    }
    Structures: {
        team (which it belongs to)
        stats (same for all structures of same type on same team)
        health
        position
        commands: (maybe)
        production: [
            [zero or more in production/queue]: {
                status: in progress/pending
                progress: (0..100% deduced from: startedAtTick + duration)
                what is produced (e.g. a unit)
            }
        ]
    }
    Resources: {
        on map (can be harvested)
        per team: [ // May not need to keep all in store, can deduce some from the others
            collected
            unspent
            reserved (when queuing a command which costs resources, the equivalent amount of resources is reserved until construction/production finishes)
            spent
        ]
    }
*/

// Things we must be able to deduce from state
/*
    For each team: {
        list of units
        list of structures
        resources (at least unspent)
        vision: units/structures of other team that are in vision
    }
*/

// Things we must know to update state
/*
    Commands: [
        [0..n]: {
            type: <identifier>
            state: in progress, pending or complete
            what unit/structure it belongs to
        }
    ]
*/

import {createNewStore} from '~/store/store';
import {initializeGame} from '~/store/actions/initializeGame';
import {progressCommands} from '~/store/actions/progressCommands';
import {letPlayersGiveCommands} from '~/store/actions/players/giveCommands';
import {proceedToNextTick} from '~/store/actions/proceedToNextTick';

export function simulateGame(maxLoops = 999) {
    // Initialize game state
    const store = createNewStore();

    store.dispatch(initializeGame());

    console.log('\nINITIALIZED', store.getState());

    for (let loops = 0; loops < maxLoops; loops++) {
        store.dispatch(progressCommands());

        store.dispatch(letPlayersGiveCommands());

        store.dispatch(proceedToNextTick());
    }

    console.log('\nDONE', store.getState());
}




// function letPlayersGiveCommands(state, eventSchedule) {
//     // selecting variables from state omitted for brevity

//     teams.forEach(teamId => {
//         const make = (thing) => {

//         }
//         const aMove = (unit, targetLocation) => {

//         }
//         macro(buildOrder, knowledge, make);
//         micro(gamePlan, knowledge, aMove);
//     });
// }

export function simulateGame_v2(maxLoops = 999) {
    // Initialize game state
    const store = createNewStore();

    store.dispatch(initializeGame());

    // Create a commandUtil, used to take and manage player commands
    const commandUtil = createCommandUtil(store);

    for (let loops = 0; loops < maxLoops; loops++) {
        // Apply state updates (setting new current tick, calculating finished commands and applying their effects)
        commandUtil.doTick();

        // Let players give commands
        letPlayersGiveCommands(store.getState(), commandUtil);
    }
}
