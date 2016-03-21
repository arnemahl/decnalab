import Game from '~/rts/Game';


function play(game) {
    return new Promise((resolve, reject) => {

        game.onFinish = resolve;
        game.play();

    });
}

function simulateGames(simulationId, nofGames) {
    console.log('start ', simulationId);
    console.time(`simulationId(${simulationId}) Playing ${nofGames} games finished in`);

    const gamePromises = [];

    for (let i = 0; i < nofGames; i++) {
        gamePromises.push(
            play(new Game(i))
        );
    }

    Promise.all(gamePromises).then(() => {
        console.timeEnd(`simulationId(${simulationId}) Playing ${nofGames} games finished in`);
    });
}

let i = 0;

simulateGames(i++, 1);
