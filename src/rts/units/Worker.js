import Unit, {UnitCommander} from './Unit';

export class WorkerCommander extends UnitCommander {

    harvest = (resourceSite, addToQueue) => {
        if (!addToQueue) {
            this.eventReceiver.cancelQueuedActions(this.unit);
        }
        this.eventReceiver.harvestWithUnit(this.unit, resourceSite);
    }

    // deliverResources = (baseStructure) => {
    //    // hmmmmm
    // }

    build = (structureClass, position, addToQueue) => {
        if (!addToQueue) {
            this.eventReceiver.cancelQueuedActions(this.unit);
        }
        this.eventReceiver.moveUnitTo(this.unit, position);
        this.eventReceiver.buildWithUnit(this.unit, structureClass, position);
    }
}

export default class Worker extends Unit {

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new WorkerCommander(this));
    }


}

export const isWorker = unit => unit.constructor.name === 'Worker';
