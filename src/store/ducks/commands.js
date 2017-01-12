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

export const continueAtTick = (state, event) => {
    switch (event.type) {
        case SCHEDULED_CONTINUATION_AT_TICK: {
            if (state[event.tick]) {
                return {
                    ...state,
                    [event.tick]: [
                        ...state[event.tick],
                        event.commandIds,
                    ];
                };
            } else {
                return {
                    ...state,
                    [tick]: [
                        event.commandIds,
                    ],
                };
            };
        }
        case UNSCHEDULED_CONTINUATION_AT_TICK: {
            const { [event.tick]: atTick, ...otherTicks } = state;
            const otherCommands = atTick.filter(commandIds => commandIds.every(id => id !== event.commandId));

            if (otherCommandIds.length === 0) {
                return {
                    ...otherTicks
                };
            } else {
                return {
                    ...otherTicks,
                    [event.tick]: {
                        ...otherCommandIds
                    },
                };
            }
        }
    }
};

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
                finishedAtTick: Vectors.absoluteDistance(unit.position, targetLocation) / unitSpecs.speed,
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

            // TODO: use memoized selector (`npm install reselect`)
            state.units
                .filter(otherUnit => otherUnit.team !== unit.team)
                .filter(enemyUnit => enemyUnit.command.type === MOVE_UNIT_COMMAND)
                .map(enemyUnit => enemyUnit.command)
                .forEach(enemyMoveCommand => { // Schedule SCHEDULED_CONTINUATION_AT_TICK if movements intersect

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

                    let tick = command.startedAtTick;
                    const maxTick = Math.min(command.finishedAtTick, enemyMoveCommand.finishedAtTick);

                    for (; tick < maxTick; tick++) {
                        const unitPos = Vectors.add(command.originPosition, command.moveVector);
                        const enemyPos = Vectors.add(enemyMoveCommand.originPosition, enemyMoveCommand.moveVector);

                        if (Vectors.absoluteDistance(unitPos, enemyPos) < unitSpecs.sight) {
                            // They will see eachother at tick
                            dispatch({
                                type: SCHEDULED_CONTINUATION_AT_TICK,
                                commandIds: [
                                    command.id,
                                    enemyMoveCommand.id,
                                ],
                                tick,
                            });
                            break;
                        }
                    }
                });

            if ()
        ];
    },
    finished: (command) => {
        return (dispatch, getState) => {
            if (getState().tick.currentTick < command.finishedAtTick) {
                dispatch({
                    type: UNSCHEDULED_CONTINUATION_AT_TICK,
                    tick: command.finishedAtTick,
                    command: commandId,
                });
            }
            dispatch({
                type: UNIT_MOVED,
                unitId: command.unitId,
                vector: Vectors.scale(command.moveVector, (currentTick - command.startedAtTick)),
            });
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
