import Vectors from '~/rts/spatial/Vectors';
import {isWorker} from '~/rts/units/Worker';

const isIdle = unit => !unit.isBusy();

function getClosestResourceSite(map, worker, resourceType) {
    const distanceTo = resourceSite => Vectors.absoluteDistance(worker.position, resourceSite.position);

    return (
        map
        .resourceSites[resourceType]
        .sort((one, two) => distanceTo(one) - distanceTo(two))
        [0]
    );
}

export default class TeamAI {
    constructor(team, map) {
        this.team = team;
        this.map = map;
    }

    doTick = (/*tick*/) => {
        const units = Object.values(this.team.units);

        const idleWorkers = units.filter(isWorker).filter(isIdle);

        idleWorkers.forEach(worker => worker.getCommander().harvest(
            getClosestResourceSite(this.map, worker, 'abundant')
        ));
    }
}
