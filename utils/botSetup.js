const { Collection } = require("discord.js");
const FileSystem = require("fs");

const scheduledMessages = require(`../resources/scheduledMessages.json`);
const config = require("./config.js");
const utils = require("./utils.js");

module.exports = {
  /**
   * Carga todos los comandos del directorio de comandos
   * para poder ser ejecutados por el bot
   * @param {Discord.Client} client cliente de discord.js
   */
  setupClientCommands(client) {
    const baseDir = `${__dirname}/..`;
    // Attaching a commands collection to the client
    utils.logMessage("setupClientCommands", "Initializing bot commands...");
    client.commands = new Collection();

    // Loading commands from files and adding them to
    // the client's collection
    const commandFiles = FileSystem.readdirSync(baseDir + "/commands").filter((file) =>
      file.endsWith(".js"),
    );
    utils.logMessage("setupClientCommands", `Found ${commandFiles.length} commands.`);

    for (const file of commandFiles) {
      const command = require(`${baseDir}/commands/${file}`);
      utils.logMessage("setupClientCommands", `Loading command: ${command.name}`);
      client.commands.set(command.name, command);
    }
    utils.logMessage("setupClientCommands", "Bot commands initialized.");
  },

  /**
   * Inicia la sesión del bot utilizando el token de la configuración
   * @param {Discord.Client} client cliente de discord.js
   */
  logInDiscordBot(client) {
    utils.logMessage("logInDiscordBot", "Attempting to log into the server...");

    try {
      client.login(config.token).then(() => {
        utils.logMessage("logInDiscordBot", `Successfully logged into the server`);
      });
    } catch (error) {
      utils.logMessage("logInDiscordBot", `FATAL: Error login into the server! ${error}`);
      throw error;
    }
  },

  /**
   * Programa los mensajes que el bot debe enviar (con enlaces a recursos)
   * en el canal de mensajes programados. Los mensajes se leen
   * desde un archivo de texto y se envían en momentos específicos.
   * @param {Discord.Client} client cliente de discord.js
   */
  scheduleBotMessages(client) {
    utils.logMessage("scheduleBotMessages", "Scheduling bot messages...");

    if (!config.scheduledMessagesChannelId) {
      utils.logMessage("scheduleBotMessages", "WARNING: No scheduled messages channel ID provided.");
      return;
    }

    const messages = scheduledMessages.messages;
    utils.logMessage("scheduleBotMessages", `Found ${messages.length} scheduled messages.`);

    for (const message of messages) {
      // Calculating time between now and the scheduled datetime
      const timeToWait = new Date(message.date) - Date.now();

      // If timeToWait is negative, we were supposed to send the message in the past.
      // We skip it.
      if (timeToWait < 0) {
        utils.logMessage(
          "scheduleBotMessages",
          `\tWARNING: Skipping message '${message.title}' because it was scheduled in the past.`,
        );
        continue;
      }

      utils.logMessage(
        "scheduleBotMessages",
        `\tScheduling message '${message.title}' to ${message.date}`,
      );

      // Set timeout to wait for 'timeToWait' milliseconds to send message
      setTimeout(() => {
        const channel = client.channels.cache.get(config.scheduledMessagesChannelId);
        channel.send(message.message + " link: " + message.link);
      }, timeToWait);
    }

    utils.logMessage("scheduleBotMessages", "Bot messages scheduled!");
  }
};
