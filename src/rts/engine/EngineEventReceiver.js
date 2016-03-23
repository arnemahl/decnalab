import Engine from '~/rts/engine/Engine';
import EventStack from '~/rts/engine/EventStack';

export default class EngineEventReceiver {

    constructor() {
        this.engine = new Engine();
        this.eventStack = new EventStack({ticker: this.engine.ticker});
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
                structureClass,
                position
            }
        }));

        this.engine.constructWithUnit(unit, structureClass, position);
    }
}
