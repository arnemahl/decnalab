import UnitCreator from '~/rts/units/UnitCreator';
import StructureCreator from '~/rts/structures/StructureCreator';

export default class CommandableManager {
    units = {}
    structures = {}

    constructor(eventReceiver, teams, map) {
        this.unitCreator = new UnitCreator(eventReceiver);
        this.structureCreator = new StructureCreator(eventReceiver);

        function addStartingUnits(team, units) {
            units.forEach(item => {
                const {unitType, positions} = item;

                positions.forEach(position => {
                    this.addUnit(team, unitType, position);
                });
            });
        }
        function addStartingStructures(team, structures) {
            structures.forEach(item => {
                const {structureType, positions} = item;

                positions.forEach(position => {
                    this.addStructure(team, structureType, position);
                });
            });
        }

        this.teams = {};

        teams.forEach((team, index) => {
            this.teams[team.id] = team;

            addStartingUnits(team, map.startingUnits[index]);
            addStartingStructures(team, map.startingStructures[index]);
        });
    }

    addUnit(team, unitType, position) {
        const unit = this.unitCreator.create(unitType, position);
        unit.team = team;

        this.units[unit.id] = unit;
        this.teams[unit.team.id][unit.id] = unit;
    }

    addStructure(team, structureType, position, isUnderContruction = false) {
        const structure = this.structureCreator.create(structureType, position);
        structure.team = team;
        structure.isUnderContruction = isUnderContruction;

        this.structures[structure.id] = structure;
        this.teams[structure.team.id][structure.id] = structure;

        return structure;
    }

    removeUnit(unit) {
        delete this.units[unit.id];
        delete this.teams[unit.team.id][unit.id];
    }

    removeStructure(structure) {
        delete this.structures[structure.id];
        delete this.teams[structure.team.id][structure.id];
    }

    remove(commandable) {
        this.removeUnit(commandable);
        this.removeStructure(commandable);
    }

    structureProducedUnit(structure, unitType, position) {
        this.addUnit(structure.team, unitType, position);
    }

    structureStarted(unit, structureType, position) {
        return this.addStructure(unit.team, structureType, position, true);
    }
    structureFinished(structure) {
        structure.isUnderContruction = false;
    }
    structureCancelled(structure) {
        this.removeStructure(structure);
    }

}
