import Game from '~/rts/Game';
// import Replay from '~/rts/Replay';
import {getIdGenerator} from '~/rts/util/IdGenerator';

function play(game) {
    return new Promise((resolve/*, reject*/) => {

        game.onFinish = resolve;
        game.play();

    });
}
export function playSafe(game) {
    return new Promise((resolve, reject) => {
        play(game)
        .then(resolve)
        .catch(exception => {
            console.error('Game exception');
            console.error(exception.stack);
            reject(exception);
        });
    });
}



/***********************/
/** Simulate one game **/
/***********************/

const gameIdGenerator = getIdGenerator('game');

export function simulateGame(maxLoops = 999) {
    const id = gameIdGenerator.generateId();
    const game = new Game(id, maxLoops);
    return playSafe(game);
}



/*************************/
/** Simulate many games **/
/*************************/

function simulateGames(simulationId, nofGames, maxLoops) {
    console.log('start ', simulationId);
    console.time(`simulationId(${simulationId}) Playing ${nofGames} games with max ${maxLoops} loops, finished in`);

    const gamePromises = [];

    for (let i = 0; i < nofGames; i++) {
        // Play game
        const gamePromise = play(new Game(i, maxLoops));

        gamePromises.push(gamePromise);

        // // Test replay
        // gamePromise.then(game => {
        //     const rep = new Replay(game.id, game.teamIds, game.states);

        //     while (rep.forward()) {
        //         // repeat
        //     }
        // }).catch(exception => {
        //     console.error('Replay exception');
        //     console.error(exception.stack);
        // });
    }

    // Log games finished
    Promise.all(gamePromises).then(() => {
        console.timeEnd(`simulationId(${simulationId}) Playing ${nofGames} games with max ${maxLoops} loops, finished in`);
    }).catch((exception) => {
        console.error('Game exception');
        console.error(exception.stack);
    });
}

export function runSimulations() {
    let simulationId = 1;
    const nofGames = 1;
    const maxLoops = 99;

    simulateGames(simulationId++, nofGames, maxLoops);
}
