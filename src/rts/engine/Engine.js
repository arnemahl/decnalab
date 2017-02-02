import Vectors from '~/rts/spatial/Vectors';
import TaskSchedule from '~/rts/util/TaskSchedule';
import Command from '~/rts/commandable/Command';
import {getIdGenerator} from '~/rts/util/IdGenerator';

import EventReceiver from '~/rts/engine/EventReceiver';
import CommandableManager from '~/rts/engine/CommandableManager';
import AttackEngine from '~/rts/engine/AttackEngine';
import SimpleVision from '~/rts/spatial/SimpleVision';
import CollisionDetector from '~/rts/spatial/CollisionDetector';

export default class Engine {

    constructor(map, teams) {
        this.map = map;
        this.taskSchedule = new TaskSchedule();
        this.tickCleanupTasks = [];
        this.commandIdGenerator = getIdGenerator('command');
        this.tick = 0;
        this.tickReader = {
            getCurrentTick: () => this.tick
        };

        const eventReceiver = new EventReceiver(this);
        this.commandableManager = new CommandableManager(eventReceiver, teams, map);
        this.simpleVision = new SimpleVision(map, teams);
        this.collisionDetector = new CollisionDetector({
            taskSchedule: this.taskSchedule,
            getTick: () => this.tick,
            simpleVision: this.simpleVision, // is simpleVision used?
        }, teams, map);
        this.movingUnits = {};
    }

    doTick = () => {
        const {tick, tasks} = this.taskSchedule.getNext();

        Object.values(this.movingUnits).forEach(this.updateUnitPosition);

        this.tick = tick;
        tasks.forEach(task => task());

        this.tickCleanupTasks.forEach(task => task());
        this.tickCleanupTasks = [];

        return this.tick;
    }

    setUnitSpeed = (unit, speed) => {
        unit.currentSpeed = speed;
        unit.speedSetAtTick = this.tick;

        if (Vectors.isZero(speed)) {
            delete this.movingUnits[unit.id];
        } else {
            this.movingUnits[unit.id] = unit;
        }
    }
    updateUnitPosition = (unit) => {
        if (unit.speedSetAtTick === this.tick) {
            return;
        }

        const oldPosition = unit.position;

        unit.position = Vectors.add(unit.position, Vectors.scale(unit.currentSpeed, this.tick - unit.speedSetAtTick));
        unit.speedSetAtTick = this.tick;

        this.simpleVision.commandableMoved(unit, oldPosition);
    }

    clearCommands = (commandable) => {
        commandable.clearCommands();
    }

    addCommand(commandType, commandable, calcFinishedTick, onReceive, onStart, onFinish, onAbort) {
        const commandAccepted = onReceive();

        if (!commandAccepted) {
            throw Error(`Unacceptable command ${commandType} issued to ${commandable.id}`);
        }

        const commandId = this.commandIdGenerator.generateId();

        let didStart = false;
        let isScheduled = false;
        let finishedTick; // calculated upon start

        const safeCalcFinishedTick = () => {
            const finishedTickFloat = calcFinishedTick(this.tick);

            if (typeof finishedTickFloat !== 'number') {
                const error = `Command ${commandType} did not provide finishedTick of type number`;
                throw error;
            }

            return Math.ceil(finishedTickFloat);
        };

        const finishAndContinue = () => {
            onFinish();
            commandable.commandCompleted(commandId);
        };

        const start = () => {
            didStart = onStart();

            if (!didStart) {
                onAbort();
                return;
            }

            finishedTick = safeCalcFinishedTick();

            if (finishedTick === this.tick) {
                finishAndContinue();
            } else {
                isScheduled = true;
                this.taskSchedule.addTask(finishAndContinue, finishedTick);
            }
        };

        const stop = () => {
            if (didStart) {
                onAbort();
            }

            if (isScheduled) {
                this.taskSchedule.removeTask(finishAndContinue, finishedTick);
            }
        };

        commandable.addCommand(new Command(commandId, commandType, start, stop));
    }

    /***********************/
    /***  Unit commands  ***/
    /***********************/


