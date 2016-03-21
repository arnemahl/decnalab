import {north, south} from '~/rts/spatial/StartingLocations';
import * as Directions from '~/rts/spatial/Directions';
import * as PositionGenerator from '~/rts/spatial/PositionGenerator';

function getArrayOf(Thing, positionGenerator, count) {
    const arr = [];
    for (let i = 0; i < count; i++) {
        const position = positionGenerator.next().value;

        arr.push(new Thing({position}));
    }
    return arr;
}

class DefaultMap {
    width = 40*1000;
    height = 200*1000;

    getStartingPosition(startingLocation) {
        switch (startingLocation) {
            case north:
                return {
                    x: 30*1000,
                    y: 30*1000
                };
            case south:
                return {
                    x: this.width - 30*1000,
                    y: this.height - 30*1000
                };
            default:
                throw `Unknown startingLocation ${startingLocation}`;
        }
    }

    getWorkerLocation(startingLocation) {
        switch (startingLocation) {
            case north:
                return Directions.left;
            case south:
                return Directions.right;
        }
    }

    getInitialTeamProps = function*({BaseStructure, Worker}) {

        const withSartingLocation = (startingLocation) => {
            const baseStructure = new BaseStructure(this.getStartingPosition(startingLocation));
            const workerPositionGenerator = PositionGenerator.workerPositions(baseStructure, this.getWorkerLocation(startingLocation));

            return {
                startingPosition: this.getStartingPosition(startingLocation),
                structures: [baseStructure],
                units: getArrayOf(Worker, workerPositionGenerator, 5)
            };
        };

        yield withSartingLocation(north);
        yield withSartingLocation(south);
    }
}

export default new DefaultMap();
