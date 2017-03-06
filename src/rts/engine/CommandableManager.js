import UnitCreator from '~/rts/units/UnitCreator';
import StructureCreator from '~/rts/structures/StructureCreator';

export default class CommandableManager {

    constructor(eventReceiver, teams, map) {
        this.unitCreator = new UnitCreator(eventReceiver);
        this.structureCreator = new StructureCreator(eventReceiver);

        const addStartingUnits = (team, units) => {
            units.forEach(item => {
                const {unitType, positions} = item;
                const unitSpec = team.unitSpecs[unitType];

                positions.forEach(position => {
                    this.addUnit(team, unitSpec, position);
                    team.nofActualCommandables += 1;
                });
            });
        };
        const addStartingStructures = (team, structures) => {
            structures.forEach(item => {
                const {structureType, positions} = item;
                const structureSpec = team.structureSpecs[structureType];

                positions.forEach(position => {
                    this.structureFinished(this.addStructure(team, structureSpec, position));
                    team.nofActualCommandables += 1;
                });
            });
        };

        teams.forEach((team, index) => {
            addStartingUnits(team, map.startingUnits[index]);
            addStartingStructures(team, map.startingStructures[index]);
            team.unitSpawnPosition = map.unitSpawnPositions[index];
            team.enemySpawnPosition = map.unitSpawnPositions[(index + 1) % 2];
        });
    }

    addUnit(team, unitSpec, position, usedSupplyAlreadyUpdated = false) {
        const unit = this.unitCreator.create(unitSpec, position);

        unit.team = team;
        team.units.push(unit);
        team.commandablesByName[unit.constructor.name].push(unit);

        team.usedSupply += usedSupplyAlreadyUpdated ? 0 : unitSpec.cost.supply;

        return unit;
    }

    addStructure(team, structureSpec, position) {
        const structure = this.structureCreator.create(structureSpec, position);

        structure.team = team;
        team.structures.push(structure);
        team.commandablesByName[structure.constructor.name].push(structure);

        return structure;
    }

    removeUnit(unit) {
        unit.clearCommands();

        unit.team.nofActualCommandables -= 1;
        unit.team.units = unit.team.units.filter(remaining => remaining !== unit);
        unit.team.commandablesByName[unit.constructor.name] = unit.team.commandablesByName[unit.constructor.name].filter(remaining => remaining !== unit);

        unit.team.usedSupply -= unit.specs.cost.supply;
    }

    removeStructure(structure) {
        structure.clearCommands();

        structure.team.nofActualCommandables -= 1;
        structure.team.structures = structure.team.structures.filter(remaining => remaining !== structure);
        structure.team.commandablesByName[structure.constructor.name] = structure.team.commandablesByName[structure.constructor.name].filter(remaining => remaining !== structure);

        if (structure.isFinished) {
            structure.team.supply -= structure.specs.providesSupply || 0;
        }
    }

    structureProducedUnit(structure, unitSpec) {
        structure.team.nofActualCommandables += 1;
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
        structure.team.nofActualCommandables += 1;
    }
    structureFinished(structure) {
        delete structure.isUnderConstruction;
        structure.isFinished = true;
        structure.team.supply += structure.specs.providesSupply || 0;
    }
    structureCancelled(structure) {
        this.removeStructure(structure);
    }

}
