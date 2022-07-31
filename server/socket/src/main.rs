extern crate ws;

mod handler;

use std::thread;
use ws::listen;

const ADDR: &str = "localhost:3012";

fn main() {
    handler::handler();
    // Start listening for WebSocket connections.
    println!("Listening on {}", ADDR);

    // create a thread to listen for websocket connections.
    let server = thread::spawn(move || {
        listen(ADDR, |out| { 
            handler::Server {
                ws: out,
            }
        }).unwrap();
    });

    server.join().unwrap();
}