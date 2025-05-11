const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/voidcoins.json');

module.exports = {
  name: 'depositar',
  description: 'Deposita monedas en tu banco.',
  execute(message, args) {
    const username = message.author.username; // Se usa el username en lugar del ID del usuario
    const guildId = message.guild.id;
    const amount = parseInt(args[0]);

    // Validar cantidad ingresada
    if (isNaN(amount) || amount <= 0) return message.reply('Cantidad inválida.');

    // Verificar si el archivo de datos existe
    if (!fs.existsSync(dbPath)) return message.reply('No hay datos aún.');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Verificar si el usuario tiene datos registrados
    if (!data[guildId] || !data[guildId][username]) return message.reply('No tienes **VoidCoins**.');

    const user = data[guildId][username]; // Acceder a los datos del usuario por username
    if (user.coins < amount) return message.reply('No tienes suficientes **VoidCoins**.');

    // Actualizar los datos del usuario
    user.coins -= amount;
    user.bank = (user.bank || 0) + amount;

    // Guardar los datos actualizados en el archivo
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    message.reply(`Has depositado 💰 **${amount} VoidCoins** en tu banco.`);
  }
};