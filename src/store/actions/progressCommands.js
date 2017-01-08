import Vectors from '~/rts/spatial/Vectors';

import {getTarget} from './util/action-util';
import {applyCommandEffects} from '~/store/actions/applyCommandEffects';
import {UPDATE_EVENT_ADDED} from '~/store/ducks/queuedUpdates';

const addUpdateEvent = (update) => {
    return {
        type: UPDATE_EVENT_ADDED,
        update
    };
}

const createUpdateForStructureCommand = (structure, command) => {
    return (dispatch, getState) => {
        const elapsed = getState().tick.elapsed; // time since last time this action-creator was dispatched

        switch (command.type) {
            // STRUCTURES
            case 'PRODUCE_UNIT': {
                // TODO
                break;
            }
            case 'PRDUCE_UPGRADE': {
                // TODO
                break;
            }
        }
    }
}

const createUpdateForUnitCommand = (unit, command) => {
    return (dispatch, getState) => {
        const {currentTick, elapsed} = getState().tick; // time since last time this action-creator was dispatched

        switch (command.type) {
            case 'MOVE':
                // Allow all movement (no collision detection or edge of map restriction)
                dispatch(addUpdateEvent({
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

                if (Vectors.absoluteDistance(unit.position, attackTarget.position) <= unit.weapon.range) {
                    // Too far away to attack. Move toward unit instead.
                    dispatch(addUpdateEvent({
                        type: 'DAMAGE',
                        attackTargetId: command.attackTargetId,
                        damage: unit.weapon.damage
                    }));
                } else {
                    // Attack
                    dispatch(addUpdateEvent({
                        type: 'POSITION',
                        targetId: unit.id,
                        position: Vectors.add(
                            unit.position,
                            Vectors.scale(
                                Vectors.subtract(attackTarget.position, unit.position),
                                unit.speed
                            )
                        )
                    }));
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
        }
    };
}

const progressStructureCommands = () => {
    return (dispatch, getState) => {
        const {structures, currentTick} = getState();

        structures.forEach(structure => {
            const command = structure.commands[0];

            if (command) {
                dispatch(createUpdateForStructureCommand(structure, command));
            }
        });
    }
}

const progressUnitCommands = () => {
    return (dispatch, getState) => {
        const {units, structures, currentTick} = getState();

        units.forEach(unit => {
            const command = unit.commands[0];

            if (command) {
                dispatch(createUpdateForUnitCommand(unit, command));
            }
        });
    }
}

export const progressCommands = () => {
    return (dispatch, getState) => {
        // 1. Continue progress of commands
        // 2. Any unit/structure that finished a command -> start next (if any)

        dispatch(progressStructureCommands());
        dispatch(applyCommandEffects());

        dispatch(progressUnitCommands());
        dispatch(applyCommandEffects());
    }
}
