const Discord = require("discord.js");
const utils = require("../utils/utils");

const config = require("../utils/config");

module.exports = {
  /**
   * @param {Discord.Client} client Cliente de Discord del bot
   * @param {object} reactRolesData Data de reacciones
   */
  roleReactAddEvent(client, reactRolesData) {
    client.on("messageReactionAdd", async (messageReaction, user) => {
      if (!messageReaction.message.guild || user.bot) {
        return;
      }

      utils.logMessage(
        "roleReactAddEvent",
        `Reacción detectada: ${messageReaction.emoji.toString()} ` +
          `(mensaje: ${messageReaction.message.id}, ` +
          `canal: ${messageReaction.message.channelId})`,
      );

      if (
        config.rolesChannelId !== messageReaction.message.channel.id ||
        config.rolesMessageId !== messageReaction.message.id
      ) {
        utils.logMessage(
          "roleReactAddEvent",
          `Ignorando reacción en canal o mensaje incorrecto. Esperado: ` +
            `Canal: ${config.rolesChannelId} - Mensaje: ${config.rolesMessageId}`,
        );
        return;
      }

      try {
        const validReactions = reactRolesData.reactionMap;
        var roleIDToAdd = null;

        if (messageReaction.emoji.id != null)
          roleIDToAdd = validReactions.get(messageReaction.emoji.id);
        else roleIDToAdd = validReactions.get(messageReaction.emoji.toString());

        var role = messageReaction.message.guild.roles.cache.get(roleIDToAdd);

        if (!role) {
          utils.logMessage(
            "roleReactAddEvent",
            `Emoji incorrecto (${messageReaction.emoji.toString()})`,
          );
          await messageReaction.remove();
          return;
        }

        utils.logMessage(
          "roleReactAddEvent",
          `Received reaction ${messageReaction.emoji.toString()}, adding role ${role}`,
        );

        await messageReaction.message.guild.members.cache.get(user.id).roles.add(role);
      } catch (error) {
        utils.logMessage("roleReactAddEvent", "Error adding role: " + error);
        await messageReaction.users.remove(user);
      }
    });
  },

  /**
   * @param {Discord.Client} client Cliente de Discord del bot
   * @param {object} reactRolesData Data de reacciones
   */
  roleReactRemoveEvent(client, reactRolesData) {
    client.on("messageReactionRemove", async (messageReaction, user) => {
      if (!messageReaction.message.guild || user.bot) return;

      utils.logMessage(
        "roleReactRemoveEvent",
        `Reacción detectada: ${messageReaction.emoji.toString()} ` +
          `(mensaje: ${messageReaction.message.id}, ` +
          `canal: ${messageReaction.message.channelId})`,
      );

      if (
        config.rolesChannelId !== messageReaction.message.channel.id ||
        config.rolesMessageId !== messageReaction.message.id
      ) {
        utils.logMessage(
          "roleReactRemoveEvent",
          "Ignorando reacción en canal o mensaje incorrecto",
        );
        return;
      }

      const validReactions = reactRolesData.reactionMap;
      var roleToRemove = null;

      if (messageReaction.emoji.id != null)
        roleToRemove = validReactions.get(messageReaction.emoji.id);
      else roleToRemove = validReactions.get(messageReaction.emoji.toString());

      utils.logMessage(
        "roleReactRemoveEvent",
        `Received reaction ${messageReaction.emoji.toString()}, removing role ${roleToRemove}`,
      );

      await messageReaction.message.guild.members.cache.get(user.id).roles.remove(roleToRemove);
    });
  },
};
