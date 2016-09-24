mod rts;

use rts::spatial::vector::Vector;

fn main() {
    let vector = Vector{ x: 0, y: 5};

    println!("This is a vector: {:?}", vector);
}
