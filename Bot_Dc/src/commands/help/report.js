const fs = require('fs');
const path = require('path');
const { PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const reportsPath = path.join(__dirname, '../../data/reports.json');

// Asegurarse de que el archivo de reportes existe
function ensureReportsFile() {
  if (!fs.existsSync(reportsPath)) {
    fs.writeFileSync(reportsPath, '{}'); // Crear el archivo si no existe
  }
}

// Función para obtener el próximo número de ticket
function getNextTicketNumber(guildId) {
  ensureReportsFile();
  const data = JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
  if (!data[guildId]) {
    data[guildId] = {};
  }
  return Object.keys(data[guildId]).length + 1; // El número del ticket es el siguiente en la lista
}

// Función para guardar el reporte en el archivo
function saveReport(ticketNumber, guildId, reporterName, reportedName, reason) {
  ensureReportsFile();
  const data = JSON.parse(fs.readFileSync(reportsPath, 'utf8'));
  if (!data[guildId]) {
    data[guildId] = {};
  }
  data[guildId][ticketNumber] = {
    reporter: reporterName,
    reported: reportedName,
    reason: reason,
    timestamp: new Date().toISOString(),
  };
  fs.writeFileSync(reportsPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'report',
  description: 'Reporta a un usuario y crea un canal privado para discutir el caso.',
  async execute(message, args) {
    const guild = message.guild;
    const reporter = message.author;

    // Verificar si se proporcionó un usuario a reportar
    const userToReport = message.mentions.users.first();
    if (!userToReport) {
      await message.reply('❌ Debes mencionar al usuario que deseas reportar. Ejemplo: `!report @usuario razón`');
      return message.delete().catch(console.error); // Eliminar el mensaje del comando
    }

    // Verificar si se proporcionó una razón
    const reason = args.slice(1).join(' ');
    if (!reason) {
      await message.reply('❌ Debes proporcionar una razón para el reporte. Ejemplo: `!report @usuario razón`');
      return message.delete().catch(console.error); // Eliminar el mensaje del comando
    }

    // Obtener el número del ticket
    const ticketNumber = getNextTicketNumber(guild.id);

    // Crear un canal privado para el ticket
    const channelName = `ticket-${ticketNumber}`;
    try {
      const ticketChannel = await guild.channels.create({
        name: channelName,
        type: 0, // Canal de texto
        permissionOverwrites: [
          {
            id: guild.id, // Todos los miembros del servidor
            deny: [PermissionsBitField.Flags.ViewChannel], // Denegar acceso al canal
          },
          {
            id: reporter.id, // Usuario que reportó
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Permitir acceso
          },
          {
            id: userToReport.id, // Usuario reportado
            deny: [PermissionsBitField.Flags.ViewChannel], // Denegar acceso al canal
          },
          {
            id: guild.roles.everyone.id, // Rol predeterminado
            deny: [PermissionsBitField.Flags.ViewChannel], // Denegar acceso
          },
          {
            id: guild.roles.cache.find(role => role.permissions.has(PermissionsBitField.Flags.ManageGuild))?.id, // Administradores
            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages], // Permitir acceso
          },
        ],
      });

      // Crear un botón para cerrar el ticket
      const closeButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`close-ticket-${ticketNumber}`)
          .setLabel('Cerrar Ticket')
          .setStyle(ButtonStyle.Danger)
      );

      // Enviar un mensaje inicial en el canal del ticket con mención al usuario que reporta
      await ticketChannel.send({
        content: `🔔 **Nuevo reporte**\n\n**Número del ticket:** #${ticketNumber}\n**Reportado por:** ${reporter} (${reporter.tag})\n**Usuario reportado:** ${userToReport} (${userToReport.tag})\n**Razón:** ${reason}\n\n${reporter}, los administradores revisarán este caso.`,
        components: [closeButton],
      });

      // Guardar el reporte en el archivo
      saveReport(ticketNumber, guild.id, reporter.tag, userToReport.tag, reason);

      // Confirmar al usuario que el ticket fue creado en el canal del ticket
    } catch (error) {
      console.error('Error al crear el canal del ticket:', error);
      await message.reply('❌ Hubo un error al intentar crear el ticket. Por favor, contacta a un administrador.');
    }

    // Eliminar el mensaje del comando
    return message.delete().catch(console.error);
  },

  // Manejar la interacción del botón para cerrar el ticket
  async handleInteraction(interaction) {
    if (!interaction.customId.startsWith('close-ticket-')) return;

    const ticketChannel = interaction.channel;
    const reporter = interaction.message.content.match(/Reportado por:.*\((.*?)\)/)[1]; // Extraer el tag del reportero

    try {
      // Obtener el historial del canal
      const messages = await ticketChannel.messages.fetch({ limit: 100 });
      const chatLog = messages
        .map(msg => `${msg.author.tag}: ${msg.content}`)
        .reverse()
        .join('\n');

      // Enviar el historial al usuario que reportó
      const user = interaction.guild.members.cache.find(member => member.user.tag === reporter)?.user;
      if (user) {
        await user.send(`📄 **Historial del ticket #${interaction.customId.split('-')[2]}**\n\n${chatLog}`);
      }

      // Eliminar el canal
      await ticketChannel.delete();
    } catch (error) {
      console.error('Error al cerrar el ticket:', error);
      await interaction.reply({ content: '❌ Hubo un error al intentar cerrar el ticket.', ephemeral: true });
    }
  },
};