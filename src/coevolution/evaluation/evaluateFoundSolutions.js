import * as MemoizedGameResults from '~/coevolution/individual/memoizedGameResults';
import { leftPad } from '~/util/stringPad';

const evaluateAgainst = ['only solutions', 'only baselines', 'both solutions and baselines'][0]; // TODO config from outside?
function selectOpponents(solutions, baselines) {
    switch (evaluateAgainst) {
        case 'only solutions':
            return solutions;

        case 'only baselines':
            return baselines;

        case 'both solutions and baselines':
            return solutions.concat(baselines);
    }
};

const sumTotal = (sum, number) => sum + number;

const padValue = (padCount) => (string) => leftPad(string, padCount);
const latexTableString = (description, rowNames, rows, padCount = 5) => `
% ${description || 'No description'}
\\begin{tabular}{ | ${Array(rowNames.length).fill('r').join(' | ')} | }
    \\hline
        ${rowNames.map(padValue(padCount)).join('  &  ')}  \\\\
    \\hline
    \\hline
        ${
            rows.map((columns) =>
                `${columns.map(padValue(padCount)).join('  &  ')}  \\\\`
            )
            .join('\n    \\hline\n        ')
        }
    \\hline
\\end{tabular}
`;

function getOutcomeTables(solutions, baselines) {
    const opponents = selectOpponents(solutions, baselines);

    const getResultsVsOpponents = (challenger) => {
        const results = opponents.map(opponent => MemoizedGameResults.getResult(challenger, opponent));

        return {
            individual: challenger,
            results
        };
    };

    const toRow = one => [one.individual.shortId].concat(one.results.map(result =>
        result.didWin && 'win' ||
        result.didLose && 'loss' ||
        'tie'
    ));

    const rowNames = ['Index'].concat(opponents.map(opponent => opponent.shortId));

    return {
        solutions: latexTableString('Found solutions vs baselines', rowNames, solutions.map(getResultsVsOpponents).map(toRow)),
        baselines: latexTableString('Baselines vs baselines', rowNames, baselines.map(getResultsVsOpponents).map(toRow)),
    };
}

function evaluateSpecialization(solutions, baselines, opponents) {
    const getResultsVsOpponents = challenger => opponents.map(opponent => MemoizedGameResults.getResult(challenger, opponent));

    const getNofTimesBeatenBy = (challengers) =>
        opponents.map(opponent =>
                challengers
                    .map(challenger => MemoizedGameResults.getResult(opponent, challenger))
                    .map(opponentResult => opponentResult.didLose ? 1 : 0)
                    .reduce(sumTotal, 0)
            );
    const nofTimesBeatenByChallengers = getNofTimesBeatenBy([...solutions, ...baselines]);
    const calcSpecializations = (challengers) => {
        return challengers
            .map(getResultsVsOpponents)
            .map(resultsForOneChallenger =>
                resultsForOneChallenger
                    .map((result, opponentIndex) =>
                        result.didWin
                            ? challengers.length / nofTimesBeatenByChallengers[opponentIndex]
                            : 0
                    )
                    .reduce(sumTotal, 0)
            );
    };

    return {
        solutions: calcSpecializations(solutions),
        baselines: calcSpecializations(baselines),
    };
}


function evaluateRobustness(solutions, baselines, opponents) {
    const getResultsVsOpponents = (challenger) => opponents.map(opponent => MemoizedGameResults.getResult(challenger, opponent));

    const calcRobustnesses = (challengers) => {
        return challengers
            .map(getResultsVsOpponents)
            .map(resultsForOneChallenger =>
                resultsForOneChallenger
                    .map(result =>
                        result.didWin && 1 ||
                        result.didLose && -1 ||
                        0
                    )
                    .reduce(sumTotal, 0)
            );
    };

    return {
        solutions: calcRobustnesses(solutions),
        baselines: calcRobustnesses(baselines),
    };
}

