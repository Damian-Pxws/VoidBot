const fs = require('fs');
const path = require('path');

const birthdaysPath = path.join(__dirname, '../../data/birthdates.json');

// Asegurarse de que el archivo de cumpleaños existe
function ensureBirthdaysFile() {
  if (!fs.existsSync(birthdaysPath)) {
    fs.writeFileSync(birthdaysPath, '{}'); // Crear el archivo si no existe
  }
}

// Función para guardar el cumpleaños de un usuario
function saveBirthday(userId, guildId, date) {
  ensureBirthdaysFile();
  const data = JSON.parse(fs.readFileSync(birthdaysPath, 'utf8'));
  if (!data[guildId]) {
    data[guildId] = {};
  }
  data[guildId][userId] = date; // Guardar la fecha de cumpleaños
  fs.writeFileSync(birthdaysPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: 'birthday',
  description: 'Guarda tu cumpleaños y crea un evento cuando falten 7 días.',
  async execute(message, args) {
    const guildId = message.guild.id;
    const userId = message.author.id;

    // Verificar si se proporcionó una fecha en formato DD-MM-YYYY
    if (!args[0] || !/^\d{2}-\d{2}-\d{4}$/.test(args[0])) {
      await message.reply('❌ Debes proporcionar tu fecha de cumpleaños en el formato `DD-MM-YYYY`. Ejemplo: `!birthdate 15-05-2000`');
      return message.delete().catch(console.error); // Eliminar el mensaje del comando
    }

    const [day, month, year] = args[0].split('-').map(Number);
    const birthdate = new Date(year, month - 1, day); // Crear la fecha (mes es 0-indexado en JavaScript)

    if (isNaN(birthdate.getTime())) {
      await message.reply('❌ La fecha proporcionada no es válida. Usa el formato `DD-MM-YYYY`.');
      return message.delete().catch(console.error); // Eliminar el mensaje del comando
    }

    // Guardar el cumpleaños
    saveBirthday(userId, guildId, args[0]);

    // Enviar confirmación por mensaje directo
    try {
      await message.author.send(`✅ Tu cumpleaños (${args[0]}) ha sido guardado. ¡Se creará un evento 7 días antes de tu cumpleaños!`);
    } catch (error) {
      console.error('No se pudo enviar el mensaje directo al usuario:', error);
      await message.reply('❌ No se pudo enviar la confirmación por mensaje directo. Verifica que tienes los mensajes directos habilitados.');
    }

    // Eliminar el mensaje del comando
    return message.delete().catch(console.error);
  },
};