extern crate rustc_serialize;
use rustc_serialize::json;
use std::os::raw::c_char;

mod string_converter;

// Automatically generate `RustcDecodable` and `RustcEncodable` trait implementations
#[derive(RustcDecodable, RustcEncodable)]
pub struct TestStruct  {
    data_int: u8,
    data_str: String,
    data_vector: Vec<u8>,
}

#[no_mangle]
pub extern fn get_json() -> *const c_char {
    let object = TestStruct {
        data_int: 1,
        data_str: "homura".to_string(),
        data_vector: vec![2,3,4,5],
    };

    // Serialize using `json::encode`
    let encoded: String = json::encode(&object).unwrap();

    // // Deserialize using `json::decode`
    // let decoded: TestStruct = json::decode(&encoded).unwrap();

    string_converter::to_c_char(&encoded)
}
