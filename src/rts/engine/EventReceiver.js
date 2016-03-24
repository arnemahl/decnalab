import Engine from '~/rts/engine/Engine';
import EventStack from '~/rts/engine/EventStack';

export default class EventReceiver {

    constructor() {
        this.engine = new Engine();
        this.eventStack = new EventStack({ticker: this.engine.ticker});
    }

    clearCommands = (commandable) => {
        this.eventsStack.push(JSON.stringify({
            method: 'clearCommands',
            arguments: {
                commandableId: commandable.id
            }
        }));

        this.engine.clearCommands(commandable);
    }

    arbitraryCommand = (commandable, methodName, params) => {
        this.eventStack.push(JSON.stringify({
            method: 'arbitraryCommand',
            arguments: {
                methodName,
                arguments: {
                    commandableId: commandable.id,
                    methodName,
                    params: JSON.stringify(params)
                }
            }
        }));

        this.engine.arbitraryCommand(commandable, methodName, params);
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