    moveUnit = (unit, targetPosition) => {
        if (!this.map.bounds.contains(targetPosition)) {
            throw Error(`Target position out of bounds ${Vectors.toString(targetPosition)}`);
        }

        const onReceive = () => true;
        const calcFinishedTick = () => {
            return this.tick + Vectors.absoluteDistance(unit.position, targetPosition) / unit.specs.speed;
        };
        const onStart = () => {
            this.setUnitSpeed(unit, Vectors.direction(unit.position, targetPosition, unit.specs.speed));
            this.collisionDetector.startMove(unit, targetPosition, () => {});
            return true;
        };
        const doMove = () => {
            this.updateUnitPosition(unit);
            this.setUnitSpeed(unit, Vectors.zero());
            this.collisionDetector.endMove(unit);
        };
        const onFinish = () => {
            doMove();

            if (!unit.isAt(targetPosition)) {
                console.error('ERROR in moveUnit, ended up:', Vectors.absoluteDistance(unit.position, targetPosition), 'from targetPosition');
            }
        };
        const onAbort = doMove;

        this.addCommand('move', unit, calcFinishedTick, onReceive, onStart, onFinish, onAbort);
    }

    attackMoveUnit = (unit, targetPosition) => {
        if (!this.map.bounds.contains(targetPosition)) {
            throw Error(`Target position out of bounds ${Vectors.toString(targetPosition)}`);
        }

        /* should only be used to walk in a straight line toward the enemy spawn point (because that makes it easy to calculate collisions) */
        const onCollision = (enemyUnit) => {
            const isWithinRange = Vectors.absoluteDistance(unit.position, enemyUnit.position) <= unit.specs.weapon.range;

            if (!isWithinRange) {
                console.log('Collided but are too far away:', unit.position, enemyUnit.position, unit.specs.weapon.range); // DEBUG
                throw Error('Collided but are too far away');
            } else {
                this.clearCommands(unit);
                this.attackWithUnit(unit, enemyUnit);
            }
        };

        const onReceive = () => true;
        const calcFinishedTick = () => {
            // note: will most likely be aborted before this due to collision with enemy
            return this.tick + Vectors.absoluteDistance(unit.position, targetPosition) / unit.specs.speed;
        };
        const onStart = () => {
            this.setUnitSpeed(unit, Vectors.direction(unit.position, targetPosition, unit.specs.speed));
            this.collisionDetector.startMove(unit, targetPosition, onCollision);
            return true;
        };
        const doMove = () => {
            this.updateUnitPosition(unit);
            this.setUnitSpeed(unit, Vectors.zero());
            this.collisionDetector.endMove(unit);
        };
        const onFinish = () => {
            doMove();

            if (!unit.isAt(targetPosition)) {
                console.error('ERROR in moveUnit, ended up:', Vectors.absoluteDistance(unit.position, targetPosition), 'from targetPosition');
            }
        };
        const onAbort = doMove;

        this.addCommand('attack-move', unit, calcFinishedTick, onReceive, onStart, onFinish, onAbort);
    }

    attackWithUnit = (unit, target) => {
        const calcFinishedTick = () => {
            return this.tick + unit.specs.weapon.cooldown;
        };
        const onReceive = () => {
            return true;
        };
        const onStart = () => {
            const isWithinRange = Vectors.absoluteDistance(unit.position, target.position) <= unit.specs.weapon.range;
            if (!isWithinRange) {
                return false;
            }

            if (unit.isOnCooldown) {
                console.log('COOLDOWN'); // DEBUG
                return false;
            }
            unit.isOnCooldown = true;

            const didKill = AttackEngine.applyAttack(unit, target);
            if (didKill) {
                this.tickCleanupTasks.push(() => {
                    this.commandableManager.remove(target);
                    this.simpleVision.commandableRemoved(target);
                });
            }

            return true;
        };
        const onFinish = () => {
            unit.isOnCooldown = false;
        };
        const onAbort = () => {
            if (unit.healthLeftFactor > 0) {
                console.log('Uh oh, stuck on cooldown!');
            }
        };

        this.addCommand('attack', unit, calcFinishedTick, onReceive, onStart, onFinish, onAbort);
    }

    harvestWithUnit = (worker, resourceSite) => {
        const calcFinishedTick = () => this.tick + resourceSite.harvestDuration;
        const onReceive = () => true;
        const onStart = () => {
            const canHarvest = worker.isAt(resourceSite.position) && resourceSite.canBeHarvestedBy(worker);

            if (canHarvest) {
                resourceSite.startHarvesting(worker);
                worker.currentResourceSite = resourceSite;
            } else {
                worker.currentResourceSite = false;
            }

            return canHarvest;
        };
        const onFinish = () => {
            resourceSite.finishHarvesting(worker);
            if (worker.commandQueue.isEmpty()) {
                worker.returnHarvest();
            }
        };
        const onAbort = () => {
            resourceSite.abortHarvesting();
        };

        this.addCommand('harvest', worker, calcFinishedTick, onReceive, onStart, onFinish, onAbort);
    }

