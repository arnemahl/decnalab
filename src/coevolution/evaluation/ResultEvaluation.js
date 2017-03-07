import * as MemoizedGameResults from '~/coevolution/individual/memoizedGameResults';
import { leftPad } from '~/util/stringPad';
import { sumTotal, calcStats } from '~/util/calc';

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

function getOutcomeTables(solutions, baselines, opponents) {

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

    const rowNames = ['Id/Id'].concat(opponents.map(opponent => opponent.shortId));

    return {
        solutions: latexTableString('Found solutions vs opponents', rowNames, solutions.map(getResultsVsOpponents).map(toRow)),
        baselines: latexTableString('Baselines vs opponents', rowNames, baselines.map(getResultsVsOpponents).map(toRow)),
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
            [ 'Id', 'Specialization', 'Robustness', 'Viability'],
            evaluation.solutions.map(one =>
                [ one.individual.shortId, one.specialization.toFixed(2), one.robustness.toFixed(2), one.viability.toFixed(2) ]
            ),
            14,
        ),
        baselines: latexTableString(
            'Baselines',
            [ 'Id', 'Specialization', 'Robustness', 'Viability'],
            evaluation.baselines.map(one =>
                [ one.individual.shortId, one.specialization.toFixed(2), one.robustness.toFixed(2), one.viability.toFixed(2) ]
            ),
            14,
        ),
    };
}

function evaluateFoundSolutions(solutions, baselines, opponents, logProgress = () => {}) {

    logProgress('Calculating specialization...');
    const specialization = evaluateSpecialization(solutions, baselines, opponents);

    logProgress('Calculating robustness...');
    const robustness = evaluateRobustness(solutions, baselines, opponents);

    logProgress('Calculating overall evaluation...');
    const evaluation = {
        solutions: bundleEvaluationAndSort(solutions, specialization.solutions, robustness.solutions),
        baselines: bundleEvaluationAndSort(baselines, specialization.baselines, robustness.baselines),
    };

    return evaluation;
}

const addShortId = (prefix) => (individual, index) => {
    individual.shortId = prefix + leftPad(index, 2, '0');

    return individual;
};

function evaluateFoundSolutions2x(solutions, baselines, selectOpponents, keepBest, logProgress = () => {}) {
    solutions.forEach(addShortId('S-'));
    baselines.forEach(addShortId('B-'));

    const evaluation = evaluateFoundSolutions(solutions, baselines, selectOpponents(solutions, baselines), logProgress);

    let prevEvaluation = evaluation;
    let bestSolutions = solutions;

    logProgress('Iteratively removing worst...');

    while (bestSolutions.length > keepBest) {

        bestSolutions = prevEvaluation.solutions
            .slice(0, prevEvaluation.solutions.length - 1)
            .map(grouped => grouped.individual);

        prevEvaluation = evaluateFoundSolutions(bestSolutions, baselines, selectOpponents(bestSolutions, baselines)); // PS: don't log progress when reiterating
    }

    const outcomeTables = getOutcomeTables(solutions, baselines, selectOpponents(solutions, baselines));
    const evaluationTables = getEvaluationTables(evaluation);

    const outcomeTablesBest = getOutcomeTables(bestSolutions, baselines, selectOpponents(bestSolutions, baselines));
    const evaluationTablesBest = getEvaluationTables(prevEvaluation);

    const latexTables = `
%%
%% After selecting best found solutions
%%

${evaluationTablesBest.solutions}
${evaluationTablesBest.baselines}
${outcomeTablesBest.solutions}
${outcomeTablesBest.baselines}

%%
%% Before selecting best found solutions
%%

${evaluationTables.solutions}
${evaluationTables.baselines}
${outcomeTables.solutions}
${outcomeTables.baselines}
`;

    return {
        finalResults: prevEvaluation,
        latexTables
    };
}