function bundleEvaluationAndSort(challengerList, specializationList, robustnessList) {
    if (challengerList.length !== specializationList.length || specializationList.length !== robustnessList.length) {
        throw Error('challengerList, specializationList and robustnessList are not of same length. They should all have one entry per challenger.');
    }

    const byViabilityDescending = (one, two) => two.viability - one.viability;

    return Array(specializationList.length).fill()
        .map((_, index) => {
            return {
                individual: challengerList[index],
                specialization: specializationList[index],
                robustness: robustnessList[index],
                viability: specializationList[index] + robustnessList[index],
            };
        })
        .sort(byViabilityDescending);
}

function getEvaluationTables(evaluation) {
    return {
        solutions: latexTableString(
            'Found solutions',
            [ 'Index', 'Specialization', 'Robustness', 'Viability'],
            evaluation.solutions.map(one =>
                [ one.individual.shortId, one.specialization.toFixed(2), one.robustness.toFixed(2), one.viability.toFixed(2) ]
            ),
            14,
        ),
        baselines: latexTableString(
            'Baselines',
            [ 'Index', 'Specialization', 'Robustness', 'Viability'],
            evaluation.baselines.map(one =>
                [ one.individual.shortId, one.specialization.toFixed(2), one.robustness.toFixed(2), one.viability.toFixed(2) ]
            ),
            14,
        ),
    };
}

function evaluateFoundSolutions(solutions, baselines, log = () => {}) {
    const opponents = selectOpponents(solutions, baselines);

    log('Calculating specialization...');
    const specialization = evaluateSpecialization(solutions, baselines, opponents);

    log('Calculating robustness...');
    const robustness = evaluateRobustness(solutions, baselines, opponents);

    log('Calculating overall evaluation...');
    const evaluation = {
        solutions: bundleEvaluationAndSort(solutions, specialization.solutions, robustness.solutions),
        baselines: bundleEvaluationAndSort(baselines, specialization.baselines, robustness.baselines),
    };

    return evaluation;
}

const addShortId = (prefix) => (individual, index) => {
    individual.shortId = prefix + index;

    return individual;
};

function evaluateFoundSolutions2x(solutions, baselines) {
    solutions.forEach(addShortId('S-'));
    baselines.forEach(addShortId('B-'));

    const evaluation = evaluateFoundSolutions(solutions, baselines, console.log);

    let prevEvaluation = evaluation;
    let bestSolutions = solutions;

    console.log('Iteratively removing worst...');

    while (bestSolutions.length > 10) {

        bestSolutions = prevEvaluation.solutions
            .slice(0, prevEvaluation.solutions.length - 1)
            .map(grouped => grouped.individual);

        prevEvaluation = evaluateFoundSolutions(bestSolutions, baselines);
    }

    const outcomeTables = getOutcomeTables(solutions, baselines);
    const evaluationTables = getEvaluationTables(evaluation);

    const outcomeTablesBest = getOutcomeTables(bestSolutions, baselines);
    const evaluationTablesBest = getEvaluationTables(prevEvaluation);

    const allTables = `
${outcomeTables.solutions}
${outcomeTables.baselines}
${evaluationTables.solutions}
${evaluationTables.baselines}

%%
%% After selecting best
%%

${outcomeTablesBest.solutions}
${outcomeTablesBest.baselines}
${evaluationTablesBest.solutions}
${evaluationTablesBest.baselines}
`;

    console.log(`allTables:`, allTables);
    console.log(`MemoizedGameResults.nofGamesSimulated:`, MemoizedGameResults.nofGamesSimulated);
}


// Test
import Individual from '~/coevolution/individual/Individual';
import * as Genome from '~/coevolution/individual/genome';
// import { population as foundSolutions } from '../../../dump/bol-8-add-01-000/solutions';
// import { population as foundSolutions } from '../../../dump/bol-8-add-01-more-stats-000/solutions';
import { population as foundSolutions } from '../../../dump/handmade-improved-add-01-bol-26-000/solutions';
import { getBaselines } from '~/coevolution/individual/baselines';

const solutions = foundSolutions
    .slice(0, 25) // TEST, pick max 25 to speed up
    .map(strategy => Genome.encodeGenome(strategy))
    .map(genome => new Individual(genome));


evaluateFoundSolutions2x(solutions, getBaselines());
