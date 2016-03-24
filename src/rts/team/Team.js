import Vectors from '~/rts/spatial/Vectors';

import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structure/StructureSpecs';

import {isBaseStructure} from '~/rts/structures/BaseStructure';


export default class Team {

    units = {}
    structures = {}

    constructor(id, game, startingResources) {
        this.id = id;
        this.game = game;
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

}
