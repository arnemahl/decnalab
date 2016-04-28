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
    usedStructurePositions = [];

    constructor(team, map) {
        this.team = team;
        this.map = map;
    }

    doTick = (/*tick*/) => {
        const units = Object.values(this.team.units);

        units.filter(isWorker).filter(isIdle).forEach(this.workerHandler);

        this.produceUnitsIfPossible();
        this.buildBarracksIfPossible();
        this.buildSupplyDepotIfNecessary();
    }

    workerHandler = (worker) => {
        worker.getCommander().harvest(
            getClosestResourceSite(this.map, worker, 'abundant')
        );
    }

    buildSupplyDepotIfNecessary() {
        if (this.team.supply - this.team.usedSupply < 3) {
            this.buildStructureIfPossible(this.team.structureSpecs.SupplyDepot);
        }
    }

    buildBarracksIfPossible() {
        this.buildStructureIfPossible(this.team.structureSpecs.Barracks);
    }

    buildStructureIfPossible(structureSpec) {
        const units = Object.values(this.team.units);
        const anyWorker = units.find(isWorker); // TODO get a worker which is harvesting (or idle)
        const {resources} = this.team;
        const canBuild = ['abundant', 'sparse'].every(
            resourceType => resources[resourceType] - structureSpec.cost[resourceType] >= 0);
        const structurePosition = this.getNextAvailableStructurePosition();

        if (canBuild && anyWorker && structurePosition) {
            const queueCommand = true;

            anyWorker.getCommander().build(structureSpec, structurePosition, queueCommand);

            this.usedStructurePositions.push(structurePosition);
            console.log(`${anyWorker.id} building new ${structureSpec.constructor.name}`);
        }
    }

    getNextAvailableStructurePosition() {
        const notUsed = position => this.usedStructurePositions.every(usedPosition => Vectors.notEquals(position, usedPosition));
        const suggestedPositions = this.map.suggestedStructurePositions[ {blue: 'north', red: 'south'}[this.team.id] ];

        return suggestedPositions.find(notUsed);
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