    dropOffHarvestWithUnit = (worker, baseStructure) => {
        const calcFinishedTick = () => this.tick;
        const onReceive = () => true;
        const onStart = () => {
            return worker.isAt(baseStructure.position);
        };
        const onFinish = () => {
            const harvest = worker.carriedResources;

            worker.team.resources[harvest.resourceType] += harvest.ammount;
            worker.carriedResources = false;

            if (worker.commandQueue.isEmpty()) {
                worker.harvestAgain();
            }
        };
        const onAbort = () => {};

        this.addCommand('dropOffHarvest', worker, calcFinishedTick, onReceive, onStart, onFinish, onAbort);
    }

    buildWithUnit = (worker, structureSpec, targetPosition) => {
        let structure; // initialized on receive
        let didPlan; // initialized on receive

        const calcFinishedTick = () => this.tick + structureSpec.cost.time;
        const onReceive = () => {
            const hasEnoughResources = ['abundant', 'sparse'].every(resourceType => worker.team.resources[resourceType] - structureSpec.cost[resourceType] >= 0);

            if (hasEnoughResources) {
                structure = this.commandableManager.structurePlanned(worker, structureSpec, targetPosition);
                ['abundant', 'sparse'].forEach(resourceType => worker.team.resources[resourceType] -= structureSpec.cost[resourceType]); // eslint-disable-line no-return-assign
            }
            didPlan = hasEnoughResources;

            return hasEnoughResources;
        };
        const onStart = () => {
            const canStart = worker.isAt(targetPosition);

            if (canStart) {
                this.commandableManager.structureStarted(structure);
                this.simpleVision.commandableAdded(structure);
            }

            return canStart;
        };
        const onFinish = () => {
            this.commandableManager.structureFinished(structure);
        };
        const onAbort = () => {
            if (didPlan) {
                this.commandableManager.structureCancelled(structure);
                this.simpleVision.commandableRemoved(structure);
                ['abundant', 'sparse'].forEach(resourceType => worker.team.resources[resourceType] += structureSpec.cost[resourceType]); // eslint-disable-line no-return-assign
            }
        };

        this.addCommand('build', worker, calcFinishedTick, onReceive, onStart, onFinish, onAbort);
    }

    /****************************/
    /***  Structure commands  ***/
    /****************************/


    produceUnitFromStructure = (structure, unitSpec) => {
        let didStart;

        const isProducer = structure instanceof unitSpec.producedBy;
        if (!isProducer) {
            throw Error(`Trying to produce ${unitSpec.constructor.name} from structure ${structure.constructor.name}, not possible`);
        }
        if (structure.isOnlyPlanned || structure.isUnderConstruction) {
            throw Error('Trying to produce from unfinished structure');
        }

        const calcFinishedTick = () => this.tick + unitSpec.cost.time;
        const onReceive = () => true;
        const onStart = () => {
            const canAfford = (
                ['abundant', 'sparse'].every(resourceType => structure.team.resources[resourceType] - unitSpec.cost[resourceType] >= 0)
                && structure.team.supply - structure.team.usedSupply - unitSpec.cost.supply >= 0
            );
            if (canAfford) {
                ['abundant', 'sparse'].forEach(resourceType => structure.team.resources[resourceType] -= unitSpec.cost[resourceType]); // eslint-disable-line no-return-assign
                structure.team.usedSupply += unitSpec.cost.supply;
            }
            didStart = canAfford;

            return canAfford;
        };
        const onFinish = () => {
            const unit = this.commandableManager.structureProducedUnit(structure, unitSpec);
            this.simpleVision.commandableAdded(unit);
        };
        const onAbort = () => {
            if (didStart) {
                ['abundant', 'sparse'].forEach(resourceType => structure.team.resources[resourceType] += unitSpec.cost[resourceType]); // eslint-disable-line no-return-assign
                structure.team.usedSupply -= unitSpec.cost.supply;
            }
        };

        this.addCommand('produce', structure, calcFinishedTick, onReceive, onStart, onFinish, onAbort);
    }


}
