const Discord = require("discord.js");
const utils = require("../utils/utils");

module.exports = {
  name: "crear_grupo",
  description: "Crea un grupo.",
  /**
   * @summary Crea un grupo con canales privados
   * @param {Discord.Message} message Mensaje
   * @param {string[]} args Argumentos
   * @param {string[]} blockRoleId ID de rol a bloquear del grupo
   */
  async execute(message, args, blockRoleId) {
    // Validación de los argumentos
    if (args.length < 2) {
      utils.logMessage("createGroup", "Argumentos insuficientes para crear un grupo.");
      await message.author
        .send("Debes especificar el nombre e integrantes del equipo.")
        .catch((err) => {
          utils.logMessage("createGroup", `Error al enviar mensaje de alerta: ${err}`);
        });
      return;
    }

    // Nombre del equipo
    const teamName = args[0];
    utils.logMessage("createGroup", `Creando grupo ${teamName}...`);

    // Extrayendo usuarios del mensaje
    const users = [...message.mentions.members.values()];
    utils.logMessage("createGroup", `Usuarios a agregar al grupo: ${users}`);
    if (users.length <= 0) {
      await message.author
        .send("Debe haber al menos un usuario para hacer el equipo.")
        .catch((err) => {
          utils.logMessage("createGroup", `Error al enviar mensaje de alerta: ${err}`);
        });
      return;
    }

    utils.logMessage("createGroup", `Creando equipo ${teamName} con usuarios: ${users}`);
    const guild = message.guild;
    const category = await guild.channels.create({
      name: teamName,
      type: Discord.ChannelType.GuildCategory,
    });
    const textChannel = await guild.channels.create({
      name: teamName,
      type: Discord.ChannelType.GuildText,
    });
    const voiceChannel = await guild.channels.create({
      name: teamName,
      type: Discord.ChannelType.GuildVoice,
    });

    utils.logMessage(
      "createGroup",
      `Asociando canales de voz y texto a la categoría del equipo ${teamName}`,
    );
    await textChannel.setParent(category);
    await voiceChannel.setParent(category);

    // Los permisos base serán rechazar el acceso público, y el del rol de participantes
    var permissions = [
      {
        id: guild.roles.everyone.id,
        deny: [
          Discord.PermissionsBitField.Flags.ViewChannel,
          Discord.PermissionsBitField.Flags.Connect,
          Discord.PermissionsBitField.Flags.Speak,
        ],
      },
      {
        id: blockRoleId,
        deny: [
          Discord.PermissionsBitField.Flags.ViewChannel,
          Discord.PermissionsBitField.Flags.Connect,
          Discord.PermissionsBitField.Flags.Speak,
        ],
      },
    ];

    // Agregando permisos para cada usuario del equipo
    users.forEach(async (user) => {
      var allowUser = {
        id: user.id,
        allow: [
          Discord.PermissionsBitField.Flags.ViewChannel,
          Discord.PermissionsBitField.Flags.Connect,
          Discord.PermissionsBitField.Flags.Speak,
        ],
      };
      permissions.push(allowUser);
    });

    // Marcando los permisos
    utils.logMessage("createGroup", `Sobreescribiendo permisos del grupo ${teamName}...`);
    await Promise.all([
      category.permissionOverwrites.set(permissions),
      textChannel.permissionOverwrites.set(permissions),
      voiceChannel.permissionOverwrites.set(permissions),
    ]).catch((err) => {
      message.author
        .send("Ocurrió un error al asignar los permisos a los grupos, revisa la consola.")
        .catch((err2) => {
          utils.logMessage("createGroup", `Error al enviar mensaje de alerta: ${err2}`);
        });
      utils.logMessage("createGroup", `Error al asignar los permisos al grupo: ${err}`);
    });

    utils.logMessage("createGroup", `Grupo ${teamName} creado con éxito`);
  },
};
