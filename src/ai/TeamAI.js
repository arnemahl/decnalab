import Vectors from '~/rts/spatial/Vectors';
import {WorkerClassName, WorkerCommands} from '~/rts/units/Worker';

const isWorker = unit => unit.constructor.name === WorkerClassName;
const isIdle = unit => unit.isIdle;

function getCommandToHarvestFromClosestResourceSite(map, worker, resourceType) {
    const distanceFromWorker = site => Vectors.getAbsoluteDistance(worker.position, site.position);

    const closestResourceSite = (
        map
        .getResourceSites(resourceType)
        .sort((one, two) => distanceFromWorker(one) - distanceFromWorker(two))
        [0]
    );

    return {
        type: WorkerCommands.harvest,
        site: closestResourceSite
    };
}

export default class TeamAI {
    tick = (state, map) => {
        /*eslint-disable*/
        const {units, strucures, resources, vision} = state;

        const idleWorkers = units.filter(isWorker).filter(isIdle);

        idleWorkers.forEach(worker => worker.command(
            getCommandToHarvestFromClosestResourceSite(map, worker, 'abundant')
        ));
        /*eslint-enable*/
    }
}
