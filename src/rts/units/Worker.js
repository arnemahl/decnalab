import Unit, {UnitCommander} from './Unit';

export class WorkerCommander extends UnitCommander {

    harvest = (resourceSite, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.moveUnit(this.unit, resourceSite.position);
        this.eventReceiver.harvestWithUnit(this.unit, resourceSite);
    }

    returnHarvest = (baseStructure, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.moveUnit(this.unit, baseStructure.position);
        this.eventReceiver.dropOffHarvestWithUnit(this.unit, baseStructure);
    }

    build = (structureSpec, position, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.moveUnit(this.unit, position);
        this.eventReceiver.buildWithUnit(this.unit, structureSpec, position);
    }
}


export default class Worker extends Unit {
    carriedResources = false;
    currentResourceSite = false;

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new WorkerCommander(this, this.eventReceiver));
    }

    returnHarvest = () => {
        const closestBaseStructure = this.team.getClosestBaseStructure(this.position);
        const wait = true;

        this.getCommander().returnHarvest(closestBaseStructure, wait);
    }

    harvestAgain = () => {
        const wait = true;

        this.getCommander().harvest(this.currentResourceSite, wait);
    }

    getState = () => {
        return {
            ...this.getUnitState(),
            carriedResources: {...this.carriedResources},
            currentResourceSiteId: this.currentResourceSite.id,
        };
    }

}

export const isWorker = unit => unit.constructor.name === 'Worker';
