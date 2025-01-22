const utils = require("../utils/utils.js");
const Discord = require("discord.js");

const botMessages = require("../resources/botMessages.js");
const config = require("../utils/config.js");

module.exports = {
    name: "updateReactionMessage",
    description: "Update reaction message for users to acquire server roles",
    async execute(message) {
        // Verifying the user that sent it is an admin
        if (!utils.isAdmin(message.author, message.guild)) {
            await message.reply("You are not authorized to use this command.").catch((err) => {
                utils.logMessage(
                    "updateReactionMessage",
                    `There was a problem replying the author of the mesage. Problem: ${err}`,
                );
            });
            return;
        }

        const rolesMessageId = config.rolesMessageId;
        const newMessage = botMessages.rolesMessage;

        // Fetching the message
        const rolesChannel = message.guild.channels.cache.get(config.rolesChannelId);
        const rolesMessage = await rolesChannel.messages.fetch(rolesMessageId);

        // Editing the message
        rolesMessage.edit(newMessage).catch((err) => {
            utils.logMessage(
                "updateReactionMessage",
                `There was a problem editing the message. Problem: ${err}`,
            );
        });

        utils.logMessage(
            "updateReactionMessage",
            `Updated reaction message ${rolesMessageId} on channel ${rolesChannel.id}`,
        );
        return;
    }
}