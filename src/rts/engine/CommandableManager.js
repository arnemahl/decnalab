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
                    this.structureFinished(this.addStructure(team, structureSpec, position));
                });
            });
        };

        this.teams = {};

        teams.forEach((team, index) => {
            this.teams[team.id] = team;

            addStartingUnits(team, map.startingUnits[index]);
            addStartingStructures(team, map.startingStructures[index]);
            team.unitSpawnPosition = map.unitSpawnPositions[index];
        });
    }

    addUnit(team, unitSpec, position, usedSupplyAlreadyUpdated = false) {
        const unit = this.unitCreator.create(unitSpec, position);
        unit.team = team;

        this.units[unit.id] = unit;
        this.teams[unit.team.id].units[unit.id] = unit;

        team.usedSupply += usedSupplyAlreadyUpdated ? 0 : unitSpec.cost.supply;

        return unit;
    }

    addStructure(team, structureSpec, position) {
        const structure = this.structureCreator.create(structureSpec, position);
        structure.team = team;

        this.structures[structure.id] = structure;
        this.teams[structure.team.id].structures[structure.id] = structure;

        return structure;
    }

    removeUnit(unit) {
        delete this.units[unit.id];
        delete this.teams[unit.team.id].units[unit.id];

        unit.team.usedSupply -= unit.specs.cost.supply;
    }

    removeStructure(structure) {
        delete this.structures[structure.id];
        delete this.teams[structure.team.id].structures[structure.id];

        structure.team.supply -= structure.specs.providesSupply || 0;
    }

    remove(commandable) {
        this.removeUnit(commandable);
        this.removeStructure(commandable);
    }

    structureProducedUnit(structure, unitSpec) {
        return this.addUnit(structure.team, unitSpec, structure.team.unitSpawnPosition, true);
    }

    structurePlanned(unit, structureSpec, position) {
        const structure = this.addStructure(unit.team, structureSpec, position);
        structure.isOnlyPlanned = true;
        return structure;
    }
    structureStarted(structure) {
        delete structure.isOnlyPlanned;
        structure.isUnderConstruction = true;
    }
    structureFinished(structure) {
        delete structure.isUnderConstruction;
        structure.team.supply += structure.specs.providesSupply || 0;
    }
    structureCancelled(structure) {
        this.removeStructure(structure);
    }

}
