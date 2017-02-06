import Game from '~/rts/Game';
const maxGameLoops = 400;

export function evaluate_wip(individuals) {
    individuals.forEach(individual => {
        individual.fitness = 0;
    });

    individuals.forEach(one => {
        individuals.filter(two => two !== one).forEach(two => {
            const game = new Game('unnecessary-id', maxGameLoops, one.genome, two.genome);

            game.simulate();

            one.fitness += game.finalScore.blue.score;
            two.fitness += game.finalScore.red.score;
        });
    });
}
