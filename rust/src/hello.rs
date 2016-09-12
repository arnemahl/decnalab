use std::str::Utf8Error;
use std::ffi::CStr;
use std::ffi::CString;
use std::os::raw::c_char;

fn to_string(pointer: *const c_char) -> String {
    let c_str: &CStr = unsafe { CStr::from_ptr(pointer) };
    let result: Result<&str, Utf8Error> = CStr::to_str(c_str);
    let str_pointer: &str = Result::unwrap(result);
    String::from(str_pointer)
}

fn create_message(name: &str) -> String {
    format!("Hello {}! This is Rust :)", name)
}

fn to_cstring(string: &str) -> *const c_char {
    let s: CString = CString::new(string).unwrap();
    s.into_raw()
}

#[no_mangle]
pub extern fn hello_from_rust(name: *const c_char) -> *const c_char {
    to_cstring(&create_message(&to_string(name)))
}
