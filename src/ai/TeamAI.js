import Vectors from '~/rts/spatial/Vectors';
import {isWorker} from '~/rts/units/Worker';

const isIdle = unit => unit.isIdle;

function getClosestResourceSite(map, worker, resourceType) {
    const distanceTo = resourceSite => Vectors.absoluteDistance(worker.position, resourceSite.position);

    return (
        map
        .getResourceSites(resourceType)
        .sort((one, two) => distanceTo(one) - distanceTo(two))
        [0]
    );
}

export default class TeamAI {
    tick = (state, map) => {
        const {units/*, strucures, resources, vision*/} = state;

        const idleWorkers = units.filter(isWorker).filter(isIdle);

        idleWorkers.forEach(worker => worker.harvest(
            getClosestResourceSite(map, worker, 'abundant')
        ));
    }
}
