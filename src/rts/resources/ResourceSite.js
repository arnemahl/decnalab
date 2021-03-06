import {isWorker} from '~/rts/units/Worker';

class Harvest {
    constructor(ammount, resourceType) {
        this.ammount = ammount;
        this.resourceType = resourceType;
    }
}

class ResourceSite {
    currentHarvesters = 0

    constructor(id, position) {
        this.id = id;
        this.position = position;
    }

    isEmpty() {
        return this.resourcesLeft > 0;
    }

    canAccomodateMoreHarvesters() {
        const {currentHarvesters, maxHarvesters, resourcesLeft, harvestAmmount} = this;

        return currentHarvesters < maxHarvesters && (resourcesLeft - currentHarvesters * harvestAmmount) > harvestAmmount;
    }

    _canBeHarvestedBy(worker) {
        return isWorker(worker) && !worker.carriedResources && this.canAccomodateMoreHarvesters();
    }

    startHarvesting = (worker) => {
        if (!this._canBeHarvestedBy(worker)) {
            return false;
        }

        this.currentHarvesters++;
        return true;
    }

    finishHarvesting = (worker) => {
        this.currentHarvesters--;
        this.resourcesLeft -= this.harvestAmmount;
        worker.carriedResources = new Harvest(this.harvestAmmount, this.resourceType);
    }

    abortHarvesting = () => {
        this.currentHarvesters--;
    }

    getState = () => {
        const {
            id,
            position,
            resourceType,
            resourcesLeft,
            harvestDuration,
            harvestAmmount,
            maxHarvesters,
            currentHarvesters,
            size
        } = this;

        return {
            id,
            position: {...position},
            size,
            resourceType,
            type: resourceType + ' resource site',
            resourcesLeft,
            harvestDuration,
            harvestAmmount,
            maxHarvesters,
            currentHarvesters
        };
    }

}

export class AbundantResourceSite extends ResourceSite {
    resourceType = 'abundant'
    resourcesLeft = 20000
    maxHarvesters = 12
    harvestDuration = 75
    harvestAmmount = 10
    size = 800

    canBeHarvestedBy = worker => this._canBeHarvestedBy(worker);
}

export class SparseResourceSite extends ResourceSite {
    resourceType = 'sparse'
    resourcesLeft = 6000
    maxHarvesters = 4
    harvestDuration = 100
    harvestAmmount = 2
    size = 300

    canBeHarvestedBy = worker => this._canBeHarvestedBy(worker) && worker.xp > 100;
}
