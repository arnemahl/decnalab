import Game from '~/rts/Game';
import {maxLoopsPerGame, maxTicksPerGame} from '~/coevolution/config';

const memo = {};

export let nofGamesSimulated = 0;

/* Get result of game between two _individuals_ */
export function getResult(one, two) {
    if (!memo[one.id]) {
        memo[one.id] = {};
    }
    if (!memo[two.id]) {
        memo[two.id] = {};
    }

    if (memo[one.id][two.id]) {
        return memo[one.id][two.id];
    } else {
        nofGamesSimulated++;

        const game = new Game('game-id', maxLoopsPerGame, maxTicksPerGame, one.strategy, two.strategy);

        game.simulate();

        memo[one.id][two.id] = game.finalScore.blue;
        memo[one.id][two.id].opponentId = two.id;

        memo[two.id][one.id] = game.finalScore.red;
        memo[two.id][one.id].opponentId = one.id;

        return memo[one.id][two.id];
    }
}
