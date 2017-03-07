import { evaluate } from './ResultEvaluation';

import Individual from '~/coevolution/individual/Individual';
import * as Genome from '~/coevolution/individual/genome';
import { getBaselines } from '~/coevolution/individual/baselines';

// import { population as foundSolutions } from '../../../dump/bol-8-add-01-000/solutions';
// import { population as foundSolutions } from '../../../dump/bol-8-add-01-more-stats-000/solutions';
import { population as foundSolutions } from '../../../dump/handmade-improved-add-01-bol-26-000/solutions';

const solutions = foundSolutions
    .slice(0, 12)
    .map(strategy => Genome.encodeGenome(strategy))
    .map(genome => new Individual(genome));

const t0 = Date.now();

const evaluation = evaluate(solutions, getBaselines(), 8, console.log);

console.log('');
// // Log latex tables (HUGE)
// Object.keys(evaluation.latexTables).forEach(key => {
//     console.log(key);
//     console.log(evaluation.latexTables[key]);
// });

console.log(`evaluation.json.score:`, evaluation.json.score);

console.log(`\nTest duration: ${Date.now() - t0} ms   (evaluated ${solutions.length} solutions)`);
