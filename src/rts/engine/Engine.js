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
        this.ticker = {
            getCurrentTick: () => this.tick
        };

        const eventReceiver = new EventReceiver(this);
        this.commandableManager = new CommandableManager(eventReceiver, teams, map);
    }

    tick = () => {
        const {tick, tasks} = this.taskSchedule.getNext();

        this.tick = tick;
        tasks.forEach(task => task());

        return this.tick;
    }

    clearCommands = (commandable) => {
        commandable.clearCommands();
    }

    addCommand = (commandable, calcFinishedTick, onStart, onFinish, onAbort) => {
        const commandId = this.commandIdGenerator.generateId();

        let finishedTick; // calculated upon start

        const finishAndContinue = () => {
            onFinish();
            commandable.commandCompleted(commandId);
        };

        const start = () => {
            const didStart = onStart();

            if (!didStart) {
                onAbort();
                return;
            }

            const finishedTick = calcFinishedTick(this.tick);

            if (finishedTick === this.tick) {
                finishAndContinue();
            } else {
                this.taskSchedule.addTask(finishAndContinue, finishedTick);
            }
        };

        const stop = () => {
            onAbort();

            if (typeof finishedTick === 'undefined') {
                throw 'Cannot stop command before it is started.';
            }

            this.taskSchedule.removeTask(finishAndContinue, finishedTick);
        };

        commandable.addCommand(new Command(commandId, start, stop));
    }


    /*******************************/
    /***  All sorts of commands  ***/
    /*******************************/


    arbitraryCommand = (commandable, methodName, params) => {
        const calcFinishedTick = () => this.tick;
        const onStart = () => true;
        const onFinish = () => commandable[methodName](params);
        const onAbort = () => {};

        this.addCommand(commandable, calcFinishedTick, onStart, onFinish, onAbort);
    }


    /***********************/
    /***  Unit commands  ***/
    /***********************/


    moveUnit = (unit, targetPosition) => {
        const calcFinishedTick = () => {
            return this.tick + Vectors.absoluteDistance(unit.position, targetPosition) / unit.stats.speed;
        };
        const onStart = () => {
            unit.currentSpeed = Vectors.direction(unit.position, targetPosition, unit.stats.speed);
            return true;
        };
        const onFinish = () => {
            unit.currentSpeed = Vectors.zero();
        };
        const onAbort = onFinish;

        this.addCommand(unit, calcFinishedTick, onStart, onFinish, onAbort);
    }

    attackWithUnit = (unit, target) => {
        const calcFinishedTick = () => {
            this.tick + unit.stats.weapon.cooldown;
        };
        const onStart = () => {
            if (unit.isOnCooldown) {
                return false;
            }
            unit.isOnCooldown = true;
            AttackEngine.applyAttack(unit, target);
            return true;
        };
        const onFinish = () => {
            unit.isOnCooldown = false;
        };
        const onAbort = () => {};

        this.addCommand(calcFinishedTick, onStart, onFinish, onAbort);
    }

    harvestWithUnit = (worker, resourceSite) => {
        const calcFinishedTick = () => this.tick + resourceSite.harvestDuration;
        const onStart = () => {
            worker.currentResourceSite = resourceSite;

            return resourceSite.startHarvesting(worker);
        };
        const onFinish = () => {
            worker.carriedResources = resourceSite.finishHarvesting();
            if (worker.commandQueue.isEmpty()) {
                worker.returnHarvest();
            }
        };
        const onAbort = () => {
            resourceSite.abortHarvesting();
        };

        this.addCommand(calcFinishedTick, onStart, onFinish, onAbort);
    }

    dropOffHarvestWithUnit = (worker, baseStructure) => {
        const calcFinishedTick = () => this.tick;
        const onStart = () => {
            return Vectors.absoluteDistance(worker.position, baseStructure.position) < worker.stats.speed;
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

        this.addCommand(calcFinishedTick, onStart, onFinish, onAbort);
    }

    constructWithUnit = (worker, structureStat, targetPosition) => {
        let structure; // calculated upon start

        const calcFinishedTick = () => this.tick + structureStat.cost.time;
        const onStart = () => {
            if (Vectors.absoluteDistance(worker.position, targetPosition) >= worker.stats.speed) {
                return false;
            }
            structure = this.commandableManager.structureStarted(worker, structureStat.structureType, targetPosition);
            return true;
        };
        const onFinish = () => {
            this.commandableManager.structureFinished(structure);
        };
        const onAbort = () => {
            this.commandableManager.structureCancelled(structure);
        };

        this.addCommand(calcFinishedTick, onStart, onFinish, onAbort);
    }
}
