const { EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');
const dbPath = path.join(__dirname, '../../data/voidcoins.json');
const prefix = '!';

module.exports = {
  name: 'pay',
  description: 'Envía monedas a otro usuario',
  async execute(message, args) {
    if (args.length < 2) {
      return message.reply('Por favor, menciona al usuario y la cantidad de monedas que deseas enviar.');
    }

    // Verificar si el primer argumento es un usuario
    const recipient = message.mentions.users.first();
    if (!recipient) {
      return message.reply('No se ha encontrado al usuario mencionado.');
    }

    // Verificar si el segundo argumento es una cantidad de monedas
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) {
      return message.reply('Por favor, ingresa una cantidad válida de monedas.');
    }

    const username = message.author.username; // Cambiado de userId a username
    const recipientUsername = recipient.username; // Usar el username del destinatario
    const guildId = message.guild.id;

    // Verificar si el archivo de datos existe
    try {
      await fs.access(dbPath);
    } catch (err) {
      return message.reply('El archivo de monedas no se encuentra, por favor contacta con un administrador.');
    }

    // Leer los datos del archivo
    let data;
    try {
      const fileData = await fs.readFile(dbPath, 'utf8');
      data = JSON.parse(fileData);
    } catch (err) {
      console.error('Error al leer el archivo:', err);
      return message.reply('Hubo un problema al leer los datos. Intenta más tarde.');
    }

    // Asegurarse de que el servidor y las cuentas de los usuarios existan
    if (!data[guildId]) {
      data[guildId] = {};
    }
    if (!data[guildId][username]) {
      data[guildId][username] = { coins: 0 };
    }
    if (!data[guildId][recipientUsername]) {
      data[guildId][recipientUsername] = { coins: 0 };
    }

    // Depuración para verificar el saldo actual del usuario
    console.log(`Saldo de ${message.author.username} en el servidor ${message.guild.name}: ${data[guildId][username].coins} VoidCoins`);

    // Verificar si el usuario tiene suficiente saldo
    if (data[guildId][username].coins < amount) {
      return message.reply(`No tienes suficiente saldo. Tienes **${data[guildId][username].coins} VoidCoins**.`);
    }

    // Realizar la transferencia
    data[guildId][username].coins -= amount;
    data[guildId][recipientUsername].coins += amount;

    // Guardar los datos actualizados en el archivo JSON
    try {
      await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
      console.log('Datos guardados correctamente.');
    } catch (err) {
      console.error('Error al guardar el archivo:', err);
      return message.reply('Hubo un problema al guardar los datos. Intenta más tarde.');
    }

    // TRANSFERENCIA VISUAL
    const embed = new EmbedBuilder()
      .setTitle('💸 Transferencia completada')
      .setDescription(`**${message.author.username}** le envió **${amount} VoidCoins** a **${recipient.username}**`)
      .setColor(0x00FF00)  // Para el color verde
      .setTimestamp();

    message.channel.send({ embeds: [embed] });
  },
};