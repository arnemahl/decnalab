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
                score: getTexGraphData(this.stats.map(generation => generation.score), '# score'),
                nofWins: getTexGraphData(this.stats.map(generation => generation.nofWins), '# nofWins'),

                baselineFitness: getTexGraphData(this.stats.map(generation => generation.baselineFitness), '# Fitness when evaluated against baseline solutions'),
                baselineScore: getTexGraphData(this.stats.map(generation => generation.baselineScore), '# Score when playing against baseline solutions'),
                baselineNofWins: getTexGraphData(this.stats.map(generation => generation.baselineNofWins), '# Number of wins against baseline solutions'),

                geneticDistance: getTexGraphData(this.stats.map(generation => generation.geneticDistance), '# geneticDistance'),
            },
        };
    }

    track = (teachSetResults, baselineResults) => {
        const population = teachSetResults.map(Individual.unwrap);
        const avgGeneticDistances = Individual.getAverageGeneticDistances(population);

        this.stats.push({
            generation: this.stats.length,
            durationMs: Date.now() - this.t0,

            fitness: calcStuff(teachSetResults.map(x => x.fitness)),
            score: calcStuff(teachSetResults.map(x => x.avgScore)),
            nofWins: calcStuff(teachSetResults.map(x => x.nofWins)),

            baselineFitness: calcStuff(baselineResults.map(x => x.fitness)),
            baselineScore: calcStuff(baselineResults.map(x => x.avgScore)),
            baselineNofWins: calcStuff(baselineResults.map(x => x.nofWins)),

            geneticDistance: {
                ...calcStuff(avgGeneticDistances),
                nofUnique: Individual.countUniqueGenomes(population),
            },
        });

        if (DEBUG) {
            const {fitness, geneticDistance} = this.stats[this.stats.length - 1];
            console.log(`fitness:`, fitness);
            console.log(`geneticDistance:`, geneticDistance);
        }
    }

}
