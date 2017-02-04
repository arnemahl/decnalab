/************************************/
/**  Generate random individuals   **/
/************************************/
import UnitSpecs from '~/rts/units/UnitSpecs';
import StructureSpecs from '~/rts/structures/StructureSpecs';

const unitSpecs = new UnitSpecs();
const structureSpecs = new StructureSpecs();

const producableThings = [
    unitSpecs.Worker,
    unitSpecs.Marine,
    structureSpecs.SupplyDepot,
    structureSpecs.Barracks,
];
const nofProducableThings = producableThings.length;
const maxProduced = [
    1, // Worker
    4, // Marine
    1, // SupplyDepot
    1, // Barracks
];
const maxAttackTiming = 15;
const initBuildOrderLength = 3;

export function generateIndividual() {
    const counts = Array(nofProducableThings).fill(0);
    counts[0] = 5; // Starts with 5 Workers

    const buildOrder = Array(initBuildOrderLength).fill().map(() => {
        const index = Math.floor(nofProducableThings * Math.random());
        const whatToProduce = producableThings[index];
        const howMany = Math.ceil(maxProduced[index] * Math.random());

        counts[index] += howMany;

        return {
            spec: whatToProduce,
            count: counts[index]
        };
    });

    buildOrder.push({ spec: unitSpecs.Marine, count: Number.POSITIVE_INFINITY });

    const attackAtSupply = 5 + Math.floor(maxAttackTiming + Math.random());

    return {buildOrder, attackAtSupply};
}


/*************************/
/**  Clone individual   **/
/*************************/

export function cloneIndividual(individual) {
    return {
        buildOrder: individual.buildOrder.map(({ spec, count }) => ({ spec, count })),
        attackAtSupply: individual.attackAtSupply,
    };
}


/**************************************/
/**  Crossover to produce children   **/
/**************************************/

export function crossover(mother, father) {
    const crossoverPoint = Math.floor(Math.random() * Math.max(mother.buildOrder.length, father.buildOrder.length));
    const rand = Math.random() < 0.5;

    const son = {
        buildOrder: []
            .concat(mother.buildOrder.slice(0, crossoverPoint))
            .concat(father.buildOrder.slice(crossoverPoint)),
        attackAtSupply: rand ? mother.attackAtSupply : father.attackAtSupply,
    };
    const daughter = {
        buildOrder: []
            .concat(father.buildOrder.slice(0, crossoverPoint))
            .concat(mother.buildOrder.slice(crossoverPoint)),
        attackAtSupply: rand ? father.attackAtSupply : mother.attackAtSupply,
    };

    return [son, daughter];
}


/**************************/
/**  Mutate individual   **/
/**************************/

const plusOrMinus = int => Math.random() < 0.5 ? int : -int;

export function mutate(individual) {
    const {buildOrder} = individual;

    const targetIndex = Math.floor(buildOrder.length * Math.random());
    const target = buildOrder[targetIndex];

    target.count = Math.max(1, target.count + plusOrMinus(1));
}
