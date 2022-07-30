extern crate ws;

use ws::listen;

fn main() {
    const ADDR: &str = "localhost:1555";
    // Start listening for WebSocket connections.
    println!("Listening on {}", ADDR);
    
    listen(ADDR, |out| {
        move |msg| {
            println!("Got message: {}", msg);
            out.send("Success!")
       }
    }).unwrap();

  
}