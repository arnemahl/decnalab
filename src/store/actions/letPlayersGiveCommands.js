const buildTarget = [
    { thing: 'worker', count: 9 },
    { thing: 'supplyDepot', count: 1 },
    { thing: 'worker', count: 10 },
    { thing: 'barracks', count: 1 },
    { thing: 'worker', count: 11 },
    { thing: 'marine', count: Number.POSITIVE_INFINITY }
];

const macro = ({ resources, thingCost, thingCounts, nofMakers, make, }) => {
    let {sparse, abundant, supply} = resources;

    const canAfford = (thing) => (
        thingCost[thing].sparse <= sparse &&
        thingCost[thing].abundant <= abundant &&
        thingCost[thing].supply <= supply
    );
    const calcDidMake = (thing) => {
        sparse -= thingCost.sparse[thing];
        abundant -= thingCost.abundant[thing];
        supply -= thingCost.supply[thing];

        nofMakers[thing]--;

        thingCounts[thing]++;
    };

    while (true) {              // eslint-disable-line
        const nextThing = buildTarget.find(target => {
            thingCounts[target.thing] < target.count
        });

        if (canAfford(nextThing) && nofMakers[nextThing] > 0) {
            make(nextThing);
            calcDidMake(nextThing);
        } else {
            return; // nothing more we can do for now
        }
    }
};

const attackTiming = { unit: 'marine', count: 5 };

const micro = ({ thingCounts, seesEnemyUnit, seesEnemyStructure, }) => {
    if (seesEnemyUnit) {
        // for each army-unit:
        // A_MOVE toward closest visible enemy unit
    } else if (seesEnemyStructure) {
        // for each army-unit:
        // A_MOVE toward closest visible enemy strucure
    } else if (attackTiming.count <= thingCounts[attackTiming.unit]) {
        // A_MOVE toward enemy base
    }
};

const givePlayerCommands = (knowledge) => {
    macro(knowledge);
    micro(knowledge);
}

import {UNIT_COMMAND_RECEIVED} from '~/store/ducks/units';
import {STRUCTURE_COMMAND_RECEIVED} from '~/store/ducks/structures';
import {PRODUCE_UNIT, BUILD_STRUCTURE} from './commandTypes';

/** LET PLAYERS GIVE COMMANDS TO UNITS/STRUCTURES **/
export const letPlayersGiveCommands = () => {
    return (dispatch, getState) => {
        const state = getState();

        state.players.map(teamId => {

            const produceUnit = (structure, unitType) => ({
                type: STRUCTURE_COMMAND_RECEIVED,
                command: {
                    type: PRODUCE_UNIT,
                    unitType,
                },
            });
            const buildStructure = (unit, structureType, location) => ({
                type: UNIT_COMMAND_RECEIVED,
                command: {
                    type: BUILD_STRUCTURE,
                    structureType,
                    location,
                },
            });

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
                        dispatch(produceUnit(maker, thing));
                    }
                    case 'supplyDepot':
                    case 'barracks': {
                        const maker = makers[usedMakers[thing]++];
                        dispatch(buildStructure(maker, thing, location)); // TODO get location
                    }
                }
            };

            // TODO: Implement selectors
            const getResources = (state, teamId) => {}; // TODO
            const getPriceOfUnitsAndStructures = (state, teamId) => {}; // TODO
            const getUnitAndStructureCount = (state, teamId) => {}; // TODO
            const getIsUnderAttack = (state, teamId) => {}; // TODO
            const getVisionOfEnemy = (state, teamId) => {}; // TODO

            givePlayerCommands({
                // buildTarget: state.buildTarget, // put in store when it's being generated by EA-algorithm
                resources: getResources(state, teamId),
                thingCost: getPriceOfUnitsAndStructures(state, teamId),
                count: getUnitAndStructureCount(state, teamId),
                nofMakers,
                make,
                isUnderAttack: getIsUnderAttack(state, teamId),
                visionOfEnemy: getVisionOfEnemy(state, teamId),
            });
        });
    }
}
