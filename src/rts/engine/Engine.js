import Vectors from '~/rts/spatial/Vectors';
import TaskSchedule from '~/rts/util/TaskSchedule';
import Command from '~/rts/commandable/Command';
import {getIdGenerator} from '~/rts/util/IdGenerator';

import EventReceiver from '~/rts/engine/EventReceiver';
import CommandableManager from '~/rts/engine/CommandableManager';
import AttackEngine from '~/rts/engine/AttackEngine';

export default class Engine {

    constructor(map, teams) {
        this.taskSchedule = new TaskSchedule();
        this.commandIdGenerator = getIdGenerator('command');
        this.tick = 0;
        this.tickReader = {
            getCurrentTick: () => this.tick
        };

        const eventReceiver = new EventReceiver(this);
        this.commandableManager = new CommandableManager(eventReceiver, teams, map);
    }

    doTick = () => {
        const {tick, tasks} = this.taskSchedule.getNext();

        this.tick = tick;
        tasks.forEach(task => task());

        return this.tick;
    }

    clearCommands = (commandable) => {
        commandable.clearCommands();
    }

    addCommand(commandType, commandable, calcFinishedTick, onStart, onFinish, onAbort) {
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
        let startTick; // set upon start

        const calcFinishedTick = () => {
            return this.tick + Vectors.absoluteDistance(unit.position, targetPosition) / unit.specs.speed;
        };
        const onStart = () => {
            startTick = this.tick;
            unit.currentSpeed = Vectors.direction(unit.position, targetPosition, unit.specs.speed);
            return true;
        };
        const doMove = () => {
            const moved = Vectors.scale(unit.currentSpeed, this.tick - startTick);
            unit.position = Vectors.add(unit.position, moved);
            unit.currentSpeed = Vectors.zero();
        };
        const onFinish = () => {
            doMove();

            if (!unit.isAt(targetPosition)) {
                console.error('ERROR in moveUnit, ended up:', Vectors.absoluteDistance(unit.position, targetPosition), 'from targetPosition');
            }
        };
        const onAbort = doMove;

        this.addCommand('move', unit, calcFinishedTick, onStart, onFinish, onAbort);
    }

    attackWithUnit = (unit, target) => {
        const calcFinishedTick = () => {
            return this.tick + unit.specs.weapon.cooldown;
        };
        const onStart = () => {
            if (unit.isOnCooldown) {
                return false;
            }
            unit.isOnCooldown = true;

            const didKill = AttackEngine.applyAttack(unit, target);

            if (didKill) {
                this.commandableManager.remove(target); // Ideally let the other unit attack at same tick before dying.
            }

            return true;
        };
        const onFinish = () => {
            unit.isOnCooldown = false;
        };
        const onAbort = () => {};

        this.addCommand('attack', unit, calcFinishedTick, onStart, onFinish, onAbort);
    }

    harvestWithUnit = (worker, resourceSite) => {
        const calcFinishedTick = () => this.tick + resourceSite.harvestDuration;
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

        this.addCommand('harvest', worker, calcFinishedTick, onStart, onFinish, onAbort);
    }

    dropOffHarvestWithUnit = (worker, baseStructure) => {
        const calcFinishedTick = () => this.tick;
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

        this.addCommand('dropOffHarvest', worker, calcFinishedTick, onStart, onFinish, onAbort);
    }

    buildWithUnit = (worker, structureSpec, targetPosition) => {
        let structure; // initialized upon start
        let didStart; // initialized upon start

        const calcFinishedTick = () => this.tick + structureSpec.cost.time;
        const onStart = () => {
            const canBuild = worker.isAt(targetPosition)
                && ['abundant', 'sparse'].every(resourceType => worker.team.resources[resourceType] - structureSpec.cost[resourceType] >= 0);

            if (canBuild) {
                structure = this.commandableManager.structureStarted(worker, structureSpec, targetPosition);
                ['abundant', 'sparse'].forEach(resourceType => worker.team.resources[resourceType] -= structureSpec.cost[resourceType]); // eslint-disable-line no-return-assign
            }
            didStart = canBuild;

            return canBuild;
        };
        const onFinish = () => {
            this.commandableManager.structureFinished(structure);
        };
        const onAbort = () => {
            if (didStart) {
                this.commandableManager.structureCancelled(structure);
                ['abundant', 'sparse'].forEach(resourceType => worker.team.resources[resourceType] += structureSpec.cost[resourceType]); // eslint-disable-line no-return-assign
            }
        };

        this.addCommand('build', worker, calcFinishedTick, onStart, onFinish, onAbort);
    }

    /****************************/
    /***  Structure commands  ***/
    /****************************/


    produceUnitFromStructure = (structure, unitSpec) => {
        let didStart;

        const calcFinishedTick = () => this.tick + unitSpec.cost.time;
        const onStart = () => {
            const canProduce = (
                ['abundant', 'sparse'].every(resourceType => structure.team.resources[resourceType] - unitSpec.cost[resourceType] >= 0)
                && structure.team.supply - structure.team.usedSupply - unitSpec.cost.supply >= 0
                && structure instanceof unitSpec.producedBy
            );

            if (canProduce) {
                ['abundant', 'sparse'].forEach(resourceType => structure.team.resources[resourceType] -= unitSpec.cost[resourceType]); // eslint-disable-line no-return-assign
                structure.team.usedSupply += unitSpec.cost.supply;
            }
            didStart = canProduce;

            return canProduce;
        };
        const onFinish = () => {
            this.commandableManager.structureProducedUnit(structure, unitSpec);
        };
        const onAbort = () => {
            if (didStart) {
                ['abundant', 'sparse'].forEach(resourceType => structure.team.resources[resourceType] += unitSpec.cost[resourceType]); // eslint-disable-line no-return-assign
                structure.team.usedSupply -= unitSpec.cost.supply;
            }
        };

        this.addCommand('produce', structure, calcFinishedTick, onStart, onFinish, onAbort);
    }


}
