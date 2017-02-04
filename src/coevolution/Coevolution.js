/*******************/
/**  Individuals  **/
/*******************/
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
    4, // Worker
    4, // Marine
    2, // SupplyDepot
    2, // Barracks
];
const maxAttackTiming = 15;
const initBuildOrderLength = 4;

export function generateIndividual() {
    const counts = Array(nofProducableThings).fill(0);
    counts[0] = 5; // Starts with 5 Workers

    const buildOrder = Array(initBuildOrderLength).fill().map(() => {
        const index = Math.floor(nofProducableThings * Math.random());
        const whatToProduce = producableThings[index];
        const howMany = Math.ceil((maxProduced[index] - 1) * Math.random());

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


/* eslint-disable */
// TODO

/************/
/**  Main  **/
/************/
let hallOfFame = [];
let popSize = 10;
let population = Array(popSize).fill().map(generateIndividual);

let finished = false;
let loops = 0;
let maxLoops = 10;

while (!finished && loops++ < maxLoops) {


}
