import Unit, {UnitCommander} from './Unit';

export class WorkerCommander extends UnitCommander {

    harvest = (resourceSite) => {
        this.eventReceiver.harvestWithUnit(this.unit, resourceSite);
    }

    // deliverResources = (baseStructure) => {
    //    // hmmmmm
    // }

    build = (structureClass, position) => {
        const startBuilding = () => this.eventReceiver.buildWithUnit(this.unit, structureClass, position);
        const moveToPosition = () => this.eventReceiver.moveUnitTo(this.unit, position);

        this.unit.cancelQueuedActions();

        if (this.unit.isAt(position)) {
            this.unit.queuedActions = startBuilding();
        } else {
            this.unit.queuedActions = moveToPosition().then(startBuilding);
        }
    }
}

export default class Worker extends Unit {

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new WorkerCommander(this));
    }


}

export const isWorker = unit => unit.constructor.name === 'Worker';
