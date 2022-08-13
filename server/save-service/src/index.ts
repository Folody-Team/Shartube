import express from "express";
import multer from "multer";
import { Client, GatewayIntentBits } from "discord.js";
import path from "path";
import fs from "fs";
const app = express();
const upload = multer({
  fileFilter(_req, file, callback) {
    const isValid = [
      "image/bmp",
      "image/gif",
      "image/jpeg",
      "image/png",
    ].includes(file.mimetype);
    callback(null, isValid);
  },
});
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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

  app.post("/upload", upload.single("file"), async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(400).send("No file");
      return;
    }
    // save file to tmp folder
    const tmpFile = path.join(tmpFolder, file.originalname);
    fs.writeFileSync(tmpFile, file.buffer);
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
