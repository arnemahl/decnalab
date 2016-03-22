import BaseStructure from '~/rts/structures/BaseStructure';
import Worker from '~/rts/units/Worker';
import Team from '~/rts/team/Team';

export function initializeTeams(game, map) {

    const gen = map.getInitialTeamProps({BaseStructure, Worker});

    return {
        blue: new Team(game, gen.next().value),
        red: new Team(game, gen.next().value)
    };
}
