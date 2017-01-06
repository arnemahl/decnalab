import {createNewStore} from '~/store/store';

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

export function simulateGame(maxLoops = 999) {
    // Initialize game state
    const gameStore = createNewStore();

    for (let loops = 0; loops < maxLoops; loops++) {
        store.dispatch(letPlayersGiveCommands());

        // store.dispatch(processCommands());
        store.dispatch(continueCommandsInProgress()); // create a list of changes.
        store.dispatch(applyCommandEffects()); // May include (1) gained vision, (2) command completed, (3) unit/structure destroyed

        store.dispatch(proceedToNextTick());
    }
}

/** LET PLAYERS GIVE COMMANDS TO UNITS/STRUCTURES **/
const letPlayersGiveCommands = () => {
    return (dispatch, getState) => {
        const commandPerPlayer = getState().players.map(player => {
            player.giveCommands(store);
            // In player.js:
            // store.dispatch({ type: 'PLAYER_COMMAND_RECEIVED', <command> });

            // Somewhere else: Only accept if applicable (e.g. can only build structure with worker)
        });
    }
}

const getTarget = (state, targetId) => {
    // TODO move to util file
    // TODO implement
    const target = ?;

    if (!target) {
        throw Error('target does not exist:', attackTargetId);
    }

    return target;
}

const createUpdateForCommand = (unit, command) => {
    return (dispatch, getState) => {
        switch (command.type) {
            case 'MOVE':
                // Allow all movement (no collision detection or edge of map restriction)
                disptach(addUpdateEvent({
                    type: 'POSITION',
                    targetId: unit.id,
                    position: Vectors.add(
                        unit.position,
                        Vectors.scale(command.vector, elapsed)
                    )
                }));
                break;

            case 'ATTACK': {
                if (unit.cooldownEnd < currentTick) {
                    // unit is on cooldown and cannot attack
                    break;
                }

                const attackTarget = getTarget(command.attackTargetId);

                if (Vector.absoluteDistance(unit.position, attackTarget.position) <= unit.weapon.range) {
                    // Too far away to attack. Move toward unit instead.
                    dispatch(addUpdateEvent({
                        type: 'DAMAGE',
                        attackTargetId: command.attackTargetId,
                        damage: unit.weapon.damage
                    });
                } else {
                    // Attack
                    dispatch(addUpdateEvent({
                        type: 'POSITION',
                        targetId: unit.id,
                        position: Vectors.add(
                            unit.position,
                            Vectors.scale(
                                Vectors.subtract(target.position, unit.position),
                                unit.speed
                            )
                        )
                    });
                }
                break;
            }

            case 'HARVEST': {
                // TODO
                break;
            }
            case 'CONSTRUCT': {
                // TODO
                break;
            }

            // STRUCTURES
            case 'PRODUCE_UNIT': {
                // TODO
                break;
            }
        }
    };
}

const continueCommandsInProgress = () => {
    return (dispatch, getState) => {
        const {units, structures, currentTick} = getState();
        const elapsed = ?; // time since last time this action-creator was dispatched

        unit.forEach(unit => {
            const command = unit.commands[0];

            if (command) {
                dispatch(createUpdateForCommand(unit, command));
            }
        });
    }
}

/** PROCESS PLAYER COMMANDS **/
@wip @deprecated(Use continueCommandsInProgress())
const processCommands = () => {
    return (dispatch, getState) => {
        // 1. Continue progress of started commands
        // 2. Any unit/structure that finished a command -> start next (if any)
        // 3. Any destroyed units/structures -> remove unit/structure and their commands
        const {commandsInProgress, pendingCommands} = getState();

        // *** RETHINK: START ***
        commandsInProgress.map(command => {
            // 1. Create update event for command (to be applied to gameState at end of tick)
            const update = foo(gameState, command, tick, lastTick);

            dispatch({ type: 'STATE_UPDATED', update }); // May trigger (1) gained vision, (2) command completed, (3) unit/structure destroyed
        });

        (() => {
            calculateVision(state);
            calculateFihishedCommands(state);
            calculateKilled(state);
        });
        // *** RETHINK: END ***

        /*
            Take every:
                finished command ->
                    remove from ongoing
                    if pending command for unit/structure: move to ongoing
                dead unit ->
                destroyed structure ->
                    remove all actions (ongoing and pending)
        */
    }
};

/** PROCEED TO NEXT TICK WHERE "SOMETHING" HAPPENS **/
const proceedToNextTick = () => {
    return (dispatch, getState) => {
        /*
            Things that can happen are:
                - Command completes
                - One or more teams gains* vision of a enemy unit/structure (*if it already was in vision, it's not "news" and the team does not need to be informed)
                - One or more teams gets* attacked by an enemy unit (*if it already was being attacked, etc...)

            These things may be derived from other state, but it's likely more efficient to calculate in another action-creator

            Each player should be informed of the things that changed (for that player)
            Players who receive no "news" should not have any reason to dispatch new commands (but that can be up to the implementation of the player)
        */
    }
};
