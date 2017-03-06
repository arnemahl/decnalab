import Vectors from '~/rts/spatial/Vectors';
import {AbundantResourceSite, SparseResourceSite} from '~/rts/resources/ResourceSite';
import {getIdGenerator} from '~/rts/util/IdGenerator';

class Rectangle {
    constructor({ x, y, width, height }) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.xClosedUpperBound = x + width;
        this.yClosedUpperBound = y + height;
    }

    contains = (position) => { // Half open interval
        return (
            this.x <= position.x && position.x < this.xClosedUpperBound &&
            this.y <= position.y && position.y < this.yClosedUpperBound
        );
    }
}

export default class DefaultMap {

    nofTeams = {
        min: 2,
        max: 2
    }

    width = 12*1000;
    height = 18*1000;

    center = Vectors.new(this.width / 2, this.height / 2);
    bounds = new Rectangle({
        x: 0,
        y: 0,
        width: this.width,
        height: this.height,
    });

    visionSectors = (() => {
        const nofSectors = 4;
        const sectorHeight = this.height / nofSectors;

        return Array(nofSectors).fill(void 0)
            .map((_, index) => {
                const sector = new Rectangle({
                    x: 0,
                    y: sectorHeight * index,
                    height: sectorHeight,
                    width: this.width,
                });
                sector.id = `sector-${index}`;
                return sector;
            });
    })()

    startingPositions = {
        north: {
            x: this.width * (3 / 4),
            y: this.height * (1 / 8),
        },
        south: {
            x: this.width * (1 / 4),
            y: this.height * (7 / 8),
        }
    }

    startingWorkerPositions = {
        /*eslint-disable no-multi-spaces */
        north: [
            Vectors.add(this.startingPositions.north, Vectors.new(600,    0)),
            Vectors.add(this.startingPositions.north, Vectors.new(620,  150)),
            Vectors.add(this.startingPositions.north, Vectors.new(620, -150)),
            Vectors.add(this.startingPositions.north, Vectors.new(660,  300)),
            Vectors.add(this.startingPositions.north, Vectors.new(660, -300))
        ],
        south: [
            Vectors.add(this.startingPositions.south, Vectors.new(-600,    0)),
            Vectors.add(this.startingPositions.south, Vectors.new(-620,  150)),
            Vectors.add(this.startingPositions.south, Vectors.new(-620, -150)),
            Vectors.add(this.startingPositions.south, Vectors.new(-660,  300)),
            Vectors.add(this.startingPositions.south, Vectors.new(-660, -300))
        ]
        /*eslint-enable no-multi-spaces */
    }

    suggestedStructurePositions = (() => {
        const getPositions = (startingPosition, addX, addY) => {
            const positions = [];
            let pos = Vectors.add(startingPosition, {x: 0, y: addY});

            while (2000 < pos.x && pos.x < this.width - 2000) {
                pos = Vectors.add(pos, {x: addX, y: 0});
                positions.push(pos);
            }
            return positions;
        };
        return {
            north: []
                .concat(getPositions(this.startingPositions.north, -1000, 1200))
                .concat(getPositions(this.startingPositions.north, -1000, 2400))
                .concat(getPositions(this.startingPositions.north, -1000, 3200)),
            south: []
                .concat(getPositions(this.startingPositions.south, 1000, -1200))
                .concat(getPositions(this.startingPositions.south, 1000, -2400))
                .concat(getPositions(this.startingPositions.south, 1000, -3200)),
        };
    })()

    startingResources = {
        abundant: 50,
        sparse: 0
    }

    unitSpawnPositions = [
        Vectors.add(this.startingPositions.north, Vectors.new(0, 1200)),
        Vectors.add(this.startingPositions.south, Vectors.new(0, -1200))
    ]

    startingUnits = [
        [{
            unitType: 'Worker',
            positions: this.startingWorkerPositions.north
        }],
        [{
            unitType: 'Worker',
            positions: this.startingWorkerPositions.south
        }]
    ]

    startingStructures = [
        [{
            structureType: 'BaseStructure',
            positions: [this.startingPositions.north]
        }],
        [{
            structureType: 'BaseStructure',
            positions: [this.startingPositions.south]
        }]
    ]

    rsidGen = getIdGenerator('resourceSite');
    resourceSites = {
        abundant: [
            new AbundantResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions.north, Vectors.new(1500, 0))),
            new AbundantResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions.south, Vectors.new(-1500, 0)))
        ],
        sparse: [
            new SparseResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions.north, Vectors.new(1200, -1200))),
            new SparseResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions.south, Vectors.new(-1200, 1200)))
        ]
    }

    getState = () => {
        const resourceSites = Object.keys(this.resourceSites).map(type => this.resourceSites[type].map(site => site.getState()));

        return {
            width: this.width,
            height: this.height,
            resourceSites,
            visionSectors: this.visionSectors,
            startingPositions: this.startingPositions,
        };
    }
}
