mod rts;

use rts::spatial::vector::Vector;

fn main() {
    // create
    let vector = Vector{ x: 10.0, y: 13.0 };
    println!("This is a vector: {:?}", vector);

    // new()
    let another_vector = Vector::new(1.0, 4.0);
    println!("This is anoter vector: {:?}", another_vector);

    // clone()
    println!("This is a clone of the first vector: {:?}", vector.clone());

    // zero()
    println!("This is a zero length vector: {:?}", Vector::zero());

    // add()
    println!("This is the sum of two vectors: {:?}", vector.add(&another_vector));

    // subtract()
    println!("This is the difference between two vectors: {:?}", vector.subtract(&another_vector));

    // scale()
    println!("This is the first vector multiplied by 2: {:?}", vector.scale(2.0));

    // length()
    println!("This is the (absolute) length of a vector: {:?}", vector.length());

    // to_unit_vector()
    println!("This is the unit vector of vector: {:?}", vector.to_unit_vector());

    // absolute_distance()
    println!("This is the absolute distance between two points (vectors): {:?}", vector.absolute_distance(&another_vector));

    // direction()
    println!("This is the direction between two points (vectors): {:?}", vector.direction(&another_vector));

    // equals()
    println!("Is {:?} equal to {:?} ? {}", vector, another_vector, if vector.equals(&another_vector) { "Yes :)" } else { "No :(" });
    println!("Is {:?} equal to {:?} ? {}", vector, vector.clone(), if vector.equals(&vector.clone()) { "Yes :)" } else { "No :(" });

    // not_equals()
    println!("Is {:?} different than {:?} ? {}", vector, another_vector, if vector.not_equals(&another_vector) { "Yes :)" } else { "No :(" });
    println!("Is {:?} different than {:?} ? {}", vector, vector.clone(), if vector.not_equals(&vector.clone()) { "Yes :)" } else { "No :(" });
}
