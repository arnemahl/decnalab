/************************************/
/**  Generate random individuals   **/
/************************************/
import {
    producableThings,
    maxInitialAddCount,
    minInitialAttackTiming,
    maxInitialAttackTiming,
    initialBuildOrderLength,
} from '~/coevolution/config';

const nofProducableThings = producableThings.length;

export function generateGenome() {
    const buildOrder = Array(initialBuildOrderLength).fill().map(() => {
        const index = Math.floor(nofProducableThings * Math.random());
        const whatToProduce = producableThings[index];
        const howMany = Math.ceil(maxInitialAddCount[whatToProduce] * Math.random());

        return {
            specName: whatToProduce,
            addCount: howMany
        };
    });

    const attackAtSupply = minInitialAttackTiming + 1 + Math.floor((maxInitialAttackTiming - minInitialAttackTiming) + Math.random());

    return { buildOrder, attackAtSupply };
}
