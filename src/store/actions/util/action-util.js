export const getTarget = (state, targetId) => {
    const target = state.units[targetId] || state.structures[targetId];

    if (!target) {
        throw Error('target does not exist:', attackTargetId);
    }

    return target;
}
