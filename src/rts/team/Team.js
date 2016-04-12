import Vectors from '~/rts/spatial/Vectors';

import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structures/StructureSpecs';

// import UnitCreator // TODO import

import {isBaseStructure} from '~/rts/structures/BaseStructure';


export default class Team {

    units = {}
    structures = {}
    supply = 0
    usedSupply = 0

    constructor(id, startingResources) {
        this.id = id;
        this.resources = startingResources;

        this.structureSpecs = new StructureSpecs();
        this.unitSpecs = new UnitSpecs();
    }

    getClosestBaseStructure = (fromPosition) => {
        const distanceTo = baseStructure => Vectors.absoluteDistance(fromPosition, baseStructure.position);

        return (
            Object.values(this.structures)
                .filter(isBaseStructure)
                .sort((one, two) => distanceTo(one) - distanceTo(two))
                [0]
        );
    }

    getState = () => {
        const mapToStates = object => Object.values(object).map(commandable => commandable.getState());

        return {
            id: this.id,
            resources: {...this.resources},
            unitSpecs: this.unitSpecs.clone(),
            structureSpecs: this.structureSpecs.clone(),
            units: mapToStates(this.units),
            structures: mapToStates(this.structures),
            unitSpawnPosition: {...this.unitSpawnPosition},
            supply: this.supply,
            usedSupply: this.usedSupply
        };
    }

}
