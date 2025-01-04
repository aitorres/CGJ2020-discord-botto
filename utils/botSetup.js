const { Collection } = require("discord.js");
const FileSystem = require("fs");

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
};
