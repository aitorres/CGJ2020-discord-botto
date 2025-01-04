const Discord = require("discord.js");

const config = require("../utils/config");
const utils = require("../utils/utils");
const roleReactions = require("../resources/roleReactions.js");

/**
 * @summary Adds/removes a role associated to a reaction from an user if it is needed
 * @param {Discord.GuildMember} user User to process
 * @param {Discord.MessageReaction} react Reaction to check
 * @param {Discord.Role} role Role associated to the reaction
 */
const processUser = (user, role, reactionUsers) => {
  // Removing a role that the user shouldn't have
  if (!reactionUsers.has(user.id) && user.roles.cache.has(role.id)) user.roles.remove(role);
  // Adding a role that the user should have
  else if (reactionUsers.has(user.id) && !user.roles.cache.has(role.id)) user.roles.add(role);
};

const reactionToEmojiId = (reaction) => {
  return reaction.emoji.id != null ? reaction.emoji.id : reaction.emoji.name;
};

const refreshRoles = async (guild, reactionMessageObject) => {
  // We get the guild roles
  var guildRoles = guild.roles.cache;

  // Now we retrieve the current roles message from the channel. Note that
  // we fetch the roles reaction message from scratch (not from cache)
  // to use fresh data after a crash
  const rolesChannel = guild.channels.resolve(config.rolesChannelId);
  const rolesChannelMessageManager = rolesChannel.messages;
  const rolesMessage = await rolesChannelMessageManager.fetch(config.rolesMessageId);

  utils.logMessage("refreshRoles", `Current roles message content: "${rolesMessage.content}"`);

  // We set up the Roles <--> Reaction object from scratch
  reactionMessageObject.reactionMap = new Map();

  // We load Roles <--> Reaction Emoji from the reactions file
  roleReactions.reactions.forEach((reaction) => {
    utils.logMessage(
      "refreshRoles",
      `Setting up reaction: ${reaction.emoji} for role: ${reaction.roleId}`,
    );
    reactionMessageObject.reactionMap.set(reaction.emoji, reaction.roleId);
  });

  // We retrieve the reactions from the current message
  const reactionsManager = rolesMessage.reactions;
  utils.logMessage("refresRolesh", `Reactions found in old msg: ${reactionsManager.cache.size}`);

  // We check which reactions in the desi∂gnated reaction message are
  // valid for our purposes and match the Roles <--> Reaction data loaded.
  var validReactions = [];
  reactionsManager.cache.forEach((reaction) => {
    utils.logMessage(
      "refreshRoles",
      `\t Processing: Reaction emoji name: ${reaction.emoji.name} (custom id: ${reaction.emoji.id})`,
    );

    var reactionEmoji = reactionToEmojiId(reaction);

    if (reactionMessageObject.reactionMap.has(reactionEmoji)) {
      utils.logMessage(
        "refresRolesh",
        `\t\tRole associated: ${guildRoles.get(reactionMessageObject.reactionMap.get(reactionEmoji)).name}`,
      );
      validReactions.push(reaction);
    } else {
      utils.logMessage("refreshRoles", `\t\tNot a valid reaction! Removing...`);
      reaction.remove();
    }
  });

  // We now fetch the users that reacted to each valid reaction
  var validReactionUserMap = new Map();
  await Promise.all(
    validReactions.map(async (reaction) => {
      try {
        var users = await reaction.users.fetch();
        validReactionUserMap.set(reaction, users);
      } catch (error) {
        utils.logMessage(
          "refreshRoles",
          `Error fetching users for valid reaction ${reactionToEmojiId(reaction)}: ${error}`,
        );
      }
    }),
  );

  // Finally we process each user in the guild to check if they need to be assigned or removed a role,
  // and achieve the desired state
  const guildUsers = guild.members.cache;
  utils.logMessage("refreshRoles", `Processing ${guildUsers.size} users...`);
  guildUsers.forEach((guildUser) => {
    // Bot users should not be processed
    if (guildUser.user.bot) return;

    validReactions.forEach((validReaction) => {
      var reactionEmoji = reactionToEmojiId(validReaction);

      processUser(
        guildUser,
        guildRoles.get(reactionMessageObject.reactionMap.get(reactionEmoji)),
        validReactionUserMap.get(validReaction),
      );
    });
  });
  utils.logMessage("refreshRoles", `Refresh complete!`);
};

module.exports = {
  name: "refresh",
  description: "Refresh roles message",
  refreshCallback: refreshRoles,
  /**
   * This command aims to refresh the roles message and reassign roles to users
   * in case the bot crashes
   * @param {Discord.Message} message
   * @param {object} reactionMessageObject
   */
  async execute(message, reactionMessageObject) {
    // We start by fetching the guild (server) from the message
    const guild = message.guild;

    await refreshRoles(guild, reactionMessageObject);
  },
};
