import Vectors from '~/rts/spatial/Vectors';

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
        this.scheduledCollisions = {};
    }

    getEnemyTeamId = (team) => this.teams.find(anyTeam => anyTeam !== team);
    getEnemyMoves = (team) => this.moves[this.getEnemyTeamId(team)];
    getDirectionToEnemyBase = (team) => Vectors.direction(team.unitSpawnPosition, this.getEnemyTeam(team).unitSpawnPosition);

    getCollisionTick(moveOne, moveTwo) {
        const {unit: one} = moveOne;
        const {unit: two} = moveOne;

        this.engine.updateUnitPosition(one);
        this.engine.updateUnitPosition(two);

        const ticksUntilCollision = (one.position.y - two.position.y) / (two.currentSpeed.y - two.currentSpeed.y); // May be +/-infinity, but that's OK!
        const collisionTick = this.engine.getTick() + Math.ceil(ticksUntilCollision);

        if (this.engine.getTick() <= collisionTick && collisionTick <= Math.max(moveOne.maxTick, moveTwo.maxTick)) {
            return collisionTick;
        } else {
            return Number.POSITIVE_INFINITY;
        }
    }

    getSpeedLeader(team, speed) {
        return this.leaders[team.id][speed];
    }
    setSpeedLeader(move) {
        const {unit} = move;

        this.leaders[unit.team.id][move.speed] = move;

        // Check if any enemies will collide with this unit rather than another speed leader on the team
        getEnemyMoves(unit.team).forEach(enemyMove => {
            const collisionTick = this.getCollisionTick(move, enemyMove);
            const willCollide = Nubmer.isFinite(collisionTick);

            const scheduled = this.scheduledCollisions[enemyMove.unit.id];
            const withThisMove = !scheduled || collisionTick < scheduled.collisionTick;

            if (willCollide && withThisMove) {
                this.unscheduleCollision(enemyMove.unit);
                this.scheduleCollision(enemyMove, move.unit, collisionTick);
            }
        });
    }
    findNewSpeedLeader(team, speed) {
        // TODO IMPORTANT: Ensure all moving units have their positions updated before using CollisionDetector!!!
        const byClosenessToEnemyBase = getDirectionToEnemyBase(unit.team).y > 0
            ? (one, two) => two.unit.position.y - one.unit.position.y
            : (one, two) => one.unit.position.y - two.unit.position.y;

        const newSpeedLeader = Object
            .values(this.moves[team.id])
            .filter(move => move.speed === speed)
            .sort(byClosenessToEnemyBase)
            [0];

        if (newSpeedLeader) {
            setSpeedLeader(newSpeedLeader);
        }
    }

    handleCollision(move, anotherUnit) {
        this.engine.updateUnitPosition(move.unit);
        this.engine.updateUnitPosition(anotherUnit);

        move.onCollision(anotherUnit);
    }
    scheduleCollision(move, anotherUnit, collisionTick) {
        const task = () => this.handleCollision(move, anotherUnit);

        const removeTask = () => {
            if (this.engine.getTick() < tick) {
                this.engine.taskSchedule.removeTask(task, tick);
            }
        };

        this.engine.taskSchedule.addTask(task, tick);
        this.scheduledCollisions[move.unit.id] = { collisionTick, removeTask };
    }
    unscheduleCollision(unit) {
        if (this.scheduledCollisions[unit.id]) {
            this.scheduledCollisions[unit.id].removeTask();
            delete this.scheduledCollisions[moveId];
        }
    }

    speedChanged(unit, maxTick = Number.POSITIVE_INFINITY, onCollision) {

        /**  CLEAN UP OLD MOVE / SCHEDULED COLLISION  **/
        // Remove old move and unschedule old collisions for unit
        const oldMove = this.moves[unit.team.id][unit.id];
        delete this.moves[unit.team.id][unit.id];
        this.unscheduleCollision(unit.id);

        // Recalculate speed leader in the case that unit may have been speed leader for previous speed
        if (oldMove) {
            if (getSpeedLeader(unit.team, oldMove.speed) === oldMove) {
                findNewSpeedLeader(unit.team, oldMove.speed)
            }
        }


        /**  CREATE NEW MOVE / SCHEDULE COLLISION  **/
        const isStandingStill = unit.currentSpeed.y === 0;
        const speed = isStandingStill ? 0 : unit.specs.speed;

        // Create new move
        const move = {
            unit,
            onCollision,
            maxTick,
            speed,
        };

        this.moves[unit.team.id].push(move);


        // If ahead of speed leader, or no speed leader exists, update speed leader
        const speedLeader = this.getSpeedLeader(unit.team, speed);

        if (!speedLeader) {
            this.setSpeedLeader(move);
            return;
        } else {
            const isCloserToEnemyBase = getDirectionToEnemyBase(unit.team).y > 0
                ? unit.position.y > speedLeader.unit.position.y
                : unit.position.y < speedLeader.unit.position.y;

            if (isCloserToEnemyBase) {
                this.setSpeedLeader(move);
            }
        }

        if (isStandingStill) {
            return; // Don't trigger onCollision if standing still
        }


        // For enemy moves, check which (if any) unit will collide with
        this.getEnemyMoves(unit.team).forEach(enemySpeedLeaders => {
            const enemyMove = Object
                    .values(enemySpeedLeaders)
                    .sort((enemyMoveA, enemyMoveB) => this.getCollisionTick(move, enemyMoveA) - this.getCollisionTick(move, enemyMoveB))
                    [0];

            if (!enemyMove) {
                return;
            }

            const collisionTick = this.getCollisionTick(move, enemyMove);

            if (collisionTick === this.engine.getTick()) {
                this.handleCollision(move, enemyMove.unit);
            } else if (Number.isFinite(collisionTick)) {
                this.scheduleCollision(move, enemyMove.unit, collisionTick);
            }
        });
    }

    startMove = (unit, tagetPosition, onCollision) => {
        if (Vectors.equals(Vectors.zero(), unit.currentSpeed)) {
            throw Error('CollisionDetector.endMove() received unit with currentSpeed == zero');
        }

        const maxTick = (targetPosition.y - unit.position.y) / unit.currentSpeed.y;
        this.speedChanged(unit, maxTick, onCollision);
    }

    endMove = (unit) => {
        if (Vectors.notEquals(Vectors.zero(), unit.currentSpeed)) {
            throw Error('CollisionDetector.endMove() received unit with currentSpeed != zero');
        }

        // recalculate collisions
        this.speedChanged(unit, void 0, void 0);
    }
}
