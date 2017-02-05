export const createSelector = (scalingMethod) => (population, nofSelected) => {
    if (population.length === 0) {
        throw Error('Cannot select from empty population!');
    }

    const maxFitness = population.map(x => x.fitness).sort((a, b) => b - a)[0];

    let popSummedFitness = 0;

    const rouletteWheel = population.map((individual) => {
        const area = {
            lowerBound: popSummedFitness,
            individual
        };

        popSummedFitness += scalingMethod(individual.fitness, maxFitness);

        return area;
    });

    return Array(nofSelected).fill().map(() => {

        const rouletteNumber = Math.random() * popSummedFitness;

        const area = rouletteWheel.find(area => area.lowerBound <= rouletteNumber);

        if (!area) {
            throw Error(`No area found for rouletteNumber ${rouletteNumber} in roulette wheel `
                + `[ ${rouletteWheel.map(area => area.lowerBound).join(' <-> ')} <-> ${popSummedFitness} ]`);
        }
        return area.individual;
    });
};

export const select = (population, nofSelected, scalingMethod) => createSelector(scalingMethod)(population, nofSelected);
