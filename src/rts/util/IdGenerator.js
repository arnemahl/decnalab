
export function getIdGenerator(prefix) {
    const gen = (function*() {
        let i = 0;
        while (true) { // eslint-disable-line no-constant-condition
            yield `${prefix}-${i++}`;
        }
    })();

    return {
        generateId: () => gen.next().value
    };
}
