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
const spaces = count => Array(count).fill(' ').join('');
const fmt = number => {
    const maxL = 20; // Assumption of max number digits to the left of decimal mark
    const maxR = 15;
    if (String(number).split('.')[0].length > maxL) {
        throw Error(`Need ot increase max number of digits before decimal mark, number too long ${number}`);
    }

    // Makes the numbers align neatly. Left pads with spaces, rigth pads with zeros or rounds off if more than maxR decimals
    return String(spaces(maxL) + number.toFixed(maxR)).split('').reverse().slice(0, maxL + maxR).reverse().join('');
};
const lp2 = number => String('  ' + number).split('').reverse().slice(0, 3).reverse().join('');
const getTexGraphData = (numberStuff, comments) => {
    return `${comments}\n\n`
        + `  gen${spaces(19)}avg${spaces(33)}stdDev${spaces(30)}median${spaces(30)}max${spaces(33)}total\n\n`
        + numberStuff.map((stuff, generation) =>
            `${lp2(generation)} ${fmt(stuff.average)} ${fmt(stuff.stdDeviation)} ${fmt(stuff.median)} ${fmt(stuff.max)} ${fmt(stuff.total)}`
        ).join('\n');
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
