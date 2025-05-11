const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../../data/voidcoins.json');

// Asegurarse de que el archivo de datos existe
function ensureDataFile() {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, '{}'); // Crear el archivo si no existe
  }
}

// Función para obtener los puntos de un usuario desde voidcoins.json
function getUserPoints(guildId, username) {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!data[guildId]) {
    data[guildId] = {};
  }
  if (!data[guildId][username]) {
    data[guildId][username] = { coins: 100, bank: 0 }; // Inicializar con 100 monedas si no existe
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  }
  return data[guildId][username].coins; // Retornar las monedas del usuario
}

// Función para actualizar los puntos de un usuario en voidcoins.json
function updateUserPoints(guildId, username, points) {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  if (!data[guildId]) {
    data[guildId] = {};
  }
  if (!data[guildId][username]) {
    data[guildId][username] = { coins: 100, bank: 0 }; // Inicializar con 100 monedas si no existe
  }
  data[guildId][username].coins = points; // Actualizar las monedas del usuario
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'gambling',
  description: 'Apuesta puntos en un juego de azar entre rojo (pares) y negro (impares).',
  execute(message, args) {
    const guildId = message.guild.id;
    const username = message.author.username;

    // Verificar si el usuario proporcionó un color y una cantidad
    const color = args[0]?.toLowerCase();
    const bet = parseInt(args[1], 10);

    if (!color || !['rojo', 'negro'].includes(color)) {
      return message.reply('❌ Debes elegir un color válido: `rojo` o `negro`. Ejemplo: `!gambling rojo 50`');
    }

    if (isNaN(bet) || bet <= 0) {
      return message.reply('❌ Debes apostar una cantidad válida de VoidCoins. Ejemplo: `!gambling rojo 50`');
    }

    // Obtener los puntos del usuario
    const userPoints = getUserPoints(guildId, username);

    if (bet > userPoints) {
      return message.reply('❌ No tienes suficientes VoidCoins para realizar esta apuesta.');
    }

    // Generar un número aleatorio entre 1 y 100
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    const resultColor = randomNumber % 2 === 0 ? 'rojo' : 'negro';

    // Determinar el resultado
    if (color === resultColor) {
      const winnings = bet * 2;
      updateUserPoints(guildId, username, userPoints + winnings - bet); // Ganancia neta
      return message.reply(`🎉 ¡Felicidades! El número fue **${randomNumber} (${resultColor})**. Has ganado **${winnings} VoidCoins**. Ahora tienes **${userPoints + winnings - bet} VoidCoins**.`);
    } else {
      updateUserPoints(guildId, username, userPoints - bet);
      return message.reply(`😢 Lo siento, el número fue **${randomNumber} (${resultColor})**. Has perdido **${bet} VoidCoins**. Ahora tienes **${userPoints - bet} VoidCoins**.`);
    }
  },
};