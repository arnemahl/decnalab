/******************************************/
/**   THE WRAPPER, MAKES THE AI SIMPLE   **/
/******************************************/
import * as player from './player';

import {UNIT_COMMAND_RECEIVED} from '~/store/ducks/units';
import {STRUCTURE_COMMAND_RECEIVED} from '~/store/ducks/structures';
import {PRODUCE_UNIT, BUILD_STRUCTURE} from './commandTypes';

/* Impelent and import selectors:
    getTeams(state)
    getUnitsForTeam(state, teamId)
    getStructuresForTeam(state, teamId)
    findMakers(state, teamId, thingToMake)
    getNofMakers(state, teamId, thingToMake)

    getResources(state, teamId)
    getPriceOfUnitsAndStructures(state, teamId)
    getUnitAndStructureCount(state, teamId)
    getIsUnderAttack(state, teamId)
    getVisionOfEnemy(state, teamId)
*/

import playerApi from '~/store/ducks/commands/player-api';

/** LET PLAYERS GIVE COMMANDS TO UNITS/STRUCTURES **/
export const letPlayersGiveCommands = (state) => {
        getTeams(state).forEach(teamId => {

            // const produceUnit = (structure, unitType) => ({
            //     type: STRUCTURE_COMMAND_RECEIVED,
            //     command: {
            //         type: PRODUCE_UNIT,
            //         unitType,
            //     },
            // });
            // const buildStructure = (unit, structureType, location) => ({
            //     type: UNIT_COMMAND_RECEIVED,
            //     command: {
            //         type: BUILD_STRUCTURE,
            //         structureType,
            //         location,
            //     },
            // });

            const unitsOnTeam = state.units.filter(unit => unit.teamId === teamId);
            const structuresOnTeam = state.structures.filter(structure => structure.teamId === teamId);

            const things = [
                'worker',
                'marine',
                'supplyDepot',
                'barracks',
            ];
            const findAllMakers = (thing) => {
                const producedBy = produces[thing]; // TODO get what produces thing
                if (producedBy === 'worker') {
                    // get workers who are not already going to build a structure
                    return unitsOnTeam
                        .filter(unit => unit.specId === 'worker') // TODO rename unit.specId to unit.type (same for structure)
                        .filter(unit => unit.commands.every(command => command.type !== BUILD_STRUCTURE)); // TODO also not if attacking?
                        // TODO sort: closeness and time until done with command
                } else {
                    // get idle structures
                    return structuresOnTeam
                        .filter(structure => structure.specId === producedBy)
                        .filter(structure => structure.commands.length === 0);
                }
            };
            const makers = things.map(thing => findAllMakers(thing));
            const nofMakers = Object.keys(makers).reduce((result, key) => {
                result[key] = makers[key].count;
            }, {});
            const usedMakers = things.map(() => 0);
            const make = (thing) => {
                switch (thing) {
                    case 'worker':
                    case 'marine': {
                        const maker = makers[usedMakers[thing]++];
                        playerApi.produceFromStructure(maker, thing);
                    }
                    case 'supplyDepot':
                    case 'barracks': {
                        const maker = makers[usedMakers[thing]++];
                        playerApi.buildStructure(maker, thing);
                    }
                }
            };

            const getUnitSpecs = (unit) => {}; // TODO

            const move = (unit, targetLocation) => {
                dispatch(playerApi.move(
                    unit,
                    getUnitSpecs(unit),
                    targetLocation,
                ));
            };

            // TODO: Implement selectors
            const getResources = (state, teamId) => {}; // TODO
            const getPriceOfUnitsAndStructures = (state, teamId) => {}; // TODO
            const getUnitAndStructureCount = (state, teamId) => {}; // TODO
            const getIsUnderAttack = (state, teamId) => {}; // TODO
            const getVisionOfEnemy = (state, teamId) => {}; // TODO

            const knowledge = {
                resources: getResources(state, teamId),
                thingCost: getPriceOfUnitsAndStructures(state, teamId),
                count: getUnitAndStructureCount(state, teamId),
                nofMakers,
                isUnderAttack: getIsUnderAttack(state, teamId),
                visionOfEnemy: getVisionOfEnemy(state, teamId),
            };

            player.macro(knowledge, make);
            player.micro(knowledge, move);
        });
}
