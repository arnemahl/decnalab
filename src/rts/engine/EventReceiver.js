import EventStack from '~/rts/engine/EventStack';

export default class EventReceiver {

    constructor(engine) {
        this.engine = engine;
        this.eventStack = new EventStack(engine.tickReader);
    }

    clearCommands = (commandable) => {
        this.eventStack.push({
            method: 'clearCommands',
            arguments: {
                commandableId: commandable.id
            }
        });

        this.engine.clearCommands(commandable);
    }

    moveUnit = (unit, targetPosition) => {
        this.eventStack.push({
            method: 'moveUnit',
            arguments: {
                unitId: unit.id,
                targetPosition
            }
        });

        this.engine.moveUnit(unit, targetPosition);
    }

    attackMoveUnit = (unit, targetPosition) => {
        this.eventStack.push({
            method: 'attackMoveUnit',
            arguments: {
                unitId: unit.id,
                targetPosition
            }
        });

        this.engine.attackMoveUnit(unit, targetPosition);
    }

    attackWithUnit = (unit, target) => {
        this.eventStack.push({
            method: 'attackWithUnit',
            arguments: {
                unitId: unit.id,
                targetId: target.id
            }
        });

        this.engine.attackWithUnit(unit, target);
    }

    harvestWithUnit = (unit, resourceSite) => {
        this.eventStack.push({
            method: 'harvestWithUnit',
            arguments: {
                unitId: unit.id,
                resourceSiteId: resourceSite.id
            }
        });

        this.engine.harvestWithUnit(unit, resourceSite);
    }

    dropOffHarvestWithUnit = (unit, baseStructure) => {
        this.eventStack.push({
            method: 'dropOffHarvestWithUnit',
            arguments: {
                unitId: unit.id,
                baseStructureId: baseStructure.id
            }
        });

        this.engine.dropOffHarvestWithUnit(unit, baseStructure);
    }

    buildWithUnit = (unit, structureSpec, position) => {
        this.eventStack.push({
            method: 'buildWithUnit',
            arguments: {
                unitId: unit.id,
                structureName: structureSpec.constructor.name,
                position
            }
        });

        this.engine.buildWithUnit(unit, structureSpec, position);
    }


    produceUnitFromStructure = (structure, unitSpec) => {
        this.eventStack.push({
            method: 'produceUnitFromStructure',
            arguments: {
                structureId: structure.id,
                unitName: unitSpec.constructor.name
            }
        });

        this.engine.produceUnitFromStructure(structure, unitSpec);
    }
}
