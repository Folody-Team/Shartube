extern crate ws;

mod handler;

use std::thread;
use ws::listen;

fn get_host() -> String {
    match std::env::var("HOST") {
        Ok(host) => host,
        Err(_) => "localhost".to_string(),
    }
}

fn main() {
    let host = get_host();
    let port = match std::env::var("PORT") {
        Ok(port) => port,
        Err(_) => "3012".to_string(),
    };
    let addr = format!("{}:{}", host, port);
    handler::handler();
    // Start listening for WebSocket connections.
    println!("Listening on {}", addr);

    // create a thread to listen for websocket connections.
    let server = thread::spawn(move || {
        listen(addr, |out| handler::Server { ws: out }).unwrap();
    });

    server.join().unwrap();
}
