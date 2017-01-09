import Vectors from '~/rts/spatial/Vectors';

import {
    PRODUCE_UNIT,
    PRODUCE_UPGRADE,
    MOVE,
    ATTACK,
    GATHER_RESOURCES,
    DELIVER_RESOURCES,
    BUILD_STRUCTURE,
} from './commandTypes';

import {UNIT_CREATED, UNIT_COMMAND_COMPLETED} from '~/store/ducks/units';
import {STRUCTURE_CREATED, STRUCTURE_COMMAND_COMPLETED} from '~/store/ducks/structures';

import {getTarget} from './util/action-util';
import {applyCommandEffects} from '~/store/actions/applyCommandEffects';
import {UPDATE_EVENT_ADDED} from '~/store/ducks/updateEvents';

const values = object => Object.keys(object).map(key => object[key]);

const addUpdateEvent = (update) => {
    return {
        type: UPDATE_EVENT_ADDED,
        update
    };
}

const createUpdateForStructureCommand = (structure, command) => {
    return (dispatch, getState) => {
        const {currentTick} = getState().tick;
        const {finishedAtTick} = command;

        if (command.finishedAtTick > currentTick) {
            // progress command?
        } else {
            switch (command.type) {
                // STRUCTURES
                case PRODUCE_UNIT: {
                    dispatch({
                        type: UNIT_CREATED,
                        unitId: generateId(), // TODO decide where it should live
                        teamId: structure.teamId,
                        specId: command.unitType,
                        position: structure.position,
                        // commands: [ go to rallypoint ],
                    });
                    break;
                }
                case PRODUCE_UPGRADE: {
                    command.specUpdates.forEach(specUpdate =>
                        dispatch(specUpdate)
                    );
                    break;
                }
            }
            dispatch({ type: STRUCTURE_COMMAND_COMPLETED });
        }
    }
}

const createUpdateForUnitCommand = (unit, command) => {
    return (dispatch, getState) => {
        const {currentTick, elapsed} = getState().tick; // time since last time this action-creator was dispatched

        switch (command.type) {
            case MOVE:
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

            case ATTACK: {
                if (unit.cooldownEnd < currentTick) {
                    // Unit is on cooldown and cannot attack
                    break;
                }

                const attackTarget = getTarget(command.attackTargetId);

                if (Vectors.absoluteDistance(unit.position, attackTarget.position) <= unit.weapon.range) {
                    // Too far away to attack. Move toward unit instead.
                    dispatch(addUpdateEvent({
                        type: 'DAMAGE',
                        unitId: command.attackTargetId,
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
            case GATHER_RESOURCES: {
                dispatch(addUpdateEvent(resourcesPickedUp(unit.id, command.resourceSiteId, command.resourceType)));
                break;
            }
            case DELIVER_RESOURCES: {
                dispatch(addUpdateEvent(/* RESOURCES_DROPPED_OFF */));
                break;
            }
            case BUILD_STRUCTURE: {
                dispatch(addUpdateEvent({
                    type: STRUCTURE_CREATED,
                    id: generateId(),
                    teamId: unit.teamId,
                    specId: command.structureType,
                    position: command.position,
                }));
                break;
            }
        }
        dispatch({ type: STRUCTURE_COMMAND_COMPLETED });
    };
}

const progressStructureCommands = () => {
    return (dispatch, getState) => {
        const {structures, currentTick} = getState();

        values(structures).forEach(structure => {
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

        values(units).forEach(unit => {
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
