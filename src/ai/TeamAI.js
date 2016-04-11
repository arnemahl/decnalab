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

        this.buildBarracksIfPossible();
    }

    buildBarracksIfPossible() {
        // Only build one, and only let blue team build
        if (this.didBuild || this.team.id !== 'blue') {
            return;
        }

        const units = Object.values(this.team.units);
        const {resources, structureSpecs} = this.team;
        const canBuild = ['abundant', 'sparse'].every(
            resourceType => resources[resourceType] - structureSpecs.Barracks.cost[resourceType] >= 0);
        const anyWorker = units.find(isWorker);

        if (canBuild && anyWorker) {
            const queueCommand = true;

            anyWorker.getCommander().build(structureSpecs.Barracks, Vectors.new(29000, 11500), queueCommand);
            this.didBuild = true;
            console.log('building new Barracks');
        }
    }
}
