
export default class Queue {
    array = []
    nextIndex = 0

    clear = () => {
        this.array = [];
        this.nextIndex = 0;
    }

    isEmpty = () => {
        return this.array.length === this.nextIndex;
    }

    push = (item) => {
        this.array.push(item);
    }

    next = () => {
        if (this.isEmpty()) {
            throw 'Cannot get next item from empty Queue.';
        }

        const item = this.array[this.nextIndex++];

        if (this.nextIndex > this.array.length / 2) {
            this.array.slice(0, this.nextIndex);
        }

        return item;
    }

    seeFirst = (count) => {
        return this.array.slice(this.nextIndex, this.nextIndex + count);
    }
}
