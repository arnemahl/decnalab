use std::f64;

#[derive(Debug)]
pub struct Vector {
    pub x: f64,
    pub y: f64,
}

#[allow(dead_code)]
impl Vector {
    pub fn new(x: f64, y: f64) -> Vector {
        Vector{x: x, y: y}
    }
    pub fn new_int(x: i32, y: i32) -> Vector {
        Vector{x: x as f64, y: y as f64}
    }
    pub fn clone(&self) -> Vector {
        Vector::new(self.x, self.y)
    }
    pub fn zero() -> Vector {
        Vector::new(0.0, 0.0)
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
    pub fn scale(&self, scalar: f64) -> Vector {
        Vector {
            x: self.x * scalar,
            y: self.y * scalar,
        }
    }

    pub fn length(&self) -> f64 {
        (
            (self.x).powi(2) +
            (self.y).powi(2)
        ).sqrt()
    }

    pub fn to_unit_vector(&self) -> Vector {
        let length = self.length();

        self.clone().scale(1.0 / length)
    }

    // Positions
    pub fn absolute_distance(&self, other: &Vector) -> f64 {
        (
            (self.x - other.x).powi(2) +
            (self.y - other.y).powi(2)
        ).sqrt()
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
        let vector = Vector{ x: 10.0, y: 13.0 };

        assert_eq!(vector.x, 10.0);
        assert_eq!(vector.y, 13.0);
    }

    #[test]
    fn test_new() {
        let vector = Vector::new(10.0, 13.0);

        assert_eq!(vector.x, 10.0);
        assert_eq!(vector.y, 13.0);
    }

    #[test]
    fn test_zero() {
        let vector = Vector::zero();

        assert_eq!(vector.x, 0.0);
        assert_eq!(vector.y, 0.0);
    }

    #[test]
    fn test_equals() {
        let a = Vector::new(11.0, 13.0);
        let b = Vector::new(11.0, 13.0);

        assert!(a.equals(&b));
    }

    #[test]
    fn test_clone() {
        let vector = Vector::new(11.0, 13.0);
        let clone = vector.clone();

        assert!(vector.equals(&clone));
    }

    #[test]
    fn test_add() {
        let result = Vector::new(10.0, 15.0).add(&Vector::new(2.0, -3.0));
        let ans = Vector::new(12.0, 12.0);

        assert!(result.equals(&ans));
    }

    #[test]
    fn test_subtract() {
        let result = Vector::new(10.0, 15.0).subtract(&Vector::new(2.0, -3.0));
        let ans = Vector::new(8.0, 18.0);

        assert!(result.equals(&ans));
    }

    #[test]
    fn test_scale() {
        let result = Vector::new(5.0, 8.0).scale(2.0);
        let ans = Vector::new(10.0, 16.0);

        assert!(result.equals(&ans));
    }

    #[test]
    fn test_length() {
        let length = Vector::new(3.0, 4.0).length();

        assert_eq!(length, 5.0);
    }

    #[test]
    fn test_distance() {
        let distance = Vector::new(5.0, 5.0).absolute_distance(&Vector::new(8.0, 1.0));

        assert_eq!(distance, 5.0);
    }

    #[test]
    fn test_to_unit_vector() {
        let result = Vector::new(5.0, 5.0).to_unit_vector();
        let expect_x_y = 1.0 / (2.0 as f64).sqrt();
        let ans = Vector::new(expect_x_y, expect_x_y);

        assert!(result.equals(&ans));
    }

    #[test]
    fn test_direction_simple() {
        let one_y = Vector::new(0.0, 1.0);
        let simple = Vector::zero().direction(&one_y);
        assert!(simple.equals(&one_y));
    }

    #[test]
    fn test_direction_should_be_unit_vector() {
        let vector = Vector::new(7.0, 9.0);
        let simple = Vector::zero().direction(&vector);
        assert!(simple.equals(&vector.to_unit_vector()));
    }
}
