"use strict";

// Dependencies
const Discord = require("discord.js");

// Project files
const roleReactionEvent = require("./events/roleReactEvent.js");
const config = require("./utils/config.js");
const scheduled_messages = require(`./resources/scheduledMessages.json`);
const utils = require("./utils/utils.js");
const { setupClientCommands } = require("./utils/botSetup.js");

// Create a new discord client
const Intents = Discord.GatewayIntentBits;
const Partials = Discord.Partials;

const client = new Discord.Client({
  partials: [Partials.Message, Partials.GuildMember, Partials.Reaction, Partials.User],
  intents: [
    Intents.Guilds,
    Intents.GuildMembers,
    Intents.GuildModeration,
    Intents.GuildExpressions,
    Intents.GuildPresences,
    Intents.GuildMessages,
    Intents.GuildMessageReactions,
    Intents.GuildMessageTyping,
    Intents.MessageContent,
    Intents.DirectMessages,
    Intents.DirectMessageReactions,
    Intents.DirectMessageTyping,
  ],
});

// Setting up commands
setupClientCommands(client);

// Logging into Discord with the config's token
const token = config.token;
try {
  utils.logMessage("main", "Attempting to log into the server...");

  client.login(token).then(() => {
    utils.logMessage("main", `Successfully logged into the server`);
  });
} catch {
  utils.logMessage("main", `Error login into the server!`);
}

// Once client is ready, we start everything!
client.once("ready", () => {
  utils.logMessage("main", "Client ready!");

  // Set up scheduled messages
  if (!config.scheduledMessagesChannelId) return;

  utils.logMessage("main", "Scheduling messages:");
  for (const m of scheduled_messages.messages) {
    // milliseconds between scheduled date and now
    const timeToWait = new Date(m.date) - Date.now();

    if (timeToWait < 0)
      // message already send or scheduled to some time in the past
      continue;

    utils.logMessage(
      "main",
      `  * Scheduling message '\u001b[36m${m.title}\u001b[0m' to \u001b[32m${m.date}\u001b[0m`,
    );

    // Set timeout to wait for 'timeToWait' milliseconds to send message
    setTimeout(() => {
      const channel = client.channels.cache.get(config.scheduledMessagesChannelId);
      channel.send(m.message + " link: " + m.link);
    }, timeToWait);
  }
  utils.logMessage("main", "Messages scheduled!");
});

const reactRolesData = {
  channelID: config.rolesChannelId,
  messageID: config.rolesMessageId,
  reactionMap: new Map(),
};

// Loading messages files
utils.initWelcomeMessageEvent(client, "¡Bienvenido al Caracas Game Jam!");

var reaction_msg = "¡Reacciona para obtener roles aquí!";
reaction_msg = utils.fileToText(config.rolesMessageFilePath).then((data) => {
  reaction_msg = data;
});
roleReactionEvent.roleReactRemoveEvent(client, reactRolesData);
roleReactionEvent.roleReactAddEvent(client, reactRolesData);

// Eliminar todos los mensajes en el canal de reglas
client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  if (message.channel.id === config.welcomeChannelId) {
    // Únicamente eliminamos los mensajes que no empiecen por `!acepto`
    // ya que esos se eliminan en el manejador del comando acepto
    if (!message.content.trim().startsWith("!acepto")) {
      utils.logMessage("main", `Eliminando mensaje del canal de reglas: ${message.conten}`);
      message.delete().catch((err) => {
        utils.logMessage("main", `Error al eliminar mensaje del canal de reglas: ${err}`);
      });
    }
  }
});

// Manejador principal de comandos
client.on("messageCreate", async (message) => {
  const prefix = config.prefix;

  if (!message.content.startsWith(prefix) || message.author.bot || !message.guild) return;

  const args = message.content.slice(prefix.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();
  const isAdmin = await utils.isAdmin(message.author, message.guild);

  if (command == "reaction" && isAdmin) {
    client.commands
      .get("reaction")
      .execute(message, args, reactRolesData, reaction_msg, config.rolesTableFilePath);
  } else if (command === "acepto") {
    client.commands
      .get("acepto")
      .execute(message, args, config.welcomeChannelId, config.acceptedUserRoleId, config.adminRoleId);
  } else if (command === "clear" && isAdmin) {
    client.commands.get("clear").execute(message, args);
  } else if (command == "crear_grupo" && isAdmin) {
    client.commands.get("crear_grupo").execute(message, args, config.acceptedUserRoleId);
  } else if (command == `refresh` && isAdmin) {
    client.commands.get("refresh").execute(message, reactRolesData, config.rolesTableFilePath);
  } else if (command === "admin") {
    client.commands.get("admin").execute(message, args, config.adminRoleId);
  }
});
