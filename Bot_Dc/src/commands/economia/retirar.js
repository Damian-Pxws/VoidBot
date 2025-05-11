const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/voidcoins.json');

module.exports = {
  name: 'retirar',
  description: 'Retira monedas del banco.',

  execute(message, args) {
    const username = message.author.username; // Usar el username en lugar del ID
    const guildId = message.guild.id;
    const amount = parseInt(args[0]);

    if (isNaN(amount) || amount <= 0) return message.reply('Cantidad inválida.');

    if (!fs.existsSync(dbPath)) return message.reply('No hay datos aún.');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!data[guildId] || !data[guildId][username]) return message.reply('No tienes cuenta.');

    const user = data[guildId][username]; // Acceder a los datos del usuario por username
    if ((user.bank || 0) < amount) return message.reply('No tienes suficiente **VoidCoins** en el banco.');

    // Actualizar los datos del usuario
    user.bank -= amount;
    user.coins = (user.coins || 0) + amount;

    // Guardar los datos actualizados en el archivo
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    message.reply(`Has retirado 💰 **${amount} VoidCoins** de tu banco.`);
  }
};