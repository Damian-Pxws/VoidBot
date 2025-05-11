const fs = require('fs');
const path = require('path');

const prefixesPath = path.join(__dirname, '../../data/prefixes.json');

// Asegurarse de que el directorio y el archivo existen
function ensurePrefixesFile() {
  const dirPath = path.dirname(prefixesPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true }); // Crear el directorio si no existe
  }
  if (!fs.existsSync(prefixesPath)) {
    fs.writeFileSync(prefixesPath, '{}'); // Crear el archivo si no existe
  }
}

// Función para obtener el prefijo de un servidor
function getPrefix(guildId) {
  ensurePrefixesFile(); // Asegurarse de que el archivo existe
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  return prefixes[guildId] || '!'; // Retorna el prefijo del servidor o el predeterminado
}

// Función para establecer un prefijo para un servidor
function setPrefix(guildId, newPrefix) {
  ensurePrefixesFile(); // Asegurarse de que el archivo existe
  const prefixes = JSON.parse(fs.readFileSync(prefixesPath, 'utf8'));
  prefixes[guildId] = newPrefix; // Actualizar el prefijo del servidor
  fs.writeFileSync(prefixesPath, JSON.stringify(prefixes, null, 2));
}

// Exportar el comando
module.exports = {
  name: 'setprefix',
  description: 'Cambia el prefijo del bot en este servidor.',
  execute(message, args) {
    // Verificar si el comando se ejecuta en un servidor
    if (!message.guild) {
      return message.reply('❌ Este comando solo puede usarse en servidores.');
    }

    // Verificar permisos del usuario
    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('❌ No tienes permisos para cambiar el prefijo.');
    }

    // Verificar si se proporcionó un nuevo prefijo
    const newPrefix = args[0];
    if (!newPrefix) {
      return message.reply('❌ Debes proporcionar un nuevo prefijo. Ejemplo: `!setprefix ?`');
    }

    // Cambiar el prefijo en el servidor
    setPrefix(message.guild.id, newPrefix);

    // Confirmar el cambio al usuario
    return message.reply(`✅ El prefijo ha sido cambiado a \`${newPrefix}\`. Usa \`${newPrefix}comando\` para ejecutar comandos.`);
  },
  getPrefix, // Exportar la función para obtener el prefijo
};