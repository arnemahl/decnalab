import {isWorker} from '~/rts/units/Worker';

class Harvest {
    constructor(ammount, resourceType) {
        this.ammount = ammount;
        this.resourceType = resourceType;
    }
}

class ResourceSite {
    currentHarvesters = 0

    isEmpty() {
        return this.resourcesLeft > 0;
    }

    canAccomodateMoreHarvesters() {
        const {currentHarvesters, maxHarvesters, resourcesLeft, harvestAmmount} = this;

        return currentHarvesters < maxHarvesters && (resourcesLeft - currentHarvesters * harvestAmmount) > harvestAmmount;
    }

    canBeHarvestedBy(worker) {
        return isWorker(worker) && !worker.carriesResources() && this.canAccomodateMoreHarvesters();
    }

    startHarvesting = (worker) => {
        if (!this.canBeHarvestedBy(worker)) {
            return false;
        }

        this.currentHarvesters++;
        return true;
    }

    finishHarvesting = () => {
        this.currentHarvesters--;
        this.resourcesLeft -= this.harvestAmmount;
        return new Harvest(this.harvestAmmount, this.resourceType);
    }

    abortHarvesting = () => {
        this.currentHarvesters--;
    }

}

export class AbundantResourceSite extends ResourceSite {
    resourceType = 'abundant'
    resourcesLeft = 20000
    maxHarvesters = 15
    harvestDuration = 75
    harvestAmmount = 50

    canBeHarvestedBy = worker => super.canBeHarvestedBy(worker);

    constructor(position) {
        this.position = position;
    }
}

export class SparseResourceSite extends ResourceSite {
    resourceType = 'sparse'
    resourcesLeft = 6000
    maxHarvesters = 4
    harvestDuration = 100
    harvestAmmount = 10

    canBeHarvestedBy = worker => super.canBeHarvestedBy(worker) && worker.xp > 100;

    constructor(position) {
        this.position = position;
    }
}
