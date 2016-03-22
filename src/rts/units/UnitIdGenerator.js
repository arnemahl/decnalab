
export const generateUnitId = (() => {
    const unitIdGenerator = (function*() {
        let id = 0;
        while (true) { //eslint-disable-line no-constant-condition
            yield `unit-${id++}`;
        }
    })();

    return () => unitIdGenerator.next().value;
})();
