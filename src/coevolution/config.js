export const popSize = 50;
export const nofChildrenPerGeneration = 70;
export const teachSetSize = 8;
export const maxGenerations = 50;
export const maxLoopsPerGame = 1000;
export const fitnessScalingFactor = 1.5;
export const crossoverRatio = 0.90;
export const mutationRatio = 0.1;

export const crossoverFunction = 'uniformCrossover';

export const producableThings = [
    'Worker',
    'Marine',
    // 'Firebat',
    'SupplyDepot',
    'Barracks',
    // 'FlameTower',
];
export const maxInitialAddCount = {
    Worker: 1,
    Marine: 1,
    // Firebat: 1,
    SupplyDepot: 1,
    Barracks: 1,
    // FlameTower: 1,
};
export const minInitialAttackTiming = 5;
export const maxInitialAttackTiming = 15;
export const initialBuildOrderLength = 8;
