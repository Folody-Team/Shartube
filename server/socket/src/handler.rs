use ws::{CloseCode, Handler, Handshake, Message, Result, Sender};

// This is the handler for the websocket connection.

pub(crate) struct Server {
    pub(crate) ws: Sender,
}
// public handler method to handle incoming messages.
pub(crate) fn handler() {
    impl Handler for Server {
        fn on_open(&mut self, _: Handshake) -> Result<()> {
            println!("Client connected");

            Ok(())
        }
        fn on_message(&mut self, msg: Message) -> Result<()> {
            println!("Got message '{}'", msg);
            self.ws.broadcast(msg.clone())?;
            Ok(())
        }
        fn on_close(&mut self, code: CloseCode, reason: &str) {
            println!("WebSocket closing for ({:?}) {}", code, reason);
        }
    }
}
