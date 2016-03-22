import Vectors from '~/rts/spatial/Vectors';
import {left, right, top, bottom} from '~/rts/spatial/Directions';

function getCenterEdgePosition(object, side) {
    const {position, size} = object;

    switch (side) {
        case left:
            return {
                x: position.x + size / 2,
                y: position.y
            };

        case right:
            return {
                x: position.x - size / 2,
                y: position.y
            };

        case bottom:
            return {
                x: position.x,
                y: position.y + size / 2
            };

        case top:
            return {
                x: position.x,
                y: position.y - size / 2
            };

        default:
            throw `Unknown side in getCenterEdgePosition function: "${side}"`;
    }
}

function* diffsFromFirstWorkerPosition(side) {

    function getInitialDiff() {
        switch (side) {
            case left:
            case right:
                return {x: 0, y: 100};
            case bottom:
            case top:
                return {x: 100, y: 0};
        }
    }

    const initialDiff = getInitialDiff();
    let diff = Vectors.clone(initialDiff);

    while (true) { //eslint-disable-line no-constant-condition
        yield Vectors.clone(diff);

        diff = Vectors.add(diff, initialDiff);
    }

}

function* workerPositionGenerator(baseStructure, side) {
    const firstWorkerPosition = getCenterEdgePosition(baseStructure, side);

    const diffGen = diffsFromFirstWorkerPosition(side);

    yield Vectors.clone(firstWorkerPosition);

    while (true) { //eslint-disable-line no-constant-condition
        const diff = diffGen.next().value;

        yield Vectors.add(firstWorkerPosition, diff);
        yield Vectors.subtract(firstWorkerPosition, diff);
    }
}

export function getWorkerPositions(baseStructure, side, nofWorkers) {
    const gen = workerPositionGenerator(baseStructure, side);
    const workerPositions = [];

    for (let i = 0; i < nofWorkers; i++) {
        workerPositions.push(gen.next().value);
    }

    return workerPositions;
}
