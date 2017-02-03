import Vectors from '~/rts/spatial/Vectors';

export default class SimpleVision {
    constructor(map, teams) {
        this.map = map;
        this.teams = teams;

        this.commandablesPerSector = {};
        teams.forEach(team => {
            this.commandablesPerSector[team.id] = {};

            map.visionSectors.forEach(sector => {
                this.commandablesPerSector[team.id][sector.id] = {};
            });

            Object.values(team.units).forEach(this.commandableAdded);
            Object.values(team.structures).forEach(this.commandableAdded);
        });
    }

    commandableAdded = (commandable) => {
        this._commandablePlacedAtPosition(commandable, commandable.position);
    }
    commandableRemoved = (commandable) => {
        this._commandableRemovedFromPosition(commandable, commandable.position);
    }
    commandableMoved = (commandable, previousPosition) => {
        if (this._getSector(previousPosition) !== this._getSector(commandable.position)) {
            // First remove from old sector, then add to new sector
            this._commandableRemovedFromPosition(commandable, previousPosition);
            this._commandablePlacedAtPosition(commandable, commandable.position);
        }
    }

    _getSector = (position) => {
        const sector = this.map.visionSectors.find(sector => sector.contains(position));

        if (!sector) {
            throw Error(`No sector found for position ${Vectors.toString(position)}`);
        }

        return sector;
    }

    _commandablePlacedAtPosition = (commandable, position) => {
        const sector = this._getSector(position);

        // Add commandable to list of commandables in sector
        this.commandablesPerSector[commandable.team.id][sector.id][commandable.id] = commandable;

        // If team did not previously have vision, gain vision
        const gainedVision = !commandable.team.visibleMapSectorIds.includes(sector.id);

        if (gainedVision) {
            commandable.team.visibleMapSectorIds.push(sector.id);
        }


        // If other teams are in the sector...
        const otherTeamsInSector = this.teams
            .filter(team => team.id !== commandable.team.id)
            .filter(otherTeam => otherTeam.visibleMapSectorIds.includes(sector.id));

        // ...give them vision of the moved commandable
        otherTeamsInSector.forEach(otherTeam => {
            otherTeam.visibleEnemyCommandables.push(commandable);
        });

        // ...and make the team of the moved commandable gain vision of other teams commandables in sector
        if (gainedVision) {
            otherTeamsInSector.forEach(otherTeam => {
                commandable.team.visibleEnemyCommandables.push(
                    ...Object.values(this.commandablesPerSector[otherTeam.id][sector.id])
                );
            });
        }
    }

    _commandableRemovedFromPosition = (commandable, position) => {
        const sector = this._getSector(position);

        // Remove commandable from list of commandables in sector
        delete this.commandablesPerSector[commandable.team.id][sector.id][commandable.id];

        // If team does not have any more commandables in the sector, lose vision
        const lostVision = Object.keys(this.commandablesPerSector[commandable.team.id][sector.id]).length === 0;

        if (lostVision) {
            commandable.team.visibleMapSectorIds = commandable.team.visibleMapSectorIds.filter(id => id !== sector.id);
        }


        // If other teams are in the sector...
        const otherTeamsInSector = this.teams
            .filter(team => team.id !== commandable.team.id)
            .filter(otherTeam => otherTeam.visibleMapSectorIds.includes(sector.id));

        // ...remove the moved unit from their vision
        // PS: If the commandable was moved to a new sector, they might immediately regain vision of it, handled in _commandablePlacedAtPosition
        otherTeamsInSector.forEach(otherTeam => {
            otherTeam.visibleEnemyCommandables = otherTeam.visibleEnemyCommandables.filter(otherCommandable => otherCommandable !== commandable);
        });

        // ...and make the team of the moved commandable lose vision of other teams commandables in sector
        if (lostVision) {
            otherTeamsInSector.forEach(otherTeam => {
                const commandablesTeamLostVisionOf = this.commandablesPerSector[otherTeam.id][sector.id];

                commandable.team.visibleEnemyCommandables = commandable.team.visibleEnemyCommandables
                    .filter(enemyCommandable => !commandablesTeamLostVisionOf[enemyCommandable.id]);
            });
        }
    }

}
