const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  name: "archive",
  description: "Archivar una categoría de canales",
  /**
   * @summary Archiva todos los canales en una categoría dada y elimina permisos
   * @param {Discord.Message} message Mensaje
   * @param {string[]} args Argumentos
   */
  async execute(message, args) {
    const author = message.author;

    if (!args.length) {
      await author
        .send("Para archivar una categoría, incluye el ID de la categoría como argumento")
        .catch((err) =>
          utils.logMessage("archive", `No se pudo enviar mensaje a usuario por: ${err}`),
        );
      return;
    }

    const categoryId = args[0];
    const category = message.guild.channels.resolve(categoryId);

    utils.logMessage(
      "archive",
      `Iniciando archivado de categoría: ${categoryId} (${category.name}) por el usuario ${author.tag}`,
    );

    const lastYear = new Date().getFullYear() - 1;
    const archivedCategoryNamePrefix = `Archivo-${lastYear}`;

    if (category && category.type === Discord.ChannelType.GuildCategory) {
      // Rename the category
      const newCategoryName = `${archivedCategoryNamePrefix}-${category.name}`;
      await category.setName(newCategoryName);

      // The category might have user-specific permissions, we need to remove them
      const permissionOverwrites = category.permissionOverwrites.cache;

      for (const [id, overwrite] of permissionOverwrites) {
        utils.logMessage(
          "archive",
          `Eliminando permisos para ID: ${id} en la categoría: ${newCategoryName}`,
        );
        await category.permissionOverwrites.delete(id);
      }

      // For good measure, remove access to the category for everyone role
      const everyoneRole = message.guild.roles.everyone;
      await category.permissionOverwrites.create(everyoneRole, {
        ViewChannel: false,
      });

      utils.logMessage("archive", `Categoría archivada exitosamente: ${newCategoryName}`);

      await author
        .send(
          `La categoría "${category.name}" ha sido archivada exitosamente como "${newCategoryName}".`,
        )
        .catch((err) =>
          utils.logMessage("archive", `No se pudo enviar mensaje a usuario por: ${err}`),
        );
    }
  },
};
