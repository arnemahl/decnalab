import Vectors from '~/rts/spatial/Vectors';
import {isWorker} from '~/rts/units/Worker';
import {isBaseStructure} from '~/rts/structures/BaseStructure';

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

        this.produceWorkerIfPossible();
        this.buildBarracksIfPossible();
    }

    produceWorkerIfPossible() {
        // Only let blue team produce
        if (this.team.id !== 'blue') {
            return;
        }

        const structures = Object.values(this.team.structures);
        const anyBaseStructure = structures.find(isBaseStructure);
        const {resources, unitSpecs} = this.team;
        const canProduce = this.team.supply - this.team.usedSupply - unitSpecs.Worker.cost.supply >= 0
            && ['abundant', 'sparse'].every(resourceType => resources[resourceType] - unitSpecs.Worker.cost[resourceType] >= 0);

        if (canProduce && anyBaseStructure && anyBaseStructure.isIdle()) {
            anyBaseStructure.getCommander().produceUnit(unitSpecs.Worker);
            this.didProduce = true;
            console.log('Producing new worker');
        }
    }

    buildBarracksIfPossible() {
        // Only build one, and only let blue team build
        if (this.didBuild || this.team.id !== 'blue') {
            return;
        }

        const units = Object.values(this.team.units);
        const anyWorker = units.find(isWorker);
        const {resources, structureSpecs} = this.team;
        const canBuild = ['abundant', 'sparse'].every(
            resourceType => resources[resourceType] - structureSpecs.Barracks.cost[resourceType] >= 0);

        if (canBuild && anyWorker) {
            const queueCommand = true;

            anyWorker.getCommander().build(structureSpecs.Barracks, Vectors.new(29000, 11500), queueCommand);
            this.didBuild = true;
            console.log('building new Barracks');
        }
    }
}
