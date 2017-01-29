
class Vectors {
    new(x, y) {
        return {x, y};
    }
    clone(vector) {
        return {
            x: vector.x,
            y: vector.y
        };
    }
    zero() {
        return this.new(0, 0);
    }
    random(x = 1, y = 1) {
        return {
            x: x * (Math.random() - 0.5) * 2,
            y: y * (Math.random() - 0.5) * 2,
        };
    }
    add(one, two) {
        return {
            x: one.x + two.x,
            y: one.y + two.y
        };
    }
    subtract(one, two) {
        return {
            x: one.x - two.x,
            y: one.y - two.y
        };
    }
    scale(vector, scalar) {
        return {
            x: vector.x * scalar,
            y: vector.y * scalar
        };
    }

    absoluteDistance(one, two) {
        return Math.sqrt(
            Math.pow(one.x - two.x, 2) +
            Math.pow(one.y - two.y, 2)
        );
    }

    direction(one, two, vectorLength = 1) {
        const distance = this.subtract(two, one);

        const absoluteDistance = this.absoluteDistance(one, two);

        if (absoluteDistance === 0) {
            return this.zero();
        } else {
            return this.scale(distance, vectorLength / absoluteDistance);
        }
    }

    length(vector) {
        return Math.sqrt(
            Math.pow(vector.x, 2) +
            Math.pow(vector.y, 2)
        );
    }

    equals(one, two) {
        return one.x === two.x
            && one.y === two.y;
    }
    notEquals(one, two) {
        return !this.equals(one, two);
    }
}

export default new Vectors();
