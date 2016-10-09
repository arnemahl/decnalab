#[allow(dead_code)]
#[derive(Debug)]
pub struct Point<'b> {
    pub x: &'b mut i32,
    pub y: &'b mut i32,
}

#[allow(dead_code)]
impl<'b> Point<'b> {
    pub fn up(&mut self) {
        self.y += 1;
    }
}

#[allow(dead_code)]
// fn main() {
//     let mut p = Point { x: &0, y: &0 };
//     p.up();
// }

#[derive(Debug)]
pub struct Spec<'b> {
    pub speed: &'b f64
}

// impl<'b> Spec<'b> {

//     // pub fn set_speed(&mut self, speed: &'b f64) {
//     //     self.speed = speed;
//     // }

//     pub fn up(&mut self) {
//         self.speed = &self.speed + 1;
//     }
// }

// #[derive(Debug)]
// pub struct Spec {
//     pub speed: f64
// }

// // impl<'b> Spec<'b> {

// //     // pub fn set_speed(&mut self, speed: &'b f64) {
// //     //     self.speed = speed;
// //     // }

// //     pub fn up(&mut self) {
// //         self.speed = &self.speed + 1;
// //     }
// // }
