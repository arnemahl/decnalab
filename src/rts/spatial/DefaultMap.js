import Vectors from '~/rts/spatial/Vectors';
import {AbundantResourceSite, SparseResourceSite} from '~/rts/resources/ResourceSite';
import {getIdGenerator} from '~/rts/util/IdGenerator';

const north = 'north';
const south = 'south';

export default class DefaultMap {

    nofTeams = {
        min: 2,
        max: 2
    }

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

    startingWorkerPositions = {
        /*eslint-disable no-multi-spaces */
        north: [
            Vectors.add(this.startingPositions[north], Vectors.new(600,    0)),
            Vectors.add(this.startingPositions[north], Vectors.new(600,   50)),
            Vectors.add(this.startingPositions[north], Vectors.new(600,  -50)),
            Vectors.add(this.startingPositions[north], Vectors.new(610,  100)),
            Vectors.add(this.startingPositions[north], Vectors.new(610, -100))
        ],
        south: [
            Vectors.add(this.startingPositions[south], Vectors.new(-600,    0)),
            Vectors.add(this.startingPositions[south], Vectors.new(-600,   50)),
            Vectors.add(this.startingPositions[south], Vectors.new(-600,  -50)),
            Vectors.add(this.startingPositions[south], Vectors.new(-610,  100)),
            Vectors.add(this.startingPositions[south], Vectors.new(-610, -100))
        ]
        /*eslint-enable no-multi-spaces */
    }

    startingResources = {
        abundant: 50,
        sparse: 0
    }

    startingUnits = [
        [{
            unitType: 'Worker',
            positions: this.startingWorkerPositions[north]
        }],
        [{
            unitType: 'Worker',
            positions: this.startingWorkerPositions[south]
        }]
    ]

    startingStructures = [
        [{
            structureType: 'BaseStructure',
            positions: [this.startingPositions[north]]
        }],
        [{
            structureType: 'BaseStructure',
            positions: [this.startingPositions[south]]
        }]
    ]

    rsidGen = getIdGenerator('resourceSite');
    resourceSites = {
        abundant: [
            new AbundantResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions[north], Vectors.new(1000, 0))),
            new AbundantResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions[south], Vectors.new(-1000, 0)))
        ],
        sparse: [
            new SparseResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions[north], Vectors.new(1000, 0))),
            new SparseResourceSite(this.rsidGen.generateId(), Vectors.add(this.startingPositions[south], Vectors.new(-1000, 0)))
        ]
    }

    getState = () => {
        const resourceSites = Object.keys(this.resourceSites).map(type => this.resourceSites[type].map(site => site.getState()));

        return {
            width: this.width,
            height: this.height,
            resourceSites
        };
    }

    setState = (nextState) => {
        nextState.resourceSites.forEach(anotherMap => anotherMap.map(one => {
            const {id, resourceType, ...state} = one;

            this.resourceSites[resourceType].find(rs => rs.id === id).setState(state);
        }));
    }
}
