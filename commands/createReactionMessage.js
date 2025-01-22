const utils = require("../utils/utils.js");
const Discord = require("discord.js");

const botMessages = require("../resources/botMessages.js");
const config = require("../utils/config.js");

module.exports = {
  name: "createReactionMessage",
  description: "Create reaction message for users to acquire server roles",
  /**
   * @param {Discord.Message} message Command
   * @param {string[]} args Command args
   * @param {Object} message_object Objeto con informacion de emoji/roles
   */
  async execute(message, args, message_object) {
    // Ensuring the message is sent in the correct format
    if (args.length <= 0 || args.length % 2 !== 0) {
      await message
        .reply("Remember to pass the correct number of parameters: <emoji> <role> <emoji> <role>!")
        .catch((err) => {
          utils.logMessage(
            "createReactionMessage",
            `There was a problem replying the author of the mesage. Problem: ${err}`,
          );
        });
      return;
    }

    // Verifying the message was sent on the roles channel
    if (message.channel.id !== config.rolesChannelId) {
      await message.reply("This command can only be used in the roles channel.").catch((err) => {
        utils.logMessage(
          "createReactionMessage",
          `There was a problem replying the author of the mesage. Problem: ${err}`,
        );
      });
      return;
    }

    // Sending the role message on the channel
    var reactMessage;
    try {
      reactMessage = await message.channel.send(botMessages.rolesMessage);
    } catch (err) {
      utils.logMessage("createReactionMessage", `Problem sending reaction message`);
      await message.channel
        .send(`There was a problem setting up the reaction message.`)
        .catch(() => {});
      return;
    }

    // Log the reactMessage ID and instruct the user to update the bot server
    // environment config and restart the bot
    utils.logMessage(
      "createReactionMessage",
      `Created reaction message ${reactMessage.id} on channel ${message.channel.id}`,
    );

    // We're clearing the previous roles map, if it exists
    message_object.reactionMap.clear();

    for (var i = 0; i < Math.floor(args.length / 2); ++i) {
      const ie = 2 * i;
      const ir = ie + 1;

      // Extracting emoji from message.
      var emojiID = -1;
      if (utils.isCustomEmoji(args[ie])) {
        emojiID = utils.extractIDFromCustomEmoji(args[ie]);
      } else {
        emojiID = args[ie];
        utils.logMessage("createReactionMessage", emojiID);
      }

      // Reacting to the message
      try {
        await reactMessage.react(emojiID);
      } catch (err) {
        utils.logMessage("createReactionMessage", err);
        utils.logMessage(
          "createReactionMessage",
          `Problem reacting with ${emojiID}.\n` + `Probably non valid emoji`,
        );
        return;
      }

      // Extracting role from message
      var role = null;
      try {
        // Previously fetch.
        role = message.guild.roles.resolve(args[ir]);
      } catch (error) {
        utils.logMessage("reaction", error);
        utils.logMessage("reaction", `${args[ir]} no es un rol valido.`);
        return;
      }
      message_object.reactionMap.set(emojiID, role.id);
    }
  },
};
