import Individual from '~/coevolution/individual/Individual';

const sumTotal = (sum, number) => sum + number;
const ascending = (a, b) => a - b;
const descending = (a, b) => b - a;

const DEBUG = true;

const calcStuff = (numbers) => {
    const total = numbers.reduce(sumTotal, 0);
    const average = total / numbers.length;
    const stdDeviation =  [ numbers.map(x => Math.pow(x - average, 2)).reduce(sumTotal, 0) ].map(sum => sum / numbers.length).map(Math.sqrt)[0];
    const median = numbers.slice().sort(ascending).find((_, index) => index === Math.floor(numbers.length / 2));
    const max = numbers.slice().sort(descending)[0];

    return {
        total,
        average,
        stdDeviation,
        median,
        max,
    };
};
const getTexGraphData = (numberStuff, comments) => {
    return `${comments}\n\n`
        + 'gen avg stdDev median max total\n'
        + numberStuff.map((stuff, generation) => `${generation} ${stuff.average} ${stuff.stdDeviation} ${stuff.median} ${stuff.max} ${stuff.total}`).join('\n');
};

export default class Statistics {

    stats = []
    t0 = Date.now();

    dump = () => {
        return {
            json: this.stats,
            tex: {
                fitness: getTexGraphData(this.stats.map(generation => generation.fitness), '# fitness'),
                geneticDistance: getTexGraphData(this.stats.map(generation => generation.geneticDistance), '# geneticDistance'),
                score: getTexGraphData(this.stats.map(generation => generation.score), '# score'),
                nofWins: getTexGraphData(this.stats.map(generation => generation.nofWins), '# nofWins'),
            },
        };
    }

    track = (wrappedPopulation) => {
        const fitnesses = wrappedPopulation.map(x => x.fitness);
        const scores = wrappedPopulation.map(x => x.avgScore);
        const nofWins = wrappedPopulation.map(x => x.nofWins);

        const population = wrappedPopulation.map(Individual.unwrap);
        const avgGeneticDistances = Individual.getAverageGeneticDistances(population);

        this.stats.push({
            generation: this.stats.length,
            durationMs: Date.now() - this.t0,

            fitness: calcStuff(fitnesses),
            score: calcStuff(scores),
            nofWins: calcStuff(nofWins),
            geneticDistance: {
                ...calcStuff(avgGeneticDistances),
                nofUnique: Individual.countUniqueGenomes(population),
            },

            // rawData: {
            //     fitnesses,
            //     scores,
            //     nofWins,
            //     avgGeneticDistances,
            // },
        });

        if (DEBUG) {
            const {fitness, geneticDistance} = this.stats[this.stats.length - 1];
            console.log(`fitness:`, fitness);
            console.log(`geneticDistance:`, geneticDistance);
        }
    }

}
