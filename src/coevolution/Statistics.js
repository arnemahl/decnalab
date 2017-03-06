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
        throw Error(`Need to increase max number of digits before decimal mark, number too long ${number}`);
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
        const texifyData = (key, description) => ({
            [key]: getTexGraphData(this.stats.map(generation => generation[key]), description)
        });

        return {
            json: this.stats,
            tex: {
                ...texifyData('pop_vs_teachSet_fitness', '# Fitness (population vs teach set)'),
                ...texifyData('pop_vs_teachSet_score', '# Score (population vs teach set)'),
                ...texifyData('pop_vs_teachSet_nofWins', '# Number of wins (population vs teach set)'),

                ...texifyData('pop_vs_baselines_fitness', '# Fitness (population vs baselines)'),
                ...texifyData('pop_vs_baselines_score', '# Score (population vs baselines)'),
                ...texifyData('pop_vs_baselines_nofWins', '# Number of wins (population vs baselines)'),

                ...texifyData('teachSet_vs_baselines_fitness', '# Fitness (teach set vs baselines)'),
                ...texifyData('teachSet_vs_baselines_score', '# Score (teach set vs baselines)'),
                ...texifyData('teachSet_vs_baselines_nofWins', '# Number of wins (teach set vs baselines)'),

                ...texifyData('geneticDistance_within_pop', '# Genetic distance (within population)'),
                ...texifyData('geneticDistance_pop_to_caseInjected', '# Genetic distance (from population to case injected)'),
                ...texifyData('geneticDistance_teachSet_to_caseInjected', '# Genetic distance (from teach set to case injected)'),
            },
        };
    }

    track = (population, teachSet, caseInjected, baselines) => {
        const popVsTeachSet = Individual.wrapWithSharedFitness(population, teachSet);
        const popVsBaselines = Individual.wrapWithSharedFitness(population, baselines);
        const teachSetVsBaselines = Individual.wrapWithSharedFitness(teachSet, baselines);

        this.stats.push({
            generation: this.stats.length,
            durationMs: Date.now() - this.t0,

            pop_vs_teachSet_fitness: calcStuff(popVsTeachSet.map(x => x.fitness)),
            pop_vs_teachSet_score: calcStuff(popVsTeachSet.map(x => x.avgScore)),
            pop_vs_teachSet_nofWins: calcStuff(popVsTeachSet.map(x => x.nofWins)),

            pop_vs_baselines_fitness: calcStuff(popVsBaselines.map(x => x.fitness)),
            pop_vs_baselines_score: calcStuff(popVsBaselines.map(x => x.avgScore)),
            pop_vs_baselines_nofWins: calcStuff(popVsBaselines.map(x => x.nofWins)),

            teachSet_vs_baselines_fitness: calcStuff(teachSetVsBaselines.map(x => x.fitness)),
            teachSet_vs_baselines_score: calcStuff(teachSetVsBaselines.map(x => x.avgScore)),
            teachSet_vs_baselines_nofWins: calcStuff(teachSetVsBaselines.map(x => x.nofWins)),

            geneticDistance_within_pop: calcStuff(Individual.getAverageGeneticDistancesWithin(population)),
            geneticDistance_pop_to_caseInjected: calcStuff(Individual.getAverageGeneticDistancesToOtherSet(population, caseInjected)),
            geneticDistance_teachSet_to_caseInjected: calcStuff(Individual.getAverageGeneticDistancesToOtherSet(teachSet, caseInjected)),

            nofUnique_in_pop: Individual.countUniqueGenomes(population)
        });

        if (DEBUG) {
            const newStats = this.stats[this.stats.length - 1];

            console.log(`Fitness:`, newStats.pop_vs_teachSet_fitness);
            console.log(`Genetic distance:`, newStats.geneticDistance_within_pop);
            console.log(`Unique in population:`, newStats.nofUnique_in_pop);
        }
    }

}
