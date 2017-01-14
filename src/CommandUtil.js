import {
    UNIT_CREATED,
    UNIT_MOVED,
    UNIT_DAMAGED,
    UNIT_KILLED,

    UNIT_COMMAND_RECEIVED,
    UNIT_COMMAND_COMPLETED,
    UNIT_COMMANDS_CLEARED,
} from '~/store/ducks/units';

import {STRUCTURE_COMMAND_RECEIVED} from '~/store/ducks/structures';
import {PRODUCE_UNIT, BUILD_STRUCTURE} from './commandTypes';

export function createCommandUtil(store) {

    // Create shcedule for events in this game.
    // Used to keep track of next tick, what happens there, and allows
    // to cancel scheduled events (e.g. as result of cancelling a command)
    const eventSchedule = new EventSchedule();


    function addCommand(commandType, commandable, calcFinishedTick, onStart, onFinish, onAbort) {
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
            // commandable.commandCompleted(commandId);
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

        // commandable.addCommand(new Command(commandId, commandType, start, stop));
    }

    function giveMoveCommandToUnit(unit, targetLocation) {
        dispatch({/*...*/});
        
        eventSchedule.addEvent(, finishedAtTick)
    }

    class CommandUtil {

        doTick() {
            const {tick, events} = eventSchedule.getNext();

            store.dispatch(setTick(tick)); // Probably useful to keep track of tick in game state

            // Progress commands
            events.forEach(event => {
                switch (event.type) {
                    case EVENTS.GAINED_VISION:
                        // TODO: progress all move commands
                        // => When we let players give commands they may want to attack, or at least move
                        // This will likely cancel previously issued commands
                        break;
                    case EVENTS.COMMAND_COMPLETED:
                        // TODO: finish that unit's command
                        //   * whatever it was doing probably had an impact on the game state
                        //   * commandable is now unemployed
                        // => When we let players give commands, they probably want to use the commandable for something new, may event decide to approach enemy base
                        // Not so likely to cancel previously issued commands
                }
            });
        }

        produceFromStructure(structure, thingToProduce) {
            
        }

        buildStructure(worker, structureToProduce, targetLocation) {
            if (/* not at location */) {
                // dispatch: give move command to unit
                // eventSchedule: when moved (1) apply move (as for any move command), (2) do the stuff in the else clause
            } else {
                // dispatch: give build command to unit
                // eventSchedule: when done, apply structure added and whatnot
            }
        }

    }

    return new ComandUtil();
}
