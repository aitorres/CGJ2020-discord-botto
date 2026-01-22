const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  name: "restartChannel",
  description: "Reiniciar un canal dado para una nueva edición del Jam",
  /**
   * @summary Crea una copia de un canal dado y archiva el original
   * @param {Discord.Message} message Mensaje
   * @param {string[]} args Argumentos
   */
  async execute(message, args) {
    const author = message.author;

    if (!args.length) {
      await author
        .send("Para reiniciar un canal, incluye el ID del canal como argumento")
        .catch((err) =>
          utils.logMessage("restartChannel", `No se pudo enviar mensaje a usuario por: ${err}`),
        );
      return;
    }

    const channelId = args[0];
    const channel = message.guild.channels.resolve(channelId);

    if (!channel) {
      await author
        .send(`No se encontró el canal con ID: ${channelId}`)
        .catch((err) =>
          utils.logMessage("restartChannel", `No se pudo enviar mensaje a usuario por: ${err}`),
        );
      return;
    }

    utils.logMessage(
      "restartChannel",
      `Iniciando reinicio del canal: ${channelId} (${channel.name}) por el usuario ${author.tag}`,
    );

    const channelName = channel.name;

    const lastYear = new Date().getFullYear() - 1;
    const archivedChannelName = `${channelName}-${lastYear}`;

    // Fetching content of the oldest message in the channel
    const fetchedMessages = await channel.messages.fetch({ limit: 1, after: "0" });
    let oldestMessageContent = null;
    if (fetchedMessages.size > 0) {
      const oldestMessage = fetchedMessages.first();
      oldestMessageContent = oldestMessage.content;
    }

    // Creating a new channel in the same category, with the same permissions
    const newChannel = await channel.clone({
      name: channelName,
      permissionOverwrites: channel.permissionOverwrites.cache,
    });

    // Archiving the old channel by renaming it
    await channel.setName(archivedChannelName);

    // Making the archived channel private and removing any specific permissions
    const permissionOverwrites = channel.permissionOverwrites.cache;

    for (const [id, overwrite] of permissionOverwrites) {
      utils.logMessage(
        "restartChannel",
        `Eliminando permisos para ID: ${id} en el canal archivado: ${archivedChannelName}`,
      );
      await channel.permissionOverwrites.delete(id);
    }

    // For good measure, remove access to the channel for everyone role
    const everyoneRole = message.guild.roles.everyone;
    await channel.permissionOverwrites.create(everyoneRole, {
      ViewChannel: false,
    });

    utils.logMessage(
      "restartChannel",
      `Canal reiniciado exitosamente: ${newChannel.id} (${newChannel.name})`,
    );

    // Publish a message in the new channel with the oldest message content if available
    if (oldestMessageContent) {
      await newChannel.send(oldestMessageContent);

      utils.logMessage(
        "restartChannel",
        `Mensaje inicial publicado en el nuevo canal: ${newChannel.id}, contenido: ${oldestMessageContent}`,
      );
    }

    await author
      .send(
        `El canal "${channelName}" ha sido reiniciado exitosamente. Nuevo canal: "${newChannel.name}"`,
      )
      .catch((err) =>
        utils.logMessage("restartChannel", `No se pudo enviar mensaje a usuario por: ${err}`),
      );
  },
};
