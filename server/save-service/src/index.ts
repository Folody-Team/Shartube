import express from "express";
import { Client, GatewayIntentBits } from "discord.js";
import path from "path";
import fs from "fs";
const app = express();

const allIntent = [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildIntegrations,
  GatewayIntentBits.GuildWebhooks,
  GatewayIntentBits.GuildInvites,
  GatewayIntentBits.GuildVoiceStates,
  GatewayIntentBits.GuildPresences,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildMessageTyping,
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.DirectMessageReactions,
  GatewayIntentBits.DirectMessageTyping,
  GatewayIntentBits.MessageContent,
  GatewayIntentBits.GuildScheduledEvents,
];
const client = new Client({
  intents: allIntent,
});

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
function uuidV4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

client.on("ready", async () => {
  if (!process.env.CHANNEL_ID) {
    throw new Error("CHANNEL_ID is not set");
  }
  const imageChanel = await client.channels.fetch(process.env.CHANNEL_ID);
  if (!imageChanel || !imageChanel.isTextBased()) {
    throw new Error("CHANNEL_ID is not a text channel");
  }
  // create tmp folder
  const tmpFolder = path.join(__dirname, "tmp");
  if (!fs.existsSync(tmpFolder)) {
    fs.mkdirSync(tmpFolder);
  }

  app.post("/upload", async (req, res) => {
    const { fileBase64, extension } = req.body;
    const allowedExtensions = ["png", "jpg", "jpeg", "gif", "bmp"];
    if (!allowedExtensions.includes(extension)) {
      res.status(400).send("Invalid extension");
      return;
    }
    const fileName = uuidV4() + "." + extension;
    if (!fileBase64) {
      res.status(400).send("No file");
      return;
    }
    const FileBuffer = Buffer.from(fileBase64, "base64");
    // save file to tmp folder
    const tmpFile = path.join(tmpFolder, fileName);
    fs.writeFileSync(tmpFile, FileBuffer);
    // send file to channel
    const message = await imageChanel.send({
      files: [tmpFile],
    });
    // delete tmp file
    fs.unlinkSync(tmpFile);
    res.json({ url: message.attachments.first()?.url });
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port 3000");
  });
});
client.login(process.env.DISCORD_TOKEN);
