/*
 * READ STORED CONFIG
 *   - Looks at first and second cli arguments to see which file(s) to import from
 *   - Both cli arguments are optional
 *
 * May return empty array, then Game will fall back to default AI configs
 *
 */

export function getAiConfigs() {
    const fileName = process.argv[2];
    const fileName2 = process.argv[3];
    const configs = !fileName ? [] : require(`../../dump/ai-config/${fileName}.js`);
    const configs2 = !fileName2 ? [] : require(`../../dump/ai-config/${fileName2}.js`);

    // TODO get population, files now don't contain just an array of BOs, but object of arrays of BOs

    const selectedConfigs = [
        configs[0],
        configs2[0] || configs[1],
    ];

    console.log(`Using selected aiConfigs for players:`, selectedConfigs.map(Boolean));

    return selectedConfigs;
}
