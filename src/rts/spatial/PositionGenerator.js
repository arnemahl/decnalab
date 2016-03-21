import {left, right, top, bottom} from '~/rts/spatial/Directions';

function getEdgePosition({position, size}, side) {
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
            throw `Unknown side in getEdgePosition function: ${side}`;
    }
}

export function* workerPositions(baseStructure, side) {
    const edgePosition = getEdgePosition(baseStructure, side);

    yield edgePosition;

    let add = 0;

    while (true) { //eslint-disable-line no-constant-condition

        if (add < 0) {
            yield edgePosition + add;
        } else {
            yield edgePosition + add++;
        }
        add *= -1;
    }
}
