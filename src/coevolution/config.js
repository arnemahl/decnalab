export const popSize = 50;
export const nofChildrenPerGeneration = 70;
export const teachSetSize = 8;
export const maxGenerations = 50;
export const maxLoopsPerGame = 2000;
export const maxTicksPerGame = 20000;
export const fitnessScalingFactor = 1.5;

export const crossoverRatio = 0.95;
export const crossoverPointRatio = 0.25;
export const crossoverFunction = 'bitwiseUniformCrossover';
export const perBitMutationRatio = 0.01;

export const producableThings = [
    'Worker',
    'Marine',
    // 'Firebat',
    'SupplyDepot',
    'Barracks',
    // 'FlameTower',
];
export const minAttackTiming = 6;
export const maxAttackTiming = 42;
export const initialBuildOrderLength = 8;


/*

=========================
Explanation of Constants:
=========================

# popSize

    Size of a population at the start of a generation


# nofChildrenPerGeneration

    How many new individuals that are created per generation. Must be equal to or larger
    than popSize. If larger, some children will 'die' before next generation starts.

# teachSetSize

    The teach set contains individuals that other individuals are evaluated against.
    All created individuals will play against all the members in the current teach set.

    Having a large teachSet provides better evaluation, at the cost of run-time
    performance.


# maxGenerations

    How many generations to run the coevolutionary algorithm for.


# maxLoopsPerGame

    Maximum number of loops per game.


# fitnessScalingFactor

    Used to scale fitness.

    0 -> All individuals have equal probability of being selected
    1 -> Best individual has 2x probability of being selected compared to individual with fitness 0
    Approaching infinity -> Approaching no scaling effect

    Using scaled fitness increses the chance of preserving genetic diversity, by
    increasing probability of less fit indiviudals to be selected.


# crossoverRatio

    Probability of crossover. When there is no crossover, the children of two parents
    are identical to the parents (unless they are mutated).


# crossoverPointRatio

    Probability per gene of adding a crossover point between it and the previous gene.
    Lower `crossoverPointRatio` means fewer crossover points. Between each crossover point,
    a child will receive genes from the same parent.

    0 -> no crossover points
    0.5 -> works just as if we didn't have this variable
    1 -> crossover point between every single gene

    Setting a value below 0.5 we get a higher probability of transferring the full meaning
    of a gene sequence from parent to child. Example:

        Gene representation of targets:
            00 -> Worker
            01 -> Marine
            10 -> SupplyDepot
            11 -> Barracks

        If during crossover we cut in the middle of a gene sequence encoding for a target,
        for which mother contains Worker (00) and father contains Barracks (11), children
        will get Marine (01) and SupplyDepot (10), thus they don't get the targets of any
        of the parents.

        By setting `crossoverPointRatio` below 0.5 we reduce the chance of cutting
        in the middle of a gene, and increase the chance that the targets of the parents
        are transferred to the children.

# crossoverFunction

    Which function to use for crossover to create two children from two parents.

    ## bitwiseUniformCrossover

        When using bitwise crossover, crossover points may occur in the middle of a target
        specName in the build order, possibly recombining it into a new specName.

    ## sequencewiseUniformCrossover

        When using sequencewise crossover, a target specName in a parent build order will
        transfer to one of the children, with no chance of recombining it into a new specName.
        This is how crossover worked (for bulid order) when the genome was not encoded as
        bits.

# perBitMutationRatio

    Probability for each individual bit in the genome to be flipped (0 into 1, 1 into 0).


# producableThings

    Units/structures that can be part of the build order and thus produced by the AI.


# minAttackTiming

    Lowest possible value for `attackAtSupply`. When an AI's has enough units that used
    supply is bigger than or equal to `attackAtSupply`, the AI will launch an attack on the
    enemy.


# maxAttackTiming

    Highest possible value for `attackAtSupply`. See `minAttackTiming`.


# initialBuildOrderLength

    The length of the build order encoded in the genome, that the AI will attempt to execute.


*/
