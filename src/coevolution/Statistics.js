import Individual from '~/coevolution/individual/Individual';

const sumTotal = (sum, number) => sum + number;
const ascending = (a, b) => a - b;

const DEBUG = true;

const calcStuff = (numbers) => {
    const total = numbers.reduce(sumTotal, 0);
    const average = total / numbers.length;
    const median = numbers.sort(ascending).find((_, index) => index === Math.floor(numbers.length / 2));
    const stdDeviation =  [ numbers.map(x => Math.pow(x - average, 2)).reduce(sumTotal, 0) ].map(sum => sum / numbers.length).map(Math.sqrt)[0];

    return {
        total,
        average,
        median,
        stdDeviation,
    };
};

export default class Statistics {

    stats = []
    t0 = Date.now();

    dump = () => this.stats

    track = (fitnessWrappedPopulation) => {
        const fitnesses = fitnessWrappedPopulation.map(x => x.fitness);

        const population = fitnessWrappedPopulation.map(Individual.unwrap);
        const avgGeneticDistances = Individual.getAverageGeneticDistances(population);

        this.stats.push({
            generation: this.stats.length,
            durationMs: Date.now() - this.t0,

            fitness: calcStuff(fitnesses),
            geneticDistance: {
                ...calcStuff(avgGeneticDistances),
                nofUnique: Individual.countUniqueGenomes(population),
            },
            rawData: {
                fitnesses,
                avgGeneticDistances,
            },
        });

        if (DEBUG) {
            const {fitness, geneticDistance} = this.stats[this.stats.length - 1];
            console.log(`fitness:`, fitness);
            console.log(`geneticDistance:`, geneticDistance);
        }
    }

}
