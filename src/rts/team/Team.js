import Vectors from '~/rts/spatial/Vectors';

import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structures/StructureSpecs';

import {isBaseStructure} from '~/rts/structures/BaseStructure';


export default class Team {

    units = []
    structures = []
    supply = 0
    usedSupply = 0
    visibleMapSectorIds = []
    visibleEnemyCommandables = []

    constructor(id, index, startingResources) {
        this.index = index;
        this.id = id;
        this.resources = startingResources;

        this.structureSpecs = new StructureSpecs();
        this.unitSpecs = new UnitSpecs();
    }

    getClosestBaseStructure = (fromPosition) => {
        const distanceTo = baseStructure => Vectors.absoluteDistance(fromPosition, baseStructure.position);

        return (
            this.structures
                .filter(isBaseStructure)
                .sort((one, two) => distanceTo(one) - distanceTo(two))
                [0]
        );
    }

    hasNoMoreCommandables = () => {
        return this.units.length === 0
            && !this.structures.some(structure => !structure.isOnlyPlanned);
    }

    getState = () => {
        return {
            id: this.id,
            resources: {...this.resources},
            unitSpecs: this.unitSpecs.clone(),
            structureSpecs: this.structureSpecs.clone(),
            units: this.units.map(unit => unit.getState()),
            structures: this.structures.map(structure => structure.getState()),
            unitSpawnPosition: {...this.unitSpawnPosition},
            supply: this.supply,
            usedSupply: this.usedSupply,
            visibleMapSectorIds: [...this.visibleMapSectorIds],
            visibleEnemyCommandableIds: this.visibleEnemyCommandables.map(commandable => commandable.id),
        };
    }

}
