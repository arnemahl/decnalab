import Unit, {UnitCommander} from './Unit';

export class WorkerCommander extends UnitCommander {

    harvest = (resourceSite, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.moveUnitTo(this.unit, resourceSite.position);
        this.eventReceiver.harvestWithUnit(this.unit, resourceSite);
    }

    returnHarvest = (baseStructure, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.moveUnitTo(this.unit, baseStructure.position);
        this.eventReceiver.dropOffHarvestWithUnit(this.unit, baseStructure);
    }

    build = (structureClass, position, waitForQueuedCommandsToComplete) => {
        if (!waitForQueuedCommandsToComplete) {
            this.eventReceiver.clearCommands(this.unit);
        }
        this.eventReceiver.moveUnitTo(this.unit, position);
        this.eventReceiver.buildWithUnit(this.unit, structureClass, position);
    }
}


export default class Worker extends Unit {
    carriedResources = false;
    currentResourceSite = false;

    getCommander = () => {
        return this.safeCommander || (this.safeCommander = new WorkerCommander(this, this.game.eventReceiver));
    }

    carriesResources = () => {
        return !this.carriedResources;
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

}

export const isWorker = unit => unit.constructor.name === 'Worker';
