"use strict";

// Dependencies
const Discord = require("discord.js");

// Project files
const roleReactionEvent = require("./events/roleReactEvent.js");
const joinUserEvent = require("./events/joinUserEvent.js");
const config = require("./utils/config.js");

const utils = require("./utils/utils.js");
const botMessages = require("./resources/botMessages.js");
const botSetup = require("./utils/botSetup.js");

// Create a new discord client
const client = new Discord.Client({
  partials: [
    Discord.Partials.Message,
    Discord.Partials.GuildMember,
    Discord.Partials.Reaction,
    Discord.Partials.User,
  ],
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildModeration,
    Discord.GatewayIntentBits.GuildExpressions,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
    Discord.GatewayIntentBits.GuildMessageTyping,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.DirectMessages,
    Discord.GatewayIntentBits.DirectMessageReactions,
    Discord.GatewayIntentBits.DirectMessageTyping,
  ],
});

// Setting up commands
botSetup.setupClientCommands(client);

// Logging into Discord with the config's token
botSetup.logInDiscordBot(client);

// Once client is ready, we start everything!
client.once("ready", () => {
  // Scheduling bot messages (resources, etc)
  botSetup.scheduleBotMessages(client);

  // TODO: refresh roles upon restart? maybe also refresh every so often to keep them up to date?

  // Letting the user know that the client is ready
  utils.logMessage("main", "Client ready!");
});

const reactRolesData = {
  channelID: config.rolesChannelId,
  messageID: config.rolesMessageId,
  reactionMap: new Map(),
};

// Setting up welcome message event
joinUserEvent.setupWelcomeMessageOnJoin(client);

// Setting up reaction roles event handlers
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
      .execute(message, args, reactRolesData, botMessages.rolesMessage, config.rolesTableFilePath);
  } else if (command === "acepto") {
    client.commands
      .get("acepto")
      .execute(
        message,
        args,
        config.welcomeChannelId,
        config.acceptedUserRoleId,
        config.adminRoleId,
      );
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
