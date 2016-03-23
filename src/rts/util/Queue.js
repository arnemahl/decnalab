
export default class Queue {
    array = []
    nextIndex = 0

    clear = () => {
        this.array = [];
        this.nextIndex = 0;
    }

    isEmpty = () => {
        return this.array.length === nextIndex;
    }

    put = (item) => {
        array.push(item);
    }

    next = () => {
        const item = this.array[this.nextIndex++];

        if (this.nextIndex > this.array.length / 2) {
            this.array.slice(0, this.nextIndex);
        }

        return item;
    }
}