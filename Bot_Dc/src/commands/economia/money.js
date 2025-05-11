const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/voidcoins.json');

module.exports = {
  name: 'money',
  description: '¡Indica el saldo de VoidCoins del usuario!',
  execute(message, args) {
    const username = message.author.username; // Se usa el username en lugar del ID del usuario
    const guildId = message.guild.id;

    // Verificar si el archivo de datos existe
    if (!fs.existsSync(dbPath)) return message.reply('No hay datos aún.');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Verificar si el usuario tiene datos registrados
    const user = data[guildId]?.[username];
    if (!user) return message.reply('No tienes **VoidCoins** todavía.');

    // Responder con el saldo del usuario
    message.reply(`Tienes 💰 **${user.coins || 0} VoidCoins**.`);
  }
};