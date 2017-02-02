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

    constructor(engine, teams, map) {
        this.engine = engine;
        this.teams = teams.map(team => team.id);

        if (map.direction !== 'vertical') {
            throw Error('CollisionDetector is only implemented for vertical maps');
        }

        this.moves = teams.reduce((moves, team) => {
            moves[team.id] = [];
            return moves;
        }, {});
        this.leaders = teams.reduce((leaders, team) => {
            leaders[team.id] = [];
            return leaders;
        }, {});
        this.registeredCollisions = {};
    }

    getEnemyTeamId = (team) => this.teams.find(anyTeam => anyTeam !== team);
    getEnemyMoves = (team) => this.moves[this.getEnemyTeamId(team)];
    getDirectionToEnemyBase = (team) => Vectors.direction(team.unitSpawnPosition, this.getEnemyTeam(team).unitSpawnPosition);

    getCollisionTick(moveOne, moveTwo) {
        const {unit: one} = moveOne;
        const {unit: two} = moveOne;

        this.engine.updateUnitPosition(one);
        this.engine.updateUnitPosition(two);

        const ticksUntilCollision = (one.position.y - two.position.y) / (two.currentSpeed.y - two.currentSpeed.y); // Note: May be +/-infinity (if divide by zero), but that's OK!
        const collisionTick = currentTick + Math.ceil(ticksUntilCollision);

        if (this.engine.getTick() <= collisionTick && collisionTick <= Math.max(moveOne.maxTick, moveTwo.maxTick)) {
            return collisionTick;
        } else {
            return Number.POSITIVE_INFINITY;
        }
    }

    handleCollision(moveOne, moveTwo) {
        this.engine.updateUnitPosition(move.unit);
        this.engine.updateUnitPosition(enemyMove.unit);

        move.onCollision(enemyMove.unit);
        enemyMove.onCollision(move.unit);
    }
    scheduleCollision(moveOne, moveTwo, collisionTick) {
        const task = () => this.handleCollision(moveOne, moveTwo);

        let alreadyRemoved = false;
        const removeTask = () => {
            if (this.engine.getTick() < tick && !alreadyRemoved) {
                alreadyRemoved = true;
                this.engine.taskSchedule.removeTask(task, tick);
            }
        };

        this.engine.taskSchedule.addTask(task, tick);
        this.registeredCollisions[move.unit.id][enemyMove.unit.id] = removeTask;
        this.registeredCollisions[enemyMove.unit.id][move.unit.id] = removeTask;
    }
    unscheduleAllCollisions(moveId) {
        // Remove the tasks to fire onCollision for moves
        Object.values(this.registeredCollisions[moveId]).forEach(removeTask => removeTask());

        // Remove registered collisions with move
        delete this.registeredCollisions[moveId];
        Object.values(this.registeredCollisions).forEach(otherMovesCollisions => {
            delete otherMovesCollisions[moveId];
        });
    }

    startMove = (unit, targetPosition, onCollision) => {
        const currentTick = this.engine.getTick();

        const move = {
            unit,
            onCollision,
            endTick: (targetPosition.y - unit.position.y) / unit.currentSpeed.y,
        };

        this.moves[unit.team.id].push(move);

        // For each unit speed, keep track of the leader (closest one to the enemy base)
        if (!this.leaders[unit.team.id][unit.specs.speed]) {
            this.leaders[unit.team.id][unit.specs.speed] = move;
            return;
        } else {
            const speedLeader = this.leaders[unit.team.id][unit.specs.speed].unit;
            const isCloserToEnemyBase = getDirectionToEnemyBase(unit.team).y > 0
                ? unit.position.y > speedLeader.position.y
                : unit.position.y < speedLeader.position.y;

            if (isCloserToEnemyBase) {
                this.leaders[unit.team.id][unit.specs.speed] = move;
            }
        }

        // For enemy teams
        this.getEnemyMoves(unit.team).forEach(leadersForEachMoveSpeed => {
            const collisionMove = Object.values(leadersForEachMoveSpeed)
                .sort((enemyMoveA, enemyMoveB) => this.getCollisionTick(move, enemyMoveA) - this.getCollisionTick(move, enemyMoveB))[0];

            if (!collisionMove) {
                return;
            }

            const collisionTick = this.getCollisionTick(move, collisionMove);

            if (collisionTick === currentTick) {
                this.handleCollision(move, collisionMove);
            } else if (Number.isFinite(collisionTick)) {
                this.scheduleCollision(move, collisionMove, collisionTick);
            }
        });
    }

    endMove = (unit) => {
        delete this.moves[unit.team.id][unit.id];
        this.unscheduleAllCollisions(unit.id);
    }
}