export function evaluate(solutions, baselines, keepBest = 8, logProgress = () => {}) {
    logProgress('');
    logProgress('*************************************');
    logProgress('**  Evaluating coevolution results **');
    logProgress('*************************************');
    logProgress('');

    // Evaluate performance of solutions to performance of baselines, with respect to opponents,
    // where opponents are (1) solutions, (2) baselines and (3) both solutions and baselines.
    const evaluation = {
        vsSolutions: evaluateFoundSolutions2x(solutions, baselines, (solutions, baselines) => solutions, keepBest, logProgress), // eslint-disable-line no-unused-vars
        vsBaselines: evaluateFoundSolutions2x(solutions, baselines, (solutions, baselines) => baselines, keepBest), // PS: only log progress 1st time
        vsAll: evaluateFoundSolutions2x(solutions, baselines, (solutions, baselines) => solutions.concat(baselines), keepBest), // PS: only log progress 1st time
    };

    const stats = {
        solutions: {
            vsSolutions: {
                viability: calcStats(evaluation.vsSolutions.finalResults.solutions.map(x => x.viability)),
                robustness: calcStats(evaluation.vsSolutions.finalResults.solutions.map(x => x.robustness)),
                specialization: calcStats(evaluation.vsSolutions.finalResults.solutions.map(x => x.specialization)),
            },
            vsBaselines: {
                viability: calcStats(evaluation.vsBaselines.finalResults.solutions.map(x => x.viability)),
                robustness: calcStats(evaluation.vsBaselines.finalResults.solutions.map(x => x.robustness)),
                specialization: calcStats(evaluation.vsBaselines.finalResults.solutions.map(x => x.specialization)),
            },
            vsAll: {
                viability: calcStats(evaluation.vsAll.finalResults.solutions.map(x => x.viability)),
                robustness: calcStats(evaluation.vsAll.finalResults.solutions.map(x => x.robustness)),
                specialization: calcStats(evaluation.vsAll.finalResults.solutions.map(x => x.specialization)),
            },
        },
        baselines: {
            vsSolutions: {
                viability: calcStats(evaluation.vsSolutions.finalResults.baselines.map(x => x.viability)),
                robustness: calcStats(evaluation.vsSolutions.finalResults.baselines.map(x => x.robustness)),
                specialization: calcStats(evaluation.vsSolutions.finalResults.baselines.map(x => x.specialization)),
            },
            vsBaselines: {
                viability: calcStats(evaluation.vsBaselines.finalResults.baselines.map(x => x.viability)),
                robustness: calcStats(evaluation.vsBaselines.finalResults.baselines.map(x => x.robustness)),
                specialization: calcStats(evaluation.vsBaselines.finalResults.baselines.map(x => x.specialization)),
            },
            vsAll: {
                viability: calcStats(evaluation.vsAll.finalResults.baselines.map(x => x.viability)),
                robustness: calcStats(evaluation.vsAll.finalResults.baselines.map(x => x.robustness)),
                specialization: calcStats(evaluation.vsAll.finalResults.baselines.map(x => x.specialization)),
            },
        },
    };

    const score = {
        vsSolutions: stats.solutions.vsSolutions.viability.average / stats.baselines.vsSolutions.viability.average,
        vsBaselines: stats.solutions.vsBaselines.viability.average / stats.baselines.vsBaselines.viability.average,
        vsAll: stats.solutions.vsAll.viability.average / stats.baselines.vsAll.viability.average,
    };

    const toStrategyWithShortId = wrapped => {
        const {shortId, strategy} = wrapped.individual;

        return {
            shortId,
            ...strategy,
        };
    };

    return {
        bestSolutions: {
            vsSolutions: evaluation.vsSolutions.finalResults.solutions.map(toStrategyWithShortId),
            vsBaselines: evaluation.vsBaselines.finalResults.solutions.map(toStrategyWithShortId),
            vsAll: evaluation.vsAll.finalResults.solutions.map(toStrategyWithShortId),
        },
        latexTables: {
            vsSolutions: evaluation.vsSolutions.latexTables,
            vsBaselines: evaluation.vsBaselines.latexTables,
            vsAll: evaluation.vsAll.latexTables,
            score: latexTableString('Coevolution Score', ['vs solutions', 'vs baselines', 'vs all'], [ Object.values(score).map(number => number.toFixed(3)) ], 14)
        },
        json: {
            score,
            stats
        },
    };
}
