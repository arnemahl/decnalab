import Game from '~/rts/Game';
import {maxLoopsPerGame} from '~/coevolution/config';

const memo = {};

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
        const game = new Game('game-id', maxLoopsPerGame, one.strategy, two.strategy);

        game.simulate();

        memo[one.id][two.id] = game.finalScore.blue;
        memo[one.id][two.id].opponentId = two.id;

        memo[two.id][one.id] = game.finalScore.red;
        memo[two.id][one.id].opponentId = one.id;

        return memo[one.id][two.id];
    }
}
