const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/voidcoins.json');

module.exports = {
  name: 'bank',
  description: 'Muestra tu saldo bancario y total de monedas.',

  execute(message) {
    const username = message.author.username; // Se usa el username en lugar del ID del usuario
    const guildId = message.guild.id;

    // Verificar si el archivo de datos existe
    if (!fs.existsSync(dbPath)) return message.reply('No hay datos aún.');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Verificar si el usuario tiene datos registrados
    const user = data[guildId]?.[username];
    if (!user) return message.reply('No tienes monedas.');

    // Obtener los saldos del usuario
    const coins = user.coins || 0;
    const bank = user.bank || 0;

    // Responder con el saldo del usuario
    message.reply(`Saldo: 💰 **${coins} VoidCoins**\nSaldo en banco: 🏦 **${bank} VoidCoins**`);
  }
};