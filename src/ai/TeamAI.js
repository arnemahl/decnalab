import Vectors from '~/rts/spatial/Vectors';
import {isWorker} from '~/rts/units/Worker';
import {isBaseStructure} from '~/rts/structures/BaseStructure';
import {isBarracks} from '~/rts/structures/Barracks';

const isIdle = commandable => commandable.isIdle();

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

        units.filter(isWorker).filter(isIdle).forEach(this.workerHandler);

        this.produceUnitsIfPossible();
        this.buildBarracksIfPossible();
    }

    workerHandler = (worker) => {
        worker.getCommander().harvest(
            getClosestResourceSite(this.map, worker, 'abundant')
        );
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

    produceUnitsIfPossible() {
        // Only let blue team produce
        if (this.team.id !== 'blue') {
            return;
        }

        const structures = Object.values(this.team.structures);

        // structures.filter(isBaseStructure).forEach(this.baseStructureHandler);
        structures.filter(isBarracks).forEach(this.barracksHandler);
    }

    canProduce(unitSpec) {
        return this.team.supply - this.team.usedSupply - unitSpec.cost.supply >= 0
            && ['abundant', 'sparse'].every(resourceType => this.team.resources[resourceType] - unitSpec.cost[resourceType] >= 0);
    }

    getSpecIfUnitCanBeProduced(unitName) {
        const unitSpec = this.team.unitSpecs[unitName];
        const canProduce = this.canProduce(unitSpec);

        return !canProduce ? false : unitSpec;
    }

    baseStructureHandler = (baseStructure) => {
        if (baseStructure.isBusy()) {
            return;
        }
        const workerSpec = this.getSpecIfUnitCanBeProduced('Worker');

        if (!workerSpec) {
            return;
        }

        baseStructure.getCommander().produceUnit(workerSpec);
        console.log('Producing new Worker');
    }

    barracksHandler = (barracks) => {
        if (barracks.isBusy()) {
            return;
        }
        const marineSpec = this.team.unitSpecs.Marine;

        if (!this.canProduce(marineSpec)) {
            return;
        }

        barracks.getCommander().produceUnit(marineSpec);
        console.log('Producing new Marine');
    }
}
