export function select(population, nofSelected) {
    if (population.length === 0) {
        throw Error('Cannot select from empty population!');
    }

    // Copy population and sort by fitness, descending
    const sortedPopulation = population.slice().sort((one, two) => one.fitness - two.fitness);

    // Similar to roulette wheel selection, but area size is decided by rank
    let summedRankPoints = 0;

    const rouletteWheel = sortedPopulation.map((individual, index) => {
        summedRankPoints += index + 1; // Lowest lower bound is 1

        return {
            lowerBound: summedRankPoints,
            individual
        };
    }).reverse();

    if (summedRankPoints !== (population.length * (population.length + 1) / 2)) {
        throw Error('Implementation error in linearRankSelection');
    }

    return Array(nofSelected).fill().map(() => {

        const rouletteNumber = Math.random() * summedRankPoints + 1; // Lowest lower bound is 1

        const area = rouletteWheel.find(area => area.lowerBound <= rouletteNumber);

        if (!area) {
            throw Error(`No area found for number ${rouletteNumber} in roulette wheel `
                + `[ ${rouletteWheel.map(area => area.lowerBound).reverse().join(' <-> ')} <-> ${summedRankPoints} ]`);
        }

        return area.individual;
    });
}
