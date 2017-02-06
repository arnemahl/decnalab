const scoreFactors = {
    abundant: 0.1,
    sparse: 0.4,
    supply: 2,
    time: 0.01,
};

const resourceTypes = Object.keys(scoreFactors);
const sumTotal = (sum, number) => sum + number;
function calculateScore(cost) {
    return resourceTypes.map(resourceType => scoreFactors[resourceType] * cost[resourceType]).reduce(sumTotal, 0);
}

export default class ScoreCounter {

    constructor(teamIds) {
        this.teamIds = teamIds;
        this.teamScore = teamIds.reduce((teamScore, teamId) => {
            teamScore[teamId] = {
                score: 0,
                unitsProduced: 0,
                structuresProduced: 0,
                unitsKilled: 0,
                structuresKilled: 0,
                didWin: false,
                didLose: false,
            };
            return teamScore;
        }, {});
    }

    unitProduced = (teamId, unitSpec) => {
        this.teamScore[teamId].unitsProduced += 1;
        this.teamScore[teamId].score += calculateScore(unitSpec.cost);
    }

    structureProduced = (teamId, structureSpec) => {
        this.teamScore[teamId].structuresProduced += 1;
        this.teamScore[teamId].score += calculateScore(structureSpec.cost);
    }

    unitKilled = (killerTeamId, unitSpec) => {
        this.teamScore[killerTeamId].unitsKilled += 1;
        this.teamScore[killerTeamId].score += 2 * calculateScore(unitSpec.cost);
    }

    structureKilled = (killerTeamId, structureSpec) => {
        this.teamScore[killerTeamId].structuresKilled += 1;
        this.teamScore[killerTeamId].score += 2 * calculateScore(structureSpec.cost);
    }

    gameOver = (winningTeamId, losingTeamId/*, tick*/) => {
        this.teamScore[winningTeamId].score *= 3;
        this.teamScore[losingTeamId].score /= 3;

        this.teamScore[winningTeamId].didWin = true;
        this.teamScore[losingTeamId].didLose = true;
    }

    getState = () => {
        return this.teamIds.reduce((teamScore, teamId) => {
            teamScore[teamId] = {
                ...this.teamScore[teamId]
            };
            return teamScore;
        }, {});
    }

}
