import Vectors from '~/rts/spatial/Vectors';
import Unit from './Unit';

export default class Worker extends Unit {

    tick = () => {
        if (this.isIdle) {
            return false;
        }

        // Progress whatever action the unit is performing
        switch (this.action.type) {
            case 'harvest':
                // harvest resources TODO
                console.log('harvest');
                return true;
            case 'construct':
                // construct structure TODO
                console.log('construct');
                return true;
            case 'move':
                this.move();
                return true;
            case 'attack':
                // TODO
                return true;
            default:
                return false;
        }
    }

    harvest(resourceSite) {
        if (Vectors.distance(this.position, resourceSite.position) > 50) {
            this.goTo(resourceSite.position);
        } else {
            this.beginHarvesting(resourceSite);
        }
    }

    returnHarvest(resourceSite) {
        const closestBase = this.team.getClosestBase(this.position);

        if (closestBase) {
            this.goTo(closestBase);
        }
    }


}

export const WorkerClassName = 'Worker';
export const WorkerCommands = {
    harvest: 'harvest',
    construct: 'construct',
    move: 'move',
    attack: 'attack'
};
