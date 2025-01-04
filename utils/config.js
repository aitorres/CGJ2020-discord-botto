const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    token: process.env.TOKEN,
    botUsername: process.env.BOT_USERNAME,
    adminRoleId: process.env.ADMIN_ROLE_ID,
    scheduledMessagesChannelId: process.env.SCHEDULED_MESSAGES_CHANNEL_ID,
    rolesMessageId: process.env.ROLES_MESSAGE_ID,
    rolesChannelId: process.env.ROLES_CHANNEL_ID,
    rolesTableFilePath: process.env.ROLES_TABLE_FILE_PATH,
    welcomeChannelId: process.env.WELCOME_CHANNEL_ID,
    acceptedUserRoleId: process.env.ACCEPTED_USER_ROLE_ID,
    guildId: process.env.GUILD_ID,
    welcomeMessageFilePath: process.env.WELCOME_MESSAGE_FILE_PATH,
    rolesMessageFilePath: process.env.ROLES_MESSAGE_FILE_PATH,
    prefix: process.env.PREFIX || '!',
}
