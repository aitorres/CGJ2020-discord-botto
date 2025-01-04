const { Collection } = require("discord.js");
const FileSystem = require("fs");


module.exports = {
    /**
     * Carga todos los comandos del directorio de comandos
     * para poder ser ejecutados por el bot
     * @param {Discord.Client} client cliente de discord.js
     */
    setupClientCommands(client) {
        const baseDir = `${__dirname}/..`;
        // Attaching a commands collection to the client
        client.commands = new Collection();

        // Loading commands from files and adding them to
        // the client's collection
        const commandFiles = FileSystem
            .readdirSync(baseDir + "/commands")
            .filter((file) => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(`${baseDir}/commands/${file}`);
            client.commands.set(command.name, command);
        }
    },

    logIn(client) {

    }
}
