import {
    producableThings,
    minAttackTiming,
    maxAttackTiming,
    initialBuildOrderLength,
} from '~/coevolution/config';

const possibleAttackTimings = Array(1 + maxAttackTiming - minAttackTiming).fill()
    .map((_, i) => i)
    .map(i => minAttackTiming + i);


const nofBitsForEncoding = {
    producableThings: Math.ceil(Math.sqrt(producableThings.length)),
    attackTiming: Math.ceil(Math.sqrt(possibleAttackTimings.length)),
};

const sumTotal = (sum, number) => sum + number;

const randomBits = (count) => Array(count).fill().map(() => Math.random() < 0.5 ? '1' : '0').join('');
const bitsToNumber = (string) => string.split('').reverse().map(Number).map(Boolean).map((b, i) => !b ? 0 : Math.pow(2, i)).reduce(sumTotal, 0);

/***********************/
/*  Generate / Decode  */
/***********************/

export function generateGenome() {
    const buildOrder =
        Array(initialBuildOrderLength).fill()
            .map(() => randomBits(nofBitsForEncoding.producableThings))
            .join('-');

    const attackTiming = randomBits(nofBitsForEncoding.attackTiming);

    return `${buildOrder}|${attackTiming}`;
}

export function decodeGenome(genomeString) {
    const buildOrder = genomeString.split('|')[0].split('-');
    const attackTiming = genomeString.split('|')[1];

    return {
        buildOrder: buildOrder.map(string => {
            const specName = producableThings[bitsToNumber(string) % producableThings.length];

            return {
                specName,
                addCount: 1
            };
        }),
        attackAtSupply: possibleAttackTimings[bitsToNumber(attackTiming) % possibleAttackTimings.length]
    };
}

export function encodeGenome(strategy) {
    const leftPadZeros = (bits, exactLength) => Array(exactLength - bits.length).fill('0').join('') + bits;

    const buildOrder =
        strategy.buildOrder
            .filter(target => producableThings.includes(target.specName)) // Silently filter out invalid targets
            .map(target => {
                const number = producableThings.indexOf(target.specName);

                const numberAsBits = number.toString(2);

                return leftPadZeros(numberAsBits, nofBitsForEncoding.producableThings);
            })
            .join('-');

    const attackTiming = leftPadZeros((strategy.attackAtSupply - minAttackTiming).toString(2), nofBitsForEncoding.attackTiming)

    return `${buildOrder}|${attackTiming}`;
}

export function getRandomStrategy() {
    return decodeGenome(generateGenome());
}


/*****************************/
/*  Crossover and Muatation  */
/*****************************/

import { perBitMutationRatio } from '~/coevolution/config';

export function uniformCrossover(mother, father) {
    if (mother.length !== father.length) {
        throw Error(`Inequal genome length! (${mother}, ${father})`);
    }
    const randArray = Array(mother.length).fill().map(() => Math.random() < 0.5);

    const son = randArray.map((fromMother, index) => fromMother ? mother[index] : father[index]).join('');
    const daugher = randArray.map((fromFather, index) => fromFather ? father[index] : mother[index]).join('');

    return [ son, daugher ];
}

export function copyAndMutate(genome) {
    const isBit = (char) => ['0', '1'].includes(char);
    const flipBit = (char) => ({ 0: '1', 1: '0' }[char]);

    return genome
        .split('')
        .map(char => {
            if (Math.random() < perBitMutationRatio && isBit(char)) {
                return flipBit(char);
            } else {
                return char;
            }
        })
        .join('');
}


/********************************/
/*  Calculate genetic distance  */
/********************************/

export function calculateDistance(genome, otherGenome) {
    const maxLen = Math.max(genome.length, otherGenome.length);

    return Array(maxLen).fill()
        .map((_, index) =>
            genome[index] === otherGenome[index] ? 0 : 1
        )
        .reduce(sumTotal, 0);
}


/**********************************/
/*  Test for Encoding / Decoding  */
/**********************************/

(function testEncodingOfSpecName() {
    // Test encoding of specName`s in build order
    const encodableSpecNames = Array(Math.pow(nofBitsForEncoding.producableThings, 2)).fill()
        .map((_, i) => i)
        .map(number => producableThings[number % producableThings.length]);

    const containsAll = producableThings.every(specName => encodableSpecNames.includes(specName));
    const atMostTwice = producableThings.every(specName => encodableSpecNames.filter(encodable => encodable === specName).length <= 2);

    if (!containsAll) {
        throw Error(`Not able to encode all producableThings (${producableThings.join(', ')}), can only encode: ${encodableSpecNames.join(', ')}`);
    }
    if (!atMostTwice) {
        throw Error(`Some producableThings can be encoded in more than two ways: ${encodableSpecNames.join(', ')}`);
    }

    // console.log(`producableThings:`, producableThings); // DEBUG
    // console.log(`encodableSpecNames:`, encodableSpecNames); // DEBUG
})();

(function testEncodingOfAttackTiming() {
    // Test encoding of attackTiming
    const encodableAttackTimings = Array(Math.pow(nofBitsForEncoding.attackTiming, 2)).fill()
        .map((_, i) => i)
        .map(number => possibleAttackTimings[number % possibleAttackTimings.length]);

    const containsAll = possibleAttackTimings.every(timing => encodableAttackTimings.includes(timing));
    const atMostTwice = possibleAttackTimings.every(timing => encodableAttackTimings.filter(encodable => encodable === timing).length <= 2);

    if (!containsAll) {
        throw Error(`Not able to encode all possibleAttackTimings (${possibleAttackTimings.join(', ')}), can only encode: ${encodableAttackTimings.join(', ')}`);
    }
    if (!atMostTwice) {
        throw Error(`Some possibleAttackTimings can be encoded in more than two ways: ${encodableAttackTimings.join(', ')}`);
    }

    // console.log(`possibleAttackTimings:`, possibleAttackTimings); // DEBUG
    // console.log(`encodableAttackTimings:`, encodableAttackTimings); // DEBUG
})();
