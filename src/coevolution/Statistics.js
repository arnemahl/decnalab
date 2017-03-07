import * as MemoizedGameResults from '~/coevolution/individual/memoizedGameResults';
import Individual from '~/coevolution/individual/Individual';
import { calcStats } from '~/util/calc';

const DEBUG = true;

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
const getTexGraphData = (nestedStats, comments) => {
    return `${comments}\n\n`
        + `  gen${spaces(19)}avg${spaces(33)}stdDev${spaces(30)}median${spaces(30)}max${spaces(33)}total\n\n`
        + nestedStats.map((stats, generation) =>
            `${lp2(generation)} ${fmt(stats.average)} ${fmt(stats.stdDeviation)} ${fmt(stats.median)} ${fmt(stats.max)} ${fmt(stats.total)}`
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
            nofGamesSimulated: MemoizedGameResults.nofGamesSimulated,

            pop_vs_teachSet_fitness: calcStats(popVsTeachSet.map(x => x.fitness)),
            pop_vs_teachSet_score: calcStats(popVsTeachSet.map(x => x.avgScore)),
            pop_vs_teachSet_nofWins: calcStats(popVsTeachSet.map(x => x.nofWins)),

            pop_vs_baselines_fitness: calcStats(popVsBaselines.map(x => x.fitness)),
            pop_vs_baselines_score: calcStats(popVsBaselines.map(x => x.avgScore)),
            pop_vs_baselines_nofWins: calcStats(popVsBaselines.map(x => x.nofWins)),

            teachSet_vs_baselines_fitness: calcStats(teachSetVsBaselines.map(x => x.fitness)),
            teachSet_vs_baselines_score: calcStats(teachSetVsBaselines.map(x => x.avgScore)),
            teachSet_vs_baselines_nofWins: calcStats(teachSetVsBaselines.map(x => x.nofWins)),

            geneticDistance_within_pop: calcStats(Individual.getAverageGeneticDistancesWithin(population)),
            geneticDistance_pop_to_caseInjected: calcStats(Individual.getAverageGeneticDistancesToOtherSet(population, caseInjected)),
            geneticDistance_teachSet_to_caseInjected: calcStats(Individual.getAverageGeneticDistancesToOtherSet(teachSet, caseInjected)),

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
