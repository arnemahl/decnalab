import EventStack from '~/rts/engine/EventStack';

export default class EventReceiver {

    constructor(engine) {
        this.engine = engine;
        this.eventStack = new EventStack(engine.tickReader);
    }

    clearCommands = (commandable) => {
        this.eventStack.push(JSON.stringify({
            method: 'clearCommands',
            arguments: {
                commandableId: commandable.id
            }
        }));

        this.engine.clearCommands(commandable);
    }

    moveUnit = (unit, targetPosition) => {
        this.eventStack.push(JSON.stringify({
            method: 'moveUnit',
            arguments: {
                unitId: unit.id,
                targetPosition
            }
        }));

        this.engine.moveUnit(unit, targetPosition);
    }

    attackWithUnit = (unit, target) => {
        this.eventStack.push(JSON.stringify({
            method: 'attackWithUnit',
            arguments: {
                unitId: unit.id,
                targetId: target.id
            }
        }));

        this.engine.attackWithUnit(unit, target);
    }

    harvestWithUnit = (unit, resourceSite) => {
        this.eventStack.push(JSON.stringify({
            method: 'harvestWithUnit',
            arguments: {
                unitId: unit.id,
                resourceSiteId: resourceSite.id
            }
        }));

        this.engine.harvestWithUnit(unit, resourceSite);
    }

    dropOffHarvestWithUnit = (unit, baseStructure) => {
        this.eventStack.push(JSON.stringify({
            method: 'dropOffHarvestWithUnit',
            arguments: {
                unitId: unit.id,
                baseStructureId: baseStructure.id
            }
        }));

        this.engine.dropOffHarvestWithUnit(unit, baseStructure);
    }

    constructWithUnit = (unit, structureClass, position) => {
        this.eventStack.push(JSON.stringify({
            method: 'constructWithUnit',
            arguments: {
                unitId: unit.id,
                structureClass, // is structureClass a string??
                position
            }
        }));

        this.engine.constructWithUnit(unit, structureClass, position);
    }
}
