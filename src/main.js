import Game from '~/rts/Game';
import Replay from '~/rts/Replay';

function play(game) {
    return new Promise((resolve/*, reject*/) => {

        game.onFinish = resolve;
        game.play();

    });
}

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

const maxLoops = 999;
let i = 0;

simulateGames(i++, 1, maxLoops);
