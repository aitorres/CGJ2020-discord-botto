const Discord = require("discord.js");
const utils = require("../utils/utils");
const botMessages = require("../resources/botMessages");

module.exports = {
  /**
   * @param {Discord.Client} client Discord bot client
   */
  setupWelcomeMessageOnJoin(client) {
    client.on("guildMemberAdd", async (guildUser) => {
      var welcome = `Bienvenido ** ${guildUser.user} **\n\n`;
      welcome += botMessages.welcomeMessage;

      await guildUser.send(welcome).catch((err) => {
        utils.logMessage("guildMemberAdd", "ERROR sending welcome message: " + err);
      });
    });
  },
};
