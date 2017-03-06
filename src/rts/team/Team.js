import Vectors from '~/rts/spatial/Vectors';

import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structures/StructureSpecs';

import {isBaseStructure} from '~/rts/structures/BaseStructure';


export default class Team {

    units = []
    structures = []
    commandablesByName = {}
    plannedUnitsByName = {}
    supply = 0
    usedSupply = 0
    visibleMapSectorIds = []
    visibleEnemyCommandables = []
    nofActualCommandables = 0

    constructor(id, index, startingResources) {
        this.index = index;
        this.id = id;
        this.resources = startingResources;

        this.structureSpecs = new StructureSpecs();
        this.unitSpecs = new UnitSpecs();
        this.allSpecs = { ...this.unitSpecs, ...this.structureSpecs };

        this.commandablesByName = Object.keys(this.allSpecs).reduce((emptyArrForEach, name) => {
            emptyArrForEach[name] = [];

            return emptyArrForEach;
        }, {});

        this.plannedUnitsByName = Object.keys(this.allSpecs).reduce((startAtZero, name) => {
            startAtZero[name] = 0;

            return startAtZero;
        }, {});
    }

    hasNoMoreCommandables = () => {
        return this.nofActualCommandables === 0;
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
