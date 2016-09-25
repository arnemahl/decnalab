use std::i32;

#[derive(Debug)]
pub struct Vector {
    pub x: i32,
    pub y: i32,
}

impl Vector {
    pub fn new(x: i32, y: i32) -> Vector {
        Vector{x: x, y: y}
    }
    pub fn clone(&self) -> Vector {
        Vector::new(self.x, self.y)
    }
    pub fn zero() -> Vector {
        Vector::new(0, 0)
    }

    pub fn equals(&self, other: &Vector) -> bool {
           self.x == other.x
        && self.y == other.y
    }
    pub fn not_equals(&self, other: &Vector) -> bool {
        !self.equals(other)
    }

    pub fn add(&self, other: &Vector) -> Vector {
        Vector {
            x: self.x + other.x,
            y: self.y + other.y,
        }
    }
    pub fn subtract(&self, other: &Vector) -> Vector {
        Vector {
            x: self.x - other.x,
            y: self.y - other.y,
        }
    }
    pub fn scale(&self, scalar: i32) -> Vector {
        Vector {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    pub fn length(&self) -> i32 {
        ((
            (self.x).pow(2) +
            (self.y).pow(2)
        ) as f64).sqrt() as i32
    }

    pub fn to_unit_vector(&self) -> Vector {
        let length = self.length();

        self.clone().scale(1 / length)
    }

    // Positions
    pub fn absolute_distance(&self, other: &Vector) -> i32 {
        ((
            (self.x - other.x).pow(2) +
            (self.y - other.y).pow(2)
        ) as f64).sqrt() as i32
    }

    // Positions
    pub fn direction(&self, other: &Vector) -> Vector {
        other.subtract(&self).to_unit_vector()
    }
}

#[cfg(test)]
mod vector_tests {
    use super::Vector;

    #[test]
    fn test_create() {
        let vector = Vector{ x: 10, y: 13 };

        assert_eq!(vector.x, 10);
        assert_eq!(vector.y, 13);
    }

    #[test]
    fn test_new() {
        let vector = Vector::new(10, 13);

        assert_eq!(vector.x, 10);
        assert_eq!(vector.y, 13);
    }

    #[test]
    fn test_zero() {
        let vector = Vector::zero();

        assert_eq!(vector.x, 0);
        assert_eq!(vector.y, 0);
    }

    #[test]
    fn test_equals() {
        let a = Vector::new(11, 13);
        let b = Vector::new(11, 13);

        assert!(a.equals(&b));
    }

    #[test]
    fn test_clone() {
        let vector = Vector::new(11, 13);
        let clone = vector.clone();

        assert!(vector.equals(&clone));
    }

    #[test]
    fn test_add() {
        let result = Vector::new(10, 15).add(&Vector::new(2, -3));
        let ans = Vector::new(12, 12);

        assert!(result.equals(&ans));
    }

    #[test]
    fn test_subtract() {
        let result = Vector::new(10, 15).subtract(&Vector::new(2, -3));
        let ans = Vector::new(8, 18);

        assert!(result.equals(&ans));
    }

    #[test]
    fn test_scale() {
        let result = Vector::new(5, 8).scale(2);
        let ans = Vector::new(10, 16);

        assert!(result.equals(&ans));
    }

    #[test]
    fn test_length() {
        let length = Vector::new(3, 4).length();

        assert_eq!(length, 5);
    }

    #[test]
    fn test_distance() {
        let distance = Vector::new(5, 5).absolute_distance(&Vector::new(8, 1));

        assert_eq!(distance, 5);
    }

    // #[test]
    // fn test_to_unit_vector() {
    //     Vector.new(5, 5).to_unit_vector();
    // }

    // #[test]
    // fn test_direction_simple() {
    //     let one_y = Vector::new(0, 1);
    //     let simple_direction = Vector::zero().direction(&one_y);
    //     assert!(simple_direction.equals(&one_y));
    // }
}
