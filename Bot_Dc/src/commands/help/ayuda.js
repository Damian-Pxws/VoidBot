const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = [
  {
    name: 'ayuda',
    description: '¡Responde con un mensaje de ayuda al usuario!',
    async execute(message, args) {
      // Crear el botón "Página Siguiente"
      const nextPageButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help-page-2')
          .setLabel('Más Ayuda')
          .setStyle(ButtonStyle.Primary)
      );

      // Enviar el mensaje con el botón
      await message.channel.send({
        content: `
        📜 **Comandos disponibles:**
        >>>  - !hola → El BOT responde con un saludo.
- !secreto → El BOT te habla por MD para poder usarlo de manera privada.
- !ping → Muestra la latencia del BOT.
- !passgen → Te genera una contraseña segura aleatoria cifrada y te la envia por MD.
- !paypal → Muestra el PayPal para hacer una donación y continuar con el mantenimiento del BOT.
        `,
        components: [nextPageButton],
      });
    },
  },
  {
    name: 'ayuda2',
    description: '¡Responde con un mensaje de ayuda al usuario!',
    async execute(interaction) {
      // Crear el botón "Página Siguiente"
      const nextPageButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('help-page-3')
          .setLabel('Más Ayuda')
          .setStyle(ButtonStyle.Primary)
      );

      // Enviar el mensaje con el botón
      await interaction.reply({
        content: `
        📜 **Comandos disponibles:**
        >>>  - !points → Te dice cuántos puntos tienes acumulados.
- !birthdate → Añade tu cumpleaños y el BOT creará un Evento anunciándolo a todo el servidor.
- !roll [6, 10, 12, 20, 51, 100] → Tira un dado del número de caras que elijas.
- !claim → Reclama tu recompensa diaria.
- !friendlist → Muestra tu lista de amigos.
        `,
        components: [nextPageButton],
        ephemeral: true, // Solo visible para el usuario que interactúa
      });
    },
  },
];