export function select(population, nofSelected) {
    if (population.length === 0) {
        throw Error('Cannot select from empty population!');
    }

    let popSummedFitness = 0;

    const rouletteWheel = population.map((individual) => {
        const area = {
            lowerBound: popSummedFitness,
            individual
        };

        popSummedFitness += individual.fitness;

        return area;
    }).reverse();

    return Array(nofSelected).fill().map(() => {

        const rouletteNumber = Math.random() * popSummedFitness;

        const area = rouletteWheel.find(area => area.lowerBound <= rouletteNumber);

        if (!area) {
            throw Error(`No area found for rouletteNumber ${rouletteNumber} in roulette wheel `
                + `[ ${rouletteWheel.map(area => area.lowerBound).reverse().join(' <-> ')} <-> ${popSummedFitness} ]`);
        }
        return area.individual;
    });
}
