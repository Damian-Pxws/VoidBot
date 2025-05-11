const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // Cargar variables de entorno desde .env

const encryptionKey = process.env.ENCRYPTION_KEY?.trim(); // Leer la clave desde las variables de entorno
if (!encryptionKey) {
  console.error('❌ ENCRYPTION_KEY no está definido en el archivo .env');
  process.exit(1); // Detener el proceso si la clave no está definida
}

const dbPath = path.join(__dirname, '../../data/voidcoins.json');
const cooldownTime = 15 * 1000; // 15 segundos

// Importar utilidades
const { guardarMensaje } = require('../../utils/msssgscan.js');
const { getPrefix } = require('../../commands/utilidades/prefix.js'); // Importar getPrefix correctamente

// Mapa de cooldowns en memoria
const cooldowns = new Map();

module.exports = (client, message) => {
  if (message.author.bot) return; // Ignorar mensajes de bots

  // Guardar el mensaje en el archivo JSON con cifrado
  guardarMensaje(
    message.author.id,       // ID del usuario
    message.content,         // Contenido del mensaje
    message.channel.id,      // ID del canal
    message.guild?.id || ''  // ID del servidor (o vacío si es un DM)
  );

  // Manejar mensajes directos
  if (!message.guild) {
    console.log(`📩 Mensaje privado recibido de ${message.author.tag}: ${message.content}`);

    // Procesar comandos en mensajes directos
    const prefix = '!'; // Prefijo predeterminado para mensajes directos
    if (!message.content.startsWith(prefix)) {
      return message.reply('Por favor, usa un comando válido que comience con el prefijo `' + prefix + '`.');
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);
    if (!command) {
      return message.reply('❌ No reconozco ese comando.');
    }

    try {
      command.execute(message, args);
    } catch (err) {
      console.error(err);
      message.reply('❌ Error al ejecutar el comando.');
    }
    return;
  }

  // Manejar mensajes en servidores
  const guildId = message.guild.id;
  const username = message.author.username; // Usar el username en lugar del ID
  const now = Date.now();

  // Obtener el prefijo personalizado del servidor
  const prefix = getPrefix(guildId);

  // Verificar cooldown
  const lastMessageTime = cooldowns.get(`${guildId}-${username}`) || 0;
  if (now - lastMessageTime >= cooldownTime) {
    cooldowns.set(`${guildId}-${username}`, now); // Actualizar timestamp

    // Crear archivo si no existe
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(path.dirname(dbPath), { recursive: true });
      fs.writeFileSync(dbPath, '{}');
    }

    // Leer datos
    let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (!data[guildId]) data[guildId] = {};
    if (!data[guildId][username]) {
      data[guildId][username] = { coins: 0, bank: 0 };
    }

    // Sumar moneda
    data[guildId][username].coins += 1;

    // Guardar
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  }

  // Comandos en servidores
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (err) {
    console.error(err);
    message.reply('❌ Error al ejecutar el comando.');
  }
};