const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, '../../data/voidcoins.json');
const COOLDOWN = 24 * 60 * 60 * 1000; // 24 horas
const REWARD_AMOUNT = 100;

module.exports = {
  name: 'claim',
  description: '¡Añade 100 VoidCoins al saldo del usuario cada 24 horas!',
  async execute(message, args) {
    const username = message.author.username; // Usar el username en lugar del ID
    const guildId = message.guild.id;

    // Crear archivo si no existe
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, '{}');
    }

    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Inicializar estructura para el servidor y usuario si no existe
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][username]) {
      data[guildId][username] = {
        coins: 0,
        bank: 0,
        lastClaim: 0
      };
    }

    const userData = data[guildId][username];
    const now = Date.now();

    if (now - userData.lastClaim < COOLDOWN) {
      const remaining = COOLDOWN - (now - userData.lastClaim);
      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      return message.reply(`🕒 Ya reclamaste tu recompensa diaria. Vuelve en ${hours}h ${minutes}m.`);
    }

    userData.coins += REWARD_AMOUNT;
    userData.lastClaim = now;

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));

    message.reply(`✅ Has reclamado tus **${REWARD_AMOUNT} VoidCoins** diarios. ¡Vuelve mañana!`);
  }
};