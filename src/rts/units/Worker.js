// import Vectors from '~/rts/spatial/Vectors';
import Unit from './Unit';

class SafeWorkerCommander {
    constructor(worker) {
        ['harvest', 'build', 'move', 'attack'].forEach(command => {
            this[command] = worker[command].bind(worker);
        });
    }
}

export default class Worker extends Unit {

    getSafeCommander = () => {
        return this.safeCommander || (this.safeCommander = new SafeWorkerCommander(this));
    }

    /* public */
    harvest(resourceSite) {
        const doit = this.startHarvesting.bind(this, resourceSite);
        const repeat = this.harvest.bind(this, resourceSite);
        this.moveTo(resourceSite.location).then(doit).then(repeat);
    }

    // startHarvesting(resourceSite) {
    //     // TODO
    //     // then.returnHarvest()
    // }

    returnHarvest() {
        const closestBase = this.team.getClosestBase(this.position);

        if (!closestBase) {
            return;
        }

        const doit = this.dropOffHarvest.bind(this, closestBase);
        this.moveTo(closestBase.location).then(doit);
    }

    // dropOffHarvest(base) {
    //     // this.team.receiveResources(this.carriedResources);
    // }

    /* public */
    build(structure, location) {
        const doit = this.startBuilding.bind(this, structure, location);
        this.moveTo(location).then(doit);
    }

    // startBuilding(structure) {
    //     // TODO
    // }


}

export const isWorker = unit => unit.constructor.name === 'Worker';
