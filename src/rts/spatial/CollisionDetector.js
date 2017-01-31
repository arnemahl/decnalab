import Vectors from '~/rts/spatial/Vectors';

const DEBUG = true;
function calcExpctected(move, enemyMove, ticks) {
    const endY = move.y0 + move.dy * ticks;
    const enemyEndY = enemyMove.y0 + enemyMove.dy * ticks;

    return {endY, enemyEndY};
}
function assertCorrectCalculation(move, enemyMove, ticks) {
    const expected = calcExpctected(move, enemyMove, ticks);

    if (Math.abs(expected.endY - expected.enemyEndY) > 1) {
        console.log('\nCOLLICION CALCULATION ERROR');
        console.log(`ticks=${ticks}`);
        console.log(`move.y0=${move.y0} move.dy=${move.dy} expected.endY=${expected.endY}`);
        console.log(`enemyMove.y0=${enemyMove.y0} enemyMove.dy=${enemyMove.dy} expected.enemyEndY=${expected.enemyEndY}`);
        throw Error('COLLICION CALCULATION ERROR');
    }
}

export default class CollitionDetector {

    constructor(taskSchedule, getTick, teams, map) {
        this.taskSchedule = taskSchedule;
        this.getTick = getTick;
        this.moves = teams.reduce((moves, team) => {
            moves[team.id] = [];
            return moves;
        }, {});
        this.teamIds = teams.map(team => team.id);
        this.registeredCollisions = {};

        if (map.direction !== 'vertical') {
            throw Error('CollisionDetector is only implemented for vertical maps');
        }
    }

    startMove = (unit, targetPosition, onCollision) => {
        const currentTick = this.getTick();

        const move = {
            id: unit.id,
            t0: currentTick,
            y0: unit.position.y,
            dy: unit.currentSpeed.y,
            end: (targetPosition.y - unit.position.y) / unit.currentSpeed.y,
            onCollision,
            unit,
        };

        this.registeredCollisions[move.id] = {};

        this.teamIds
            .filter(teamId => teamId !== unit.team.teamId)
            .map(teamId => this.moves[teamId])
            .forEach(enemyMoves => {
                enemyMoves.forEach(enemyMove => {
                    const currentEnemyY = enemyMove.y0 + enemyMove.dy * (currentTick - enemyMove.t0);
                    const ticks = (move.y0 - currentEnemyY) / (enemyMove.dy - move.dy);
                    const tick = currentTick + Math.ceil(ticks);

                    if (currentTick <= tick && tick <= Math.min(move.end, enemyMove.end)) {
                        if (DEBUG) {
                            assertCorrectCalculation(move, { ...enemyMove, y0: currentEnemyY}, ticks);
                            const expected = calcExpctected(move, { ...enemyMove, y0: currentEnemyY }, ticks);

                            this.registerCollision(move, enemyMove, tick, expected);
                            return;
                        }

                        this.registerCollision(move, enemyMove, tick); // to stop weapon.range away, scedule for each with differnt tick
                    }
                });
            });

        this.moves[unit.team.id].push(move);
    }
    endMove = (unit) => {
        delete this.moves[unit.team.id][unit.id];
        this.deregisterAllCollisions(unit.id);
    }

    registerCollision(move, enemyMove, tick, expected) {
        const task = () => {
            move.unit.clearCommands();
            enemyMove.unit.clearCommands();

            if (DEBUG && (
                    Math.abs(move.unit.position.y - expected.endY) > move.unit.specs.speed ||
                    Math.abs(enemyMove.unit.position.y !== expected.enemyEndY) > enemyMove.unit.specs.speed
                )) {
                throw Error('ENDED UP WRONG');
            }

            move.onCollision(enemyMove.unit);
            enemyMove.onCollision(move.unit);
        };

        let alreadyRemoved = false;
        const removeTask = () => {
            if (this.getTick() < tick && !alreadyRemoved) {
                alreadyRemoved = true;
                this.taskSchedule.removeTask(task, tick);
            }
        };

        this.taskSchedule.addTask(task, tick);
        this.registeredCollisions[move.id][enemyMove.id] = removeTask;
        this.registeredCollisions[enemyMove.id][move.id] = removeTask;
    }
    deregisterAllCollisions(moveId) {
        // Remove the tasks to fire onCollision for moves
        Object.values(this.registeredCollisions[moveId]).forEach(removeTask => removeTask());

        // Remove registered collisions with move
        delete this.registeredCollisions[moveId];
        Object.values(this.registeredCollisions).forEach(otherMovesCollisions => {
            delete otherMovesCollisions[moveId];
        });
    }
}
