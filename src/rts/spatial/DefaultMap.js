import Vectors from '~/rts/spatial/Vectors';
import {north, south} from '~/rts/spatial/StartingLocations';
import * as Directions from '~/rts/spatial/Directions';
import * as PositionGenerator from '~/rts/spatial/PositionGenerator';
import {AbundantResourceSite, SparseResourceSite} from '~/rts/resources/ResourceSite';
import UnitStatsClass from '~/rts/units/UnitStats';
import StructureStatsClass from '~/rts/structure/StructureStats';

class SafeMapAccessor {
    constructor(map) {
        this.getResourceSites = map.getResourceSites.bind(map);
        console.log('this:', this); // DEBUG
    }
}

export default class DefaultMap {
    width = 40*1000;
    height = 200*1000;

    startingPositions = {
        north: {
            x: 30*1000,
            y: 30*1000
        },
        south: {
            x: this.width - 30*1000,
            y: this.height - 30*1000
        }
    }

    resourceSites = {
        abundant: [
            new AbundantResourceSite(Vectors.add(this.startingPositions.north, Vectors.new(1000, 0))),
            new AbundantResourceSite(Vectors.add(this.startingPositions.south, Vectors.new(-1000, 0)))
        ],
        sparse: [
            new SparseResourceSite(Vectors.add(this.startingPositions.north, Vectors.new(1000, 0))),
            new SparseResourceSite(Vectors.add(this.startingPositions.south, Vectors.new(-1000, 0)))
        ]
    }

    getStartingPosition(startingLocation) {
        return this.startingPositions[startingLocation];
    }

    getStartingWorkerLocationRelativeToBaseStructure(startingLocation) {
        switch (startingLocation) {
            case north:
                return Directions.left;
            case south:
                return Directions.right;
        }
    }

    getStartingWorkerPositions(startingLocation, baseStructure) {
        const side = this.getStartingWorkerLocationRelativeToBaseStructure(startingLocation);
        return PositionGenerator.getWorkerPositions(baseStructure, side, 5);
    }

    getResourceSites(resourceType) {
        return this.resourceSites[resourceType];
    }

    getInitialTeamProps = function*({BaseStructure, Worker}) {

        const withSartingLocation = (startingLocation) => {
            const StructureStats = new StructureStatsClass();
            const UnitStats = new UnitStatsClass();

            const startingPosition = this.getStartingPosition(startingLocation);
            const baseStructure = new BaseStructure(StructureStats.BaseStructure, startingPosition);

            const workerPositions = this.getStartingWorkerPositions(startingLocation, baseStructure);
            const initialWorkers = workerPositions.map(position => new Worker(UnitStats.Worker, position));

            return {
                StructureStats,
                UnitStats,
                structures: [baseStructure],
                units: initialWorkers,
                resources: {
                    abundant: 50,
                    sparse: 0
                }
            };
        };

        yield withSartingLocation(north);
        yield withSartingLocation(south);
    }

    getSafeAccessor = () => {
        return new SafeMapAccessor(this);
    }
}
