import UnitCreator from '~/rts/units/UnitCreator';
import StructureCreator from '~/rts/structures/StructureCreator';

export default class CommandableManager {
    units = {}
    structures = {}

    constructor(eventReceiver, teams, map) {
        this.unitCreator = new UnitCreator(eventReceiver);
        this.structureCreator = new StructureCreator(eventReceiver);

        const addStartingUnits = (team, units) => {
            units.forEach(item => {
                const {unitType, positions} = item;
                const unitSpec = team.unitSpecs[unitType];

                positions.forEach(position => {
                    this.addUnit(team, unitSpec, position);
                });
            });
        };
        const addStartingStructures = (team, structures) => {
            structures.forEach(item => {
                const {structureType, positions} = item;
                const structureSpec = team.structureSpecs[structureType];

                positions.forEach(position => {
                    this.addStructure(team, structureSpec, position);
                });
            });
        };

        this.teams = {};

        teams.forEach((team, index) => {
            this.teams[team.id] = team;

            addStartingUnits(team, map.startingUnits[index]);
            addStartingStructures(team, map.startingStructures[index]);
        });
    }

    addUnit(team, unitSpec, position) {
        const unit = this.unitCreator.create(unitSpec, position);
        unit.team = team;

        this.units[unit.id] = unit;
        this.teams[unit.team.id].units[unit.id] = unit;
    }

    addStructure(team, structureSpec, position, isUnderConstruction = false) {
        const structure = this.structureCreator.create(structureSpec, position);
        structure.team = team;
        structure.isUnderConstruction = isUnderConstruction;

        this.structures[structure.id] = structure;
        this.teams[structure.team.id].structures[structure.id] = structure;

        return structure;
    }

    removeUnit(unit) {
        delete this.units[unit.id];
        delete this.teams[unit.team.id].units[unit.id];
    }

    removeStructure(structure) {
        delete this.structures[structure.id];
        delete this.teams[structure.team.id].structures[structure.id];
    }

    remove(commandable) {
        this.removeUnit(commandable);
        this.removeStructure(commandable);
    }

    structureProducedUnit(structure, unitSpec, position) {
        this.addUnit(structure.team, unitSpec, position);
    }

    structureStarted(unit, structureType, position) {
        return this.addStructure(unit.team, structureType, position, true);
    }
    structureFinished(structure) {
        structure.isUnderConstruction = false;
    }
    structureCancelled(structure) {
        this.removeStructure(structure);
    }

}
